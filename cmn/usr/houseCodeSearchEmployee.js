ii.Import( "fin.cmn.usr.treeView" );
ii.Style( "fin.cmn.usr.treeView" , 99);

if( !ui.lay ){
	ui.lay = {};
}

/* @iiDoc {Class}
 * House Code Selection Template
 */
ii.Class({
	Name: "ui.lay.HouseCodeSearchEmployee",
	Definition: {
		init: function ui_lay_HouseCodeSearchEmployee_init(){
			var me = this;
			
			//pre-condition: parent UI shoud have a DIV named 'houseCodeContainer'
			//add hirNodeArgs & HirNode definition in parent def.js
			//add store definition to parent main.js
			//ii.Import("fin.cmn.usr.houseCodeSearchEmployee"); //import this file in parent main.js.
			//Extends: "ui.lay.HouseCodeSearchEmployee", //add this to class definition
			//me.houseCodeSearch = new ui.lay.HouseCodeSearchEmployee(); // add this line in parent main.js 'init' method.
			//fin.houseCodeSearchUi = fin.parentUi; add this line to parent main.js main() method.
			//@import url('fin/cmn/usr/treeView.css'); 
			//OPTIONAL: 'houseCodesChanged' event handler in parent main.js.

			me.houseHirNodeSelected = 0;
			
			$("#houseCodeContainer").html(
				'<input type="text" id="houseCodeText" class="HouseCodeText" tabindex=6/>'
				+ '<div id="houseCodeTextDropImage" class="HouseCodeDropDown"></div>');

			var houseCodeTreeContainer = '<div id="houseCodeTree" class="HouseCodeTree">'
				+ '<div id="houseCodeLoading" style="position: absolute; width: 66; height: 100;top: 70%; left: 50%; margin-top: -50px; margin-left: -33px">'
				+ '<img src="/fin/cmn/usr/media/Common/loading.gif" alt="Loading"/>'
				+ '<div style="font-family: Verdana, Geneva, Arial, Helvetica, sans-serif; font-size:10px; margin-top:5px; text-align:center;">Loading</div>'    
				+ '</div>'
				+ '<div class="body">'
				+ '<div id="Border">'
				+ '<ul class="treeview" id="ulEditHouseCode0"></ul>'
				+ '</div>'
				+ '</div>'
				+ '<a id="houseCodeTreeClose" class="HouseCodeTreeClose">Close</a>'
				+ '</div>';
		
			$(houseCodeTreeContainer).appendTo($("#appBody"));
			
			fin.HouseCodeMasterUI = me;
			
            $("#houseCodeTextDropImage").click( function(){ //show HouseCode List
				if ($("#houseCodeTree").is(':visible')) {
					$("#houseCodeTree").hide();
					
					return;
				}
				
				fin.HouseCodeMasterUI.houseCodeTreeShow(me.houseHirNodeSelected);
			});

			$("#houseCodeTreeClose").click(function(){ //hide HouseCode List
				$("#houseCodeTree").hide();
			});
			
			$("#houseCodeText").keyup(function(event){

				$("#houseCodeTree").hide();
				if (event.keyCode == 13) {
					fin.HouseCodeMasterUI.houseCodeFetch(this.value); 
				}
			});
			
	        $("#ulEditHouseCode0").treeview({
		        animated: "medium", 
		        persist: "location",
				collapsed: true
	        });			
		},

		houseCodeFetch: function() {
			var args = ii.args(arguments, {
				appUnitBrief: {type: String}
			});
			
			var me = this;
			
			me.houseCodeId = 0;
			
			$("#houseCodeTextDropImage").addClass("HouseCodeDropDownLoader");
			
			fin.houseCodeSearchUi.houseCodeStore.fetch("userId:[user],appUnitBrief:" + args.appUnitBrief + ",", fin.houseCodeSearchUi.houseCodeSearchLoaded, fin.houseCodeSearchUi);
		},
		
		//on click of dropbutton show tree drowndown structure 		
		houseCodeTreeShow: function() {
			var args = ii.args(arguments, {
				nodeSelected: {type: Number}
			});
			
			var me = this;

			var pos;
			var parentElementHeight;

			pos = $("#houseCodeContainer").offset();
			parentElementHeight = $("#houseCodeContainer").outerHeight();

			var left = pos.left + 'px';
			var top = pos.top + parentElementHeight + 'px';

			$("#houseCodeTree").css({
				left: left
				,top: top
			});

			$("#houseCodeTree").show();
			$("#ulEditHouseCode0").html("");

			//ii.trace( "Control right position: " + pos.right, ii.traceTypes.information, "Startup");			

			me.hirNodeInProcess = args.nodeType; // top, current
			$("#houseCodeLoading").show();
			
			me.houseHirNodeSelected = args.nodeSelected;

			fin.houseCodeSearchUi.hirNodeStore.reset();
			fin.houseCodeSearchUi.hirNodeStore.fetch("userId:[user],hierarchy:2,", fin.houseCodeSearchUi.houseHirNodesTreeLoaded, fin.houseCodeSearchUi);
		},

		//build tree structure
		houseHirNodesTreeLoaded: function(me, activeId) {
		
			var index = -1;
		 	var hirNode = 0;
            var hirNodeTitle = "";
            var hirParentNode = 0;
			var childNodeCount = 0;
			var hirLevel = 0;
			
			if(me.houseHirNodeSelected == 0 && me.hirNodes.length > 0) me.houseHirNodeSelected = me.hirNodes[0].id;
			 
			for (index = 0; index < me.hirNodes.length; index++) {
				hirNode = me.hirNodes[index].id;
				hirParentNode = me.hirNodes[index].nodeParentId;
				hirNodeTitle = me.hirNodes[index].title;
				childNodeCount = me.hirNodes[index].childNodeCount;
				hirLevel = me.hirNodes[index].hirLevel;
				
				//set up the edit tree
                //add the item underneath the parent list
				me.houseHirNodeAppend(hirNode, hirNodeTitle, hirParentNode, childNodeCount, hirLevel);
			}			
			
			$("#houseCodeLoading").hide();
		},
		
		houseHirNodeAppend: function(){ //Parent DD
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
		houseHirNodeEventReset: function(){
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
				fin.houseCodeSearchUi.hirNodeStore.fetch("userId:[user],hirNodeParent:" + args.nodeId + ",", fin.houseCodeSearchUi.houseHirNodesTreeLoaded, fin.houseCodeSearchUi);
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
				$("#houseCodeText").val($("#span" + args.hirNode)[0].innerHTML);
				
				me.houseCodeId = 0;
				me.houseCodeStore.fetch("userId:[user],hirNodeId:" + args.hirNode + ",", fin.houseCodeSearchUi.houseCodeSearchLoaded, fin.houseCodeSearchUi);
			}
		},		
		
		houseCodeSearchLoaded: function(me, activeId){
			
			$("#houseCodeTextDropImage").removeClass("HouseCodeDropDownLoader");

			if (me.houseCodes.length <= 0){

				return me.houseCodeSearchError();
			}
			
			me.houseCodeId = me.houseCodes[0].id;
			me.houseCodeTitle = me.houseCodes[0].name;

			me.houseCodeParametersUpdate(false);

			//handles change event in parent main.js.			
			if(me.houseCodeChanged) me.houseCodeChanged();
			
			$("#pageLoading").hide();
		},
		
		houseCodeSearchError: function(){
			var me = this;
			
			alert("There is no corresponding HouseCode available or you do not have enough permission to access it.");
			//alert('Error: Your user account has not setup correctly. Please contact Administrator.');
			me.houseCodeParametersUpdate(true);
			
			return false;
		},
		
		houseCodeParametersUpdate: function(resetParameters){
			var args = ii.args(arguments, {
				resetParameters: {type: Boolean}, 
				houseCode: {type: Object, required: false, defaultValue: null} 
			});
			var me = this;

			if (args.resetParameters) {

				me.houseCodeId = 0;
				me.houseCodeTitle = "";

				$("#houseCodeText").val("");
			}
			else{

				if (args.houseCode) {
					me.houseCodeId = args.houseCode.id;
					me.houseCodeTitle = args.houseCode.name;
				}

				$("#houseCodeText").val(me.houseCodeTitle);
			}
		}
	}
});
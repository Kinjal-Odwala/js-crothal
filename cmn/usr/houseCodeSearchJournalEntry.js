ii.Import( "fin.cmn.usr.treeView" );
ii.Style( "fin.cmn.usr.treeView" , 99);

if( !ui.lay ){
	ui.lay = {};
}

/* @iiDoc {Class}
 * House Code Selection Template
 */
ii.Class({
	Name: "ui.lay.HouseCodeSearchJournalEntry",
	Definition: {
		init: function ui_lay_HouseCodeSearchJournalEntry_init(){
			var me = this;
			
			//pre-condition: parent UI shoud have a DIV named 'houseCodeCreditContainer'
			//add hirNodeArgs & HirNode definition in parent def.js
			//add store definition to parent main.js
			//ii.Import("fin.cmn.usr.houseCodeSearchEmployee"); //import this file in parent main.js.
			//Extends: "ui.lay.HouseCodeSearchJournalEntry", //add this to class definition
			//me.houseCodeSearchCredit = new ui.lay.HouseCodeSearchJournalEntry("Credit"); // add this line in parent main.js 'init' method.
			//fin.houseCodeSearchUi = fin.parentUi; add this line to parent main.js main() method.
			//@import url('fin/cmn/usr/treeView.css'); 
			//OPTIONAL: 'houseCodesChanged' event handler in parent main.js.

			me.houseHirNodeSelected = 0;
			me.houseCodeIdCredit = 0;
			me.houseCodeIdDebit = 0;
			me.houseCodeType = "";
			
			$("#houseCodeCreditContainer").html(
				'<input type="text" id="houseCodeCreditText" class="HouseCodeText" tabindex=0/>'
				+ '<div id="houseCodeCreditStatus" class="iiInputJournal InvalidJournal"></div>'
				+ '<div id="houseCodeCreditTextDropImage" class="HouseCodeDropDown"></div>');
			
			$("#houseCodeDebitContainer").html(
				'<input type="text" id="houseCodeDebitText" class="HouseCodeText" tabindex=0/>'
				+ '<div id="houseCodeDebitStatus" class="iiInputJournal InvalidJournal"></div>'
				+ '<div id="houseCodeDebitTextDropImage" class="HouseCodeDropDown"></div>');

			fin.HouseCodeJEntryUI = me;
			
            $("#houseCodeCreditTextDropImage").click( function(){ //show HouseCode List
				if ($("#houseCodeTree").is(':visible')) {
					$("#houseCodeTree").hide();
					
					return;
				}
				
				fin.HouseCodeJEntryUI.houseCodeTreeShow(me.houseHirNodeSelected, "Credit");
			});
			
            $("#houseCodeDebitTextDropImage").click( function(){ //show HouseCode List
				if ($("#houseCodeTree").is(':visible')) {
					$("#houseCodeTree").hide();
					
					return;
				}
				
				fin.HouseCodeJEntryUI.houseCodeTreeShow(me.houseHirNodeSelected, "Debit");
			});

			$("#houseCodeTreeClose").click(function(){ //hide HouseCode List
				$("#houseCodeTree").hide();
			});
			
			$("#houseCodeCreditText").keyup(function(event){

				$("#houseCodeTree").hide();
				if (event.keyCode == 13) {
					fin.HouseCodeJEntryUI.houseCodeFetch(this.value, "Credit"); 
					$("#houseCodeCreditStatuse").hide();
				}
			});
			
			$("#houseCodeDebitText").keyup(function(event){

				$("#houseCodeTree").hide();
				if (event.keyCode == 13) {
					fin.HouseCodeJEntryUI.houseCodeFetch(this.value, "Debit"); 
					$("#houseCodeDebitStatuse").hide();
				}
			});
		},

		houseCodeFetch: function() {
			var args = ii.args(arguments, {
				appUnitBrief: {type: String},
				houseCodeType: {type: String}
			});
			
			var me = this;
			
			me.houseCodeType = args.houseCodeType;

			if(me.houseCodeType == "Credit") 
				me.houseCodeIdCredit = 0;
			else
				me.houseCodeIdDebit = 0;
			
			$("#houseCode" + me.houseCodeType + "TextDropImage").addClass("HouseCodeDropDownLoader");
			
			fin.houseCodeSearchUi.houseCodeStore.reset();
			fin.houseCodeSearchUi.houseCodeStore.fetch("userId:[user],appUnitBrief:" + args.appUnitBrief + ",", this.houseCodeSearchJournalEntryLoaded, this);
		},
		
		//on click of dropbutton show tree drowndown structure 		
		houseCodeTreeShow: function() {
			var args = ii.args(arguments, {
				nodeSelected: {type: Number},
				houseCodeType: {type: String}
			});
			
			var me = this;

			me.houseCodeType = args.houseCodeType;

			var pos;
			var parentElementHeight;

			pos = $("#houseCode" + me.houseCodeType + "Container").offset();
			parentElementHeight = $("#houseCode" + me.houseCodeType + "Container").outerHeight();

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
				$("#houseCode" + me.houseCodeType + "Text").val($("#span" + args.hirNode)[0].innerHTML);
				
				if(me.houseCodeType == "Credit") 
					me.houseCodeIdCredit = 0;
				else
					me.houseCodeIdDebit = 0;

				fin.houseCodeSearchUi.houseCodeStore.reset();
				fin.houseCodeSearchUi.houseCodeStore.fetch("userId:[user],hirNodeId:" + args.hirNode + ",", this.houseCodeSearchJournalEntryLoaded, this);
			}
		},		
		
		houseCodeSearchJournalEntryLoaded: function(me, activeId){
			
			parent.fin.appUI.modified = true;   
				
			$("#houseCode" + me.houseCodeType + "TextDropImage").removeClass("HouseCodeDropDownLoader");

			if (fin.houseCodeSearchUi.houseCodes.length <= 0){

				return me.houseCodeSearchJournalEntryError();
			}
			
			if (me.houseCodeType == "Credit") {
				me.houseCodeIdCredit = fin.houseCodeSearchUi.houseCodes[0].id;
				me.houseCodeTitleCredit = fin.houseCodeSearchUi.houseCodes[0].name;
				$("#houseCodeCreditStatus").hide();
			}
			else {
				me.houseCodeIdDebit = fin.houseCodeSearchUi.houseCodes[0].id;
				me.houseCodeTitleDebit = fin.houseCodeSearchUi.houseCodes[0].name;
				$("#houseCodeDebitStatus").hide();
			}

			me.houseCodeJournalEntryParametersUpdate(false);

			//handles change event in parent main.js.			
			if(fin.houseCodeSearchUi.houseCodeJournalEntryChanged) fin.houseCodeSearchUi.houseCodeJournalEntryChanged(me.houseCodeType);
			
			$("#pageLoading").hide();
		},
		
		houseCodeSearchJournalEntryError: function(){
			var me = this;
			
			alert("There is no corresponding HouseCode available or you do not have enough permission to access it.");
			//alert('Error: Your user account has not setup correctly. Please contact Administrator.');
			me.houseCodeJournalEntryParametersUpdate(true);
			
			return false;
		},
		
		houseCodeJournalEntryParametersUpdate: function(resetParameters){
			var args = ii.args(arguments, {
				resetParameters: {type: Boolean}, 
				houseCode: {type: Object, required: false, defaultValue: null} ,
				houseCodeType: {type: String, required: false, defaultValue: ""}
			});
			var me = this;

			if(args.houseCodeType != "") 
				me.houseCodeType = args.houseCodeType;
			
			if (args.resetParameters) {

				if (me.houseCodeType == "Credit") {
					me.houseCodeIdCredit = 0;
					me.houseCodeTitleCredit = "";
				}
				else {
					me.houseCodeIdDebit = 0;
					me.houseCodeTitleDebit = "";
				}

				$("#houseCode" + me.houseCodeType + "Text").val("");
			}
			else{

				if (args.houseCode) {

					if (me.houseCodeType == "Credit") {
						me.houseCodeIdCredit = args.houseCode.id;
						me.houseCodeTitleCredit = args.houseCode.name;
					}
					else {
						me.houseCodeIdDebit = args.houseCode.id;
						me.houseCodeTitleDebit = args.houseCode.name;
					}
				}

				if (me.houseCodeType == "Credit")
					$("#houseCode" + me.houseCodeType + "Text").val(me.houseCodeTitleCredit);
				else 
					$("#houseCode" + me.houseCodeType + "Text").val(me.houseCodeTitleDebit);
			}
		}
	}
});
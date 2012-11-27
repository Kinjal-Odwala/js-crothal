ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.tabsPack" );
ii.Import( "fin.emp.employeeMaster.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.dropDown" , 5);
ii.Style( "fin.cmn.usr.dateDropDown" , 6);
ii.Style( "fin.cmn.usr.tabs" , 7);


ii.Class({
    Name: "fin.emp.employeeMaster.UserInterface",
    Definition: {
		
        init: function (){
            
			var args = ii.args(arguments, {});
			var me = this;
			
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
			
			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.session = new ii.Session(me.cache);
			
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);

			me.personNeedUpdate = false;
			me.userNeedUpdate = true;
			me.empGeneralNeedUpdate = true;
			me.payrollNeedUpdate = true;
			me.ptoNeedUpdate = true;
			
			me.personId = queryStringArgs["personId"];
			
			if (queryStringArgs["prevPersonId"] != undefined)
				me.previousPersonId = parseInt(queryStringArgs["prevPersonId"]);
			else
				me.previousPersonId = me.personId;
			
			me.modified = false;
			me.userId = "0";
			me.employeeGeneralId = 0;
			me.ptoId = "0";
			me.activeFrameId = 0;			

			if(parseInt(me.personId) <= 0) {
				$("#TabUser").hide();
				$("#TabGeneral").hide();
				$("#TabPayroll").hide();
				$("#TabPTO").hide();
			}
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\Employees";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);

			// Disable the context menu but not on localhost because its used for debugging
			if( location.hostname != "localhost" ){
				$(document).bind("contextmenu", function(event){
					return false;
				});
			}

			$("#TabCollection a").click(function(me){

				fin.empMasterUi.tabSelected(this.id);				
				
				if (this.id == "TabGeneral" && $("iframe")[2].contentWindow.fin) $("iframe")[2].contentWindow.fin.empGeneralUi.validator.forceBlur();
			});
			
			/* @iiDoc {Function}
			 * Provide a confirmation if unsaved work is present when
			 * the user trys to navigate away.
			 */
			window.onbeforeunload = function(event) {
				if (me.modified) {
					var message = "You will lose unsaved work if you navigate from page now.";
					if( event ){
						event.returnValue = message;
					}
					return message;
				}
    		};

			$("#container-1").tabs(1);
			$("#fragment-1").show();
			$("#fragment-2").hide();  
			$("#fragment-3").hide();
			$("#fragment-4").hide();
			$("#fragment-5").hide();
			$("#TabCollection li").removeClass("tabs-selected");
			$("#TabPerson").parent().addClass("tabs-selected");
        	$("iframe")[0].src = "/esm/ppl/person/usr/markup.htm?personId=" + me.personId;
			
			me.employeeGeneralStore.fetch("userId:[user],personId:" + me.personId + "," , me.employeeGeneralsLoaded, me);			
			me.employeeValidationStore.fetch("userId:[user],employeeId:0", me.validationsLoaded, me);					
        },
		
		authorizationProcess: function fin_emp_employeeMaster_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			if(me.isAuthorized)
				$("#pageLoading").hide();
			else{
				$("#messageToUser").html("Unauthorized");
				alert("You are not authorized to view this content. Please contact your Administrator.");
				return false;
			}

			me.employeeWrite = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\Write');
			me.employeeReadOnly = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\Read');
			if(me.employeeReadOnly){
				$("#actionMenu").hide();
			}
		
			me.tabPersonShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\TabPerson');
			me.tabUserShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\TabUser');
			me.tabGeneralShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\TabGeneral');
			me.tabPayrollShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\TabPayroll');
			me.tabPTOShow = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath + '\\TabPTO');

			if(!me.tabUserShow && !me.employeeReadOnly && !me.employeeWrite)
				$("#TabUser").hide();
			else //when child nodes under Employee>tabs are not selected
				me.tabUserShow = true;

			if(!me.tabGeneralShow && !me.employeeReadOnly && !me.employeeWrite)
				$("#TabGeneral").hide();
			else
				me.tabGeneralShow = true;

			if(!me.tabPayrollShow && !me.employeeReadOnly && !me.employeeWrite)
				$("#TabPayroll").hide();
			else
				me.tabPayrollShow = true;

			if(!me.tabPTOShow && !me.employeeReadOnly && !me.employeeWrite)
				$("#TabPTO").hide();
			else
				me.tabPTOShow = true;
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_emp_employeeMaster_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			var me = args.me;
			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function(){
			var args = ii.args(arguments,{});
			var me = this;		
			var offset = 90;

		    $("#iFramePerson").height($(window).height() - offset);
		    $("#iFrameUser").height($(window).height() - offset);
		    $("#iFrameEmployee").height($(window).height() - offset);
		    $("#iFramePerformer").height($(window).height() - offset);
		    $("#iFrame1").height($(window).height() - offset);
		},
		
		defineFormControls: function(){
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});  
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save Employee ( Ctrl+S )", 
					title: "Save the current Employee.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New Employee ( Ctrl+N )", 
					title: "Add a new Employee.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo Employee Changes ( Ctrl+U )", 
					title: "Undo the changes to Employee being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				})
				.addAction({
					id: "searchAction", 
					brief: "Search Employee", 
					title: "Search for existing Employee.",
					actionFunction: function() { me.actionSearchItem(); }
				});
		},
		
		configureCommunications: function () {
			var args = ii.args(arguments, {});			
			var me = this;
			
			me.employeeValidations = [];
			me.employeeValidationStore = me.cache.register({
				storeId: "employeeValidations",
				itemConstructor: fin.emp.employeeMaster.EmployeeValidation,
				itemConstructorArgs: fin.emp.employeeMaster.employeeValidationArgs,
				injectionArray: me.employeeValidations	
			});
			
			me.employeeGenerals = [];
			me.employeeGeneralStore = me.cache.register({
				storeId: "employeeGenerals",
				itemConstructor: fin.emp.employeeMaster.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeMaster.employeeGeneralArgs,
				injectionArray: me.employeeGenerals	
			});
		},

		itemModified: function emp_employeeMaster_UserInterface_itemModified(){
			var args = ii.args(arguments, {modified: {type: Boolean, required: false, defaultValue: true}});
			var me = this;
			me.modified = args.modified;			
		},
		
		validationsLoaded: function(me, activeId) {
			
			if (me.personId <= 0) {
				if (me.employeeValidations.length > 0) {				
					if (me.employeeValidations[0].hrBlackOutPeriod > 0 && me.employeeValidations[0].hrBlackOutPeriod <= 37) {
						window.location = "/fin/emp/employeeSearch/usr/markup.htm";
						alert("Employee may not be added or modified during the Payroll Blackout. The Payroll Blackout start date is expected to be Sunday at 12 AM and the end date is expected to be 37 hours later. Please visit after [" + me.employeeValidations[0].hrBlackOutPeriod + "] hours.");
					}
				}				
			}
			
			$("#pageLoading").hide();
		},
		
		employeePayrollShow: function(){			
			var me = this;
			
			me.employeeGeneralStore.fetch("userId:[user],personId:" + me.personId + "," , me.employeeGeneralsLoaded, me);
		},		
	
		employeeGeneralsLoaded: function(me, activeId) {
			
			var index = 0;			
			
			if (me.employeeGenerals.length > 0) {
								
				me.employeeGeneralId = me.employeeGenerals[0].id;
				me.personId = me.employeeGenerals[0].personId;
				if(me.tabPayrollShow) $("#TabPayroll").show();
			}
			else	
				$("#TabPayroll").hide();
			
		},
		
		//this is to handle Payroll tab when Employee is new, called from EmployeeGeneral UI main.js
		showPayrollTab: function(){
			var args = ii.args(arguments, {employeeGeneralId:{type: Number}});
			
			var me = this;
			
			me.employeeGeneralId = args.employeeGeneralId;
			
			if (me.employeeGeneralId > 0)
				if(me.tabPayrollShow) $("#TabPayroll").show();
			else	
				$("#TabPayroll").hide();				
		},
		
		tabSelected: function(){
			var args = ii.args(arguments, {id:{type: String}});
			var me = this;
			/*
			if (fin.empGeneralUi != undefined) {
				if (fin.empGeneralUi.payrollSavingRequired == true) {
					args.id == "TabPayroll"
				}
			}
			*/
			me.personId = $("iframe")[0].contentWindow.esm.pplPersonUi.personId;
	
			if (args.id == "TabPerson") {

				me.activeFrameId = 0;
				if (me.personNeedUpdate) {
					me.personNeedUpdate = false;
					$("iframe")[0].src = "/esm/ppl/person/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (args.id == "TabUser") {

				me.activeFrameId = 1;
				if (me.userNeedUpdate) {
					me.userNeedUpdate = false;
					$("iframe")[1].src = "/esm/app/user/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (args.id == "TabGeneral") {

				me.activeFrameId = 2;
				
				if ($("iframe")[2].contentWindow.fin != undefined) {
					var employeeGeneral = $("iframe")[2].contentWindow.fin.empGeneralUi;
					if (employeeGeneral != undefined) {
						if(employeeGeneral.employeeGenerals.length > 0 && employeeGeneral.employeeGenerals[0].primaryState == 0) {
							me.payrollNeedUpdate = true;				
						}
					}		
				}
				if (me.empGeneralNeedUpdate) {
					me.empGeneralNeedUpdate = false;
					$("iframe")[2].src = "/fin/emp/employeeGeneral/usr/markup.htm?personId=" + me.personId;
				}
			}
			else if (args.id == "TabPayroll") {

				me.activeFrameId = 3;
				if (me.payrollNeedUpdate) {
					me.payrollNeedUpdate = false;					
					$("iframe")[3].src = "/fin/emp/employeePayroll/usr/markup.htm?personId=" + me.personId;
					$("#container-1").triggerTab(4);
					//$('#container-1').tabs(4);
				}
			}
			else if (args.id == "TabPTO") {

				me.activeFrameId = 4;
				if (me.ptoNeedUpdate) {
					me.ptoNeedUpdate = false;
					$("iframe")[4].src = "/fin/emp/employeePTO/usr/markup.htm?personId=" + me.personId;
				}
			}		
		},
		
		showOtherTabs: function(){
			var me = this;			
			
			if(me.tabUserShow)
				$("#TabUser").show();
			
			if(me.tabGeneralShow) $("#TabGeneral").show();
			
			if (me.employeeGeneralId > 0)
				if(me.tabPayrollShow) $("#TabPayroll").show();
			else	
				$("#TabPayroll").hide();
				
			if(me.tabPTOShow) $("#TabPTO").show();

			if (me.tabUserShow) {
				$("#TabCollection li").removeClass("tabs-selected");
				$("#TabUser").parent().addClass("tabs-selected");
				
				$("#fragment-" + (me.activeFrameId + 1)).hide();
				$("#fragment-" + (me.activeFrameId + 2)).show();
				
				me.tabSelected('TabUser');
			}			
		},
		
		controlKeyProcessor: function ii_ui_Layouts_ListItem_controlKeyProcessor(){
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});
			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if( event.ctrlKey ){
				
				switch( event.keyCode )
				{
					case 83: // Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;

					case 78: //Ctrl+N
						me.actionNewItem();
						processed = true;
						break;

					case 85: //Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
			}
			
			if( processed ){
				return false;
			}
		},
		
		getPersonState: function(){
			var me = this;
			
			if ($("iframe")[0].contentWindow.esm) {

				me.employeePerson = $("iframe")[0].contentWindow.esm.pplPersonUi;
				return me.employeePerson.states[me.employeePerson.personState.indexSelected].id;
			}
			
			return 0;
		},
		
		getPersonBrief: function(){
			var me = this;
			
			if ($("iframe")[0].contentWindow.esm) {

				return $("iframe")[0].contentWindow.esm.pplPersonUi.personBrief.getValue();
			}
			
			return "";
		},
		
		getPersonHirNode: function esm_ppl_master_UserInterface_getPersonHirNode(){
			var me = this;
			
			if ($("iframe")[0].contentWindow.esm) {

				return $("iframe")[0].contentWindow.esm.pplPersonUi.hirNode;
			}
			
			return "";
		},
		
		actionSaveItem: function () {
			var args = ii.args(arguments,{});
			var me = this;
				
			switch (me.activeFrameId){
				
				case 0:
					$("iframe")[0].contentWindow.esm.pplPersonUi.actionSaveItem();
					break;
					
				case 1:
					$("iframe")[1].contentWindow.esm.appUserUi.actionSaveItem();
					break;
					
				case 2:
					$("iframe")[2].contentWindow.fin.empGeneralUi.actionSaveItem();
					break;

				case 3:
					$("iframe")[3].contentWindow.fin.empPayrollUi.actionSaveItem();
					break;					
					
				case 4:
					$("iframe")[4].contentWindow.fin.empPTOUi.actionSaveItem();
					break;
			}
		},

		actionNewItem: function (){
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.employeeValidations.length > 0) {
			
				if (me.employeeValidations[0].hrBlackOutPeriod > 0 && me.employeeValidations[0].hrBlackOutPeriod <= 37)
				{
                    alert("Employee may not be added or modified during the Payroll Blackout. The Payroll Blackout start date is expected to be Sunday at 12 AM and the end date is expected to be 37 hours later. Please visit after [" + me.employeeValidations[0].hrBlackOutPeriod + "] hours.");
					return;  // remove coment
				}
			}	

			me.personId = 0;
			$('#container-1').tabs(1);
			window.location = "/fin/emp/employeeMaster/usr/markup.htm?personId=" + me.personId + "&prevPersonId=" + me.previousPersonId;
		},
		
		actionUndoItem: function (){
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.activeFrameId == 0) {
				if (me.personId == 0)
					window.location = "/fin/emp/employeeMaster/usr/markup.htm?personId=" + me.previousPersonId;
				else
					$("iframe")[0].contentWindow.esm.pplPersonUi.actionUndoItem();
			}
			else if (me.activeFrameId == 1) 
				$("iframe")[1].contentWindow.esm.appUserUi.actionUndoItem();
			else if (me.activeFrameId == 2) 
				$("iframe")[2].contentWindow.fin.empGeneralUi.actionUndoItem();
			else if (me.activeFrameId == 3) 
				$("iframe")[3].contentWindow.fin.empPayrollUi.actionUndoItem();
			else if ([me.activeFrameId] == 4) 
				$("iframe")[4].contentWindow.fin.empPTOUi.actionUndoItem();
		},
		
		actionSearchItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			window.location = "/fin/emp/employeeSearch/usr/markup.htm";
		},

		saveResponseEmployee: function (){
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	// The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"}							// The XML transaction node associated with the response.
			});

			if(fin.empMasterUi.employeeGeneral) fin.empMasterUi.employeeGeneral.resetUIControls("2");
			if(fin.empMasterUi.employeePayroll) fin.empMasterUi.employeePayroll.resetUIControls("2");

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

				if (fin.empMasterUi.employeeGeneral) {
					fin.empMasterUi.employeeGeneral.resetUIControls("3");
					
					//new or updated employee Id					
					fin.empMasterUi.employeeGeneral.employeeGeneralId = parseInt(args.xmlNode.firstChild.attributes[0].nodeValue);
					
					if (fin.empMasterUi.employeeGeneral.newEmployeeNumber > 0) 
						successMessage += "Employee Number " + fin.empMasterUi.employeeGeneral.newEmployeeNumber + " has been created and will be transmitted to Ceridian on Monday at 1:00 PM EST.\n";
					
					if (fin.empMasterUi.employeeGeneral.employeeGenerals.length > 0) {
						if (fin.empMasterUi.employeeGeneral.statusTypes[fin.empMasterUi.employeeGeneral.employeeStatusType.indexSelected].id != fin.empMasterUi.employeeGeneral.employeeGenerals[0].statusType) 
							successMessage += "Employee status updates will be transmitted to Ceridian on Monday at 1:00PM EST.\n";
					}
				}

				if (fin.empMasterUi.employeePayroll) {
					fin.empMasterUi.employeePayroll.employeePayrollId = parseInt(args.xmlNode.firstChild.attributes[0].nodeValue);
				}					
				
				if (successMessage.length > 0) alert(successMessage);
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

	fin.empMasterUi = new fin.emp.employeeMaster.UserInterface();
	fin.empMasterUi.resize();
}


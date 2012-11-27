ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.glm.recurringExpenses.usr.defs" );
ii.Import( "fin.cmn.usr.houseCodeSearch" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);

ii.Class({
    Name: "fin.glm.recurringExpenses.UserInterface",
	Extends: "ui.lay.HouseCodeSearch",
    Definition: {
	
		init: function fin_glm_recurringExpenses_UserInterface_init() {
			var args = ii.args(arguments, {});
			var me = this;

			if(!parent.fin.appUI.houseCodeId) parent.fin.appUI.houseCodeId = 0;
			
			me.period = -1;
			me.fiscalYear = -1;
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
			me.status = "";			
				
			me.replaceContext = false;        // replace the system context menu?
			me.mouseOverContext = false;      // is the mouse over the context menu?
			me.noContext = true;              // disable the context menu?		
			
			me.gateway = ii.ajax.addGateway("glm", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "\\crothall\\chimes\\fin\\GeneralLedger\\RecurringExpenses";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master(); //@iiDoc {Property:ui.ctl.Input.Validation.Master} The recurring expense validation master.
			me.session = new ii.Session(me.cache);
						
			me.defineFormControls();
			me.configureCommunications();

			me.houseCodeSearch = new ui.lay.HouseCodeSearch();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(document).bind("mousedown", me, me.mouseDownProcessor);
			$(document).bind("contextmenu", me, me.contextMenuProcessor);
			
			me.intervalStore.fetch("userId:[user]", me.typesLoaded, me);
			me.recFiscal.fetchingData();
			me.recPeriod.fetchingData();
			me.yearStore.fetch("userId:[user],", me.yearsLoaded, me);			
			//me.weekPeriodYearStore.fetch("userId:[user],", me.weekPeriodYearsLoaded, me);
			me.weekPeriodYearsLoaded(me, 0);
		},
		
		authorizationProcess: function fin_glm_recurringExpenses_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.recurringExpensesReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			$("#pageLoading").hide();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_glm_recurringExpenses_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;

			$("#recurringExpsGridScroll").height($(window).height() - 65);			
		},
		
		contextMenuProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if (me.noContext || me.mouseOverContext || me.rowBeingEdited)
		        return;
		
		    // IE doesn't pass the event object
		    if (event == null)
		        event = window.event;
		
		    // we assume we have a standards compliant browser, but check if we have IE
		    var target = event.target != null ? event.target : event.srcElement;
		
		    if (me.replaceContext)
		    {
		        // document.body.scrollTop does not work in IE
		        var scrollTop = document.body.scrollTop ? document.body.scrollTop :
		            document.documentElement.scrollTop;
		        var scrollLeft = document.body.scrollLeft ? document.body.scrollLeft :
		            document.documentElement.scrollLeft;
		
		        // hide the menu first to avoid an "up-then-over" visual effect
				var contextMenu = document.getElementById('RecurringExpsContext');

				contextMenu.style.display = "none";
				contextMenu.style.top = event.clientY + scrollTop + "px";
				contextMenu.style.left = event.clientX + scrollLeft + "px";
				contextMenu.style.display = "";			
		
		        me.replaceContext = false;
		
		        return false;
		    }
		},
		
		mouseDownProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (mousedown) event object
			});			
			var event = args.event;
			var me = event.data;
			
			if(event.button == 2)
				me.replaceContext = true;
			else if (!me.mouseOverContext)
				$("#RecurringExpsContext").hide();
		},
		
		controlKeyProcessor: function () {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {
					case 78: // Ctrl+N
						me.recurringExpsGridRowAdd();
						processed = true;
						break;
						
					case 83: //Ctrl+S
						me.actionSaveItem();
						processed = true;
						break;

					case 85: //Ctrl+U
						me.actionUndoItem();
						processed = true;
						break;
				}
				
				if (processed) {
					return false;
				}
			}
		},
		
		defineFormControls: function() {
			var me = this;
			
			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
			
			me.actionMenu
				.addAction({
					id: "newAction",
					brief: "Add New (Ctrl+N)", 
					title: "Add new Recurring Expenses.",
					actionFunction: function() { me.recurringExpsGridRowAdd(); }
				})
				.addAction({
					id: "saveAction",
					brief: "Save (Ctrl+S)",
					title: "Save the Recurring Expenses.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancel",
					brief: "Undo (Ctrl+U)",
					title: "Undo the changes to Recurring Expenses being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});
		    
			me.recPeriod = new ui.ctl.Input.DropDown.Filtered({
				id: "RecPeriod",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.periodChanged(); }
			});	
			
			me.recFiscal = new ui.ctl.Input.DropDown.Filtered({
				id: "RecFiscal",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.yearChanged(); }
			});
			
			me.loadButton = new ui.ctl.buttons.Sizeable({
				id: "LoadButton",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Load&nbsp;&nbsp;</span>",
				hasHotState: true,
				clickFunction: function() { me.loadExpenses(); }
			});
		},
		
			resizeControls: function() {
			var me = this;
			
			me.recPeriod.resizeText();
			me.recFiscal.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_glm_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.hirNodes = [];
			me.hirNodeStore = me.cache.register({
				storeId: "hirNodes",
				itemConstructor: fin.glm.recurringExpenses.HirNode,
				itemConstructorArgs: fin.glm.recurringExpenses.hirNodeArgs,
				injectionArray: me.hirNodes
			});
			
			me.houseCodes = [];
			me.houseCodeStore = me.cache.register({
				storeId: "hcmHouseCodes",
				itemConstructor: fin.glm.recurringExpenses.HouseCode,
				itemConstructorArgs: fin.glm.recurringExpenses.houseCodeArgs,
				injectionArray: me.houseCodes
			});
			
			me.houseCodeJobs = [];
			me.houseCodeJobStore = me.cache.register({
				storeId: "houseCodeJobs",
				itemConstructor: fin.glm.recurringExpenses.HouseCodeJob,
				itemConstructorArgs: fin.glm.recurringExpenses.houseCodeJobArgs,
				injectionArray: me.houseCodeJobs
			});
			
			me.years = [];
			me.yearStore = me.cache.register({
				storeId: "fiscalYearMasters",
				itemConstructor: fin.glm.recurringExpenses.Year,
				itemConstructorArgs: fin.glm.recurringExpenses.yearArgs,
				injectionArray: me.years
			});	
									
			me.periods = [];
			me.periodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.glm.recurringExpenses.Period,
				itemConstructorArgs: fin.glm.recurringExpenses.periodArgs,
				injectionArray: me.periods
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.glm.recurringExpenses.Account,
				itemConstructorArgs: fin.glm.recurringExpenses.accountArgs,
				injectionArray: me.accounts	
			});
			
			me.intervalTypes = [];
			me.intervalStore = me.cache.register({
				storeId: "intervalTypes",
				itemConstructor: fin.glm.recurringExpenses.IntervalType,
				itemConstructorArgs: fin.glm.recurringExpenses.intervalTypeArgs,
				injectionArray: me.intervalTypes
			});
			
			me.expenses = [];
			me.expenseStore = me.cache.register({
				storeId: "recurringExpenses",
				itemConstructor: fin.glm.recurringExpenses.RecurringExpense,
				itemConstructorArgs: fin.glm.recurringExpenses.recurringExpenseArgs,
				injectionArray: me.expenses
			});
		},
		
		houseCodeJobsLoaded: function(me, activeId) {
			
		},	
	
		typesLoaded: function (me, activeId) {
			//do nothing.
		},
		
		weekPeriodYearsLoaded: function(me, activeId) {
				var me = this;
			ii.trace("Recurring Expenses - weekPeriodYearsLoaded", ii.traceTypes.information, "Startup");			
			
			if(parent.fin.appUI.houseCodeId == 0) //usually happens on pageLoad
				me.houseCodeStore.fetch("userId:[user],defaultOnly:true,", me.houseCodesLoaded, me);
			else
				me.houseCodesLoaded(me, 0);		
		},
		
		yearsLoaded: function(me, activeId) { //Fiscal Years
		
			
			me.years.unshift(new fin.glm.recurringExpenses.Year({ id: -1, number: -1, name: "[ALL]" }));
  			me.recFiscal.setData(me.years);
			
			if(parent.fin.appUI.glbFscYear != undefined){
				index = ii.ajax.util.findIndexById(parent.fin.appUI.glbFscYear.toString(), me.years);
				if (index != undefined) 
					me.recFiscal.select(index, me.recFiscal.focused);
			}	
			//me.recFiscal.select(0, me.recFiscal.focused);				
			me.fiscalYear = me.recFiscal.data[me.recFiscal.indexSelected].id;	
			
			me.periodsLoaded(me, 0);
		},
				
		yearChanged: function() {
			var me = this;
			
			if (me.recFiscal.indexSelected) {
				parent.fin.appUI.glbFscYear = me.recFiscal.data[me.recFiscal.indexSelected].id;
			}
			me.fiscalYear = me.recFiscal.data[me.recFiscal.indexSelected].id;
			me.recPeriod.fetchingData();
			me.periodStore.fetch("userId:[user],fiscalYearId:" + me.fiscalYear, me.periodsLoaded, me);			
		},
		
		periodsLoaded: function(me, activeId) { //Fiscal Periods
				
			if (me.periods.length == 0 || me.periods[0].id != -1)		
				me.periods.unshift(new fin.glm.recurringExpenses.Period({ id: -1, number: -1, name: "[ALL]" }));
				
			me.recPeriod.setData(me.periods);
			me.recPeriod.select(0, me.recPeriod.focused);
			
			me.period = me.recPeriod.data[me.recPeriod.indexSelected].id;
		},
		
		periodChanged: function() {
			var me = this;
			
			if (me.recPeriod.indexSelected) {
				parent.fin.appUI.glbPeriod = me.recPeriod.data[me.recPeriod.indexSelected].id;
				me.period = me.recPeriod.data[me.recPeriod.indexSelected].id;				
			}			
		},
		
		houseCodesLoaded: function(me, activeId) {
			
			if (parent.fin.appUI.houseCodeId == 0) {
				if (me.houseCodes.length <= 0) {
				
					return me.houseCodeSearchError();
				}
				
				me.houseCodeGlobalParametersUpdate(false, me.houseCodes[0]);
			}

			me.houseCodeGlobalParametersUpdate(false);
				
			if(parent.fin.appUI.glbFscYear != undefined){
				var index = ii.ajax.util.findIndexById(parent.fin.appUI.glbFscYear.toString(), me.years);
				if (index != undefined) 
					me.recFiscal.select(index, me.recFiscal.focused);
			}				
			
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);	
			me.accountStore.fetch("userId:[user],moduleId:recurringExpense,houseCode:" + parent.fin.appUI.houseCodeId + ",yearId:" + parent.fin.appUI.glbFscYear, me.accountsLoaded, me);
		},
		
		accountsLoaded: function (me, activeId) {
			
			me.loadExpenses();
		},
		
		houseCodeChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").show();
			
			if(parent.fin.appUI.glbFscYear != undefined){
				var index = ii.ajax.util.findIndexById(parent.fin.appUI.glbFscYear.toString(), me.years);
				if (index != undefined) 
					me.recFiscal.select(index, me.recFiscal.focused);
			}	
					
			me.yearChanged();
			me.houseCodeJobStore.fetch("userId:[user],houseCodeId:" + parent.fin.appUI.houseCodeId, me.houseCodeJobsLoaded, me);
			me.accountStore.fetch("userId:[user],moduleId:recurringExpense,houseCode:" + parent.fin.appUI.houseCodeId + ",yearId:" + parent.fin.appUI.glbFscYear, me.accountsLoaded, me);
		},
		
		loadExpenses: function() {
			var me = this;
			
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
			
			if (parent.fin.appUI.houseCodeId == 0) {
				alert("Please select House Code.");
				return;
			}
			
			$("#messageToUser").text("Loading");			
			$("#pageLoading").show();
		
			me.expenseStore.fetch("userId:[user],houseCode:" + parent.fin.appUI.houseCodeId + ",year:" + me.fiscalYear + ",period:" + me.period, me.expensesLoaded, me);
		},
		
		getJobTitle: function(id) {
			var me = this;
			var jobTitle = "";
			var index = 0;
	
			index = ii.ajax.util.findIndexById(id.toString(), me.houseCodeJobs);
	
			if(index >= 0 && index != undefined)
				jobTitle = me.houseCodeJobs[index].jobNumber + " - " + me.houseCodeJobs[index].jobTitle;

			return jobTitle == "" ? "&nbsp;" : jobTitle;
		},
		
		getAccountNumberName: function(id) {
			var me = this;
			var accountNumberName = "";
		
			for (var index = 0; index < me.accounts.length; index++) {
				if (me.accounts[index].id == id) {
					accountNumberName = me.accounts[index].code + " - " + me.accounts[index].description;
					break;
				}
			}	

			if (accountNumberName == "")
				return "&nbsp;"
			else
				return accountNumberName;
		},
				
		expensesLoaded: function(me, activeId) {
			var rowNumber = 0;
			var rowHtml = "";	
			
			if(me.recurringExpensesReadOnly){
				$("#actionMenu").hide();
				$("#spacing").hide();
				$("#RecurringExpsContextMenu").hide();
			}			
			
			for(rowNumber = 0; rowNumber < me.expenses.length; rowNumber++) {
				rowHtml += "<tr>";

				rowHtml += me.getRecurringExpsGridRow(
				rowNumber + 1
				, false
		        , me.getAccountNumberName(me.expenses[rowNumber].fscAccountTo)
				, me.getJobTitle(me.expenses[rowNumber].houseCodeJobTo)
				, me.expenses[rowNumber].amount == "0" || me.expenses[rowNumber].amount == "0.00" ? "&nbsp;" : me.expenses[rowNumber].amount
				, me.expenses[rowNumber].percent == "0" || me.expenses[rowNumber].percent == "0.00" ? "&nbsp;" : me.expenses[rowNumber].percent + " %"
				, me.getAccountNumberName(me.expenses[rowNumber].fscAccountFrom)
				, me.getJobTitle(me.expenses[rowNumber].houseCodeJobFrom)
				, me.expenses[rowNumber].intervalType == "0" ? "&nbsp;" : me.intervalTypes[me.expenses[rowNumber].intervalType - 1].name
				, "No"
				);
				
				rowHtml += "</tr>";
			}
			
			$("#RecurringExpsGrid tbody").html(rowHtml);
			
			me.recurringExpensesGridEventSetup(me);
			
			$("#pageLoading").hide();
			me.resizeControls();
		},
		
		recurringExpensesGridEventSetup: function(me) {
								
			$("#RecurringExpsGrid tr:odd").addClass("gridRow");
        	$("#RecurringExpsGrid tr:even").addClass("alternateGridRow");
			
			$("#RecurringExpsGrid tr").mouseover(function() {
				$(this).addClass("trover");}).mouseout(function() {
					$(this).removeClass("trover");});
					
			$("#RecurringExpsContextMenu tr:odd").addClass("gridRow");
        	$("#RecurringExpsContextMenu tr:even").addClass("alternateGridRow"); 

			$("#RecurringExpsContextMenu tr").mouseover(function() { 
				$(this).addClass("trover");}).mouseout(function() { 
					$(this).removeClass("trover");});
						
			$("#RecurringExpsContextMenu tr").click(function() {

				if(this.id == 'menuAdd')
					me.recurringExpsGridRowAdd();
				else if(this.id == 'menuEdit')
					me.recurringExpsGridRowEdit();
				else if(this.id == 'menuDelete')
					me.recurringExpsGridRowDelete();
					
				$("#RecurringExpsContext").hide();
			});
	
			$("#RecurringExpsGridBody td").mousedown(function() {

				if(me.rowBeingEdited) return;
				
				if (this.cellIndex >= 0 && this.cellIndex <= 8) {
					me.currentRowSelected = this.parentNode;
				}
				else {
					me.currentRowSelected = null;
				}
			});
			
			$("#RecurringExpsGridBody").mouseover(function() { 
				me.noContext = false;}).mouseout(function() { 
					me.noContext = true;});
			
			$("#RecurringExpsContext").mouseover(function() { 
				me.mouseOverContext = true;}).mouseout(function() { 
					me.mouseOverContext = false; });
		},
		
		getRecurringExpsGridRow: function() {
			var args = ii.args(arguments, {
				rowNumber: {type: Number}
				, rowEditable: {type: Boolean}
				, applyTo: {type: String}
				, jobTo: {type: String}
				, amount: {type: String}
				, percent: {type: String}
				, percentageOf: {type: String}
				, jobFrom: {type: String}
				, interval: {type: String}
				, readOnly: {type: String}
			});
			var me = this;
			var rowHtml = "";
		
			if(args.rowEditable) {
				// Row Editable
				rowHtml += me.getEditableRowColumn(false, 0, "rowNumber", args.rowNumber.toString(), 3);
				rowHtml += me.getEditableRowColumn(true, 1, "applyTo", args.applyTo, 20, "dropdown", me.accounts);
				rowHtml += me.getEditableRowColumn(true, 2, "jobTo", args.jobTo, 13, "dropdown", me.houseCodeJobs);
				rowHtml += me.getEditableRowColumn(true, 3, "amount", args.amount, 9);
				rowHtml += me.getEditableRowColumn(true, 4, "percent", args.percent, 4);
				rowHtml += me.getEditableRowColumn(true, 5, "percentageOf", args.percentageOf, 20, "dropdown", me.accounts);
				rowHtml += me.getEditableRowColumn(true, 6, "jobFrom", args.jobFrom, 13, "dropdown", me.houseCodeJobs);
				rowHtml += me.getEditableRowColumn(true, 7, "intervalType", args.interval, 8, "dropdown", me.intervalTypes);
				rowHtml += me.getEditableRowColumn(false, 8, "readOnly", args.readOnly, 10);
			}
			else {
				rowHtml += me.getEditableRowColumn(false, 0, "rowNumber", args.rowNumber.toString(), 3);
		        rowHtml += me.getEditableRowColumn(false, 1, "applyTo", args.applyTo, 20);
				rowHtml += me.getEditableRowColumn(false, 2, "jobTo", args.jobTo, 13);
		        rowHtml += me.getEditableRowColumn(false, 3, "amount", args.amount, 9);
		        rowHtml += me.getEditableRowColumn(false, 4, "percent", args.percent, 4);
		        rowHtml += me.getEditableRowColumn(false, 5, "percentageOf", args.percentageOf, 20);
				rowHtml += me.getEditableRowColumn(false, 6, "jobTo", args.jobFrom, 13);
		        rowHtml += me.getEditableRowColumn(false, 7, "intervalType", args.interval, 8);
		        rowHtml += me.getEditableRowColumn(false, 8, "readOnly", args.readOnly, 10);
			}

			return rowHtml;
		},
		
		getEditableRowColumn: function() {
			var args = ii.args(arguments, {
				editable: {type: Boolean}
				, columnNumber: {type: Number}
				, columnName: {type: String}
				, columnValue: {type: String}
				, columnWidth: {type: Number}
				, columnType: {type: String, defaultValue: ""}
				, columnData: {type: Array, defaultValue: []}
				});
			var me = this;
			
			if(args.editable) {
				if (args.columnType == "dropdown")
					return "<td class='gridColumn' width='" + args.columnWidth + "%'>" + me.populateDropDown(args.columnData, args.columnName, args.columnValue) + "</td>";				
				else if (args.columnName == "amount" || args.columnName == "percent")
					return "<td class='gridColumn' align='center' width='" + args.columnWidth + "%'><input type=text style='width:95%; text-align:right;' maxlength='18' id='" + args.columnName + "' value='" + args.columnValue + "'></input></td>";
			}
			else {
				if (args.columnName == "rowNumber" || args.columnName == "amount" || args.columnName == "percent")
					return "<td class='gridColumn' width='" + args.columnWidth + "%' style='text-align:right;'>" + args.columnValue + "</td>";
				else
					return "<td class='gridColumn' width='" + args.columnWidth + "%'>" + args.columnValue + "</td>";
			}
		},
		
		populateDropDown: function() {
			var args = ii.args(arguments, {
				data: {type: Array}
				, columnName: {type: String}
				, columnValue: {type: String}
			});				
			var me = this;
			var rowHtml = "";
			var title = "";
			
			rowHtml = "<select id='" + args.columnName + "' style='width:100%;'>"
			
			for (var index = 0; index < args.data.length; index++) {
				if (args.columnName == "jobTo" || args.columnName == "jobFrom")
					title = args.data[index].jobNumber + " - " + args.data[index].jobTitle;
				else if (args.columnName == "intervalType")
					title = args.data[index].name;
				else
					title = args.data[index].code + " - " + args.data[index].description;
					
				if (args.columnValue == title)
					rowHtml += "	<option title='" + title + "' value='" + args.data[index].id + "' selected>" + title + "</option>";
				else
					rowHtml += "	<option title='" + title + "' value='" + args.data[index].id + "'>" + title + "</option>";
			}
			
			rowHtml += "</select>"
			
			return rowHtml;
		},
		
		recurringExpsGridRowAdd: function() {
			var me = this;
			var rowHtml = "<tr>";
			
			if(me.recurringExpensesReadOnly) return;
			
			if(me.rowBeingEdited) 
				return;
						
		    rowHtml += me.getRecurringExpsGridRow(
		        me.expenses.length + 1
				, true // Editing Row
		        , ""
				, ""
				, ""
			    , ""
			    , ""
			    , ""
			    , ""
			    , "No"
		        )
				
		    rowHtml += "</tr>";
			   
			$("#RecurringExpsGrid tbody").append(rowHtml);
			me.recurringExpensesGridEventSetup(me);		 
			me.status = "Add";
			me.rowBeingEdited = true;
			me.currentRowSelected = $("#RecurringExpsGrid tr:last")[0];
			me.validateControls();
		},

		recurringExpsGridRowEdit: function() {
			var me = this;
			var rowHtml = "";
			var amountValue = "";
			var percentValue = "";
			
			if(me.rowBeingEdited) 
				return;
				
			if (me.currentRowSelected.cells[3].innerHTML != "&nbsp;")
				amountValue = me.currentRowSelected.cells[3].innerHTML;
				
			if (me.currentRowSelected.cells[4].innerHTML != "&nbsp;") {
				percentValue = me.currentRowSelected.cells[4].innerHTML;
				percentValue = percentValue.substring(0, percentValue.length - 2);
			}
				
		    rowHtml = me.getRecurringExpsGridRow(
		        parseInt(me.currentRowSelected.cells[0].innerHTML)
				, true // Editing Row
		        , me.currentRowSelected.cells[1].innerHTML
				, me.currentRowSelected.cells[2].innerHTML
			    , amountValue
			    , percentValue
			    , me.currentRowSelected.cells[5].innerHTML
			    , me.currentRowSelected.cells[6].innerHTML
			    , me.currentRowSelected.cells[7].innerHTML
				, me.currentRowSelected.cells[8].innerHTML
		        )
			    
		    $(me.currentRowSelected).html(rowHtml);
		    		   
		    if  ($("#amount").val() != "")
		    	me.recurringExpsGridRowValidate(1);
		    else
				me.recurringExpsGridRowValidate(2);
				
			me.rowBeingEdited = true;
			me.status = "Edit";
			me.validateControls();			
		},		
		
		recurringExpsGridRowDelete: function() {
			var me = this;
						
			if(me.rowBeingEdited || me.currentRowSelected == null) 
				return;
			
			var rowNumber = me.currentRowSelected.cells[0].innerHTML;
			if (confirm("Are you sure you would like to delete row number " + rowNumber + " ?")) {
				me.status = "Delete";
				me.rowBeingEdited = true;
				me.actionSaveItem();
			} 
			else {
				me.currentRowSelected = null;
				return;
			}
		},
		
		validateControls: function() {
			me = this;
			
			$("#amount").blur(function() {
				me.recurringExpsGridRowValidate(1);
			});
			
			$("#percent").blur(function() {
				me.recurringExpsGridRowValidate(2);
			});
			
			$("#amount, #percent").keypress(function (e) {
				if( e.which != 8 && e.which != 0 && e.which != 46 && (e.which < 48 || e.which > 57))
					return false;
			});
		},
				
		recurringExpsGridRowValidate: function() {
			var args = ii.args(arguments, {
				columnNumber: {type: Number}
			});
			var me = this;
				 
			if (args.columnNumber == 1) {
				if ($("#amount").val() != "") {
					$("#percent").attr('disabled', 'disabled'); 
					$("#percentageOf").attr('disabled', 'disabled');				
				}
				else {
					$("#percent").attr('disabled', ''); 
					$("#percentageOf").attr('disabled', '');
				}
			}
			else if (args.columnNumber == 2) {
				if ($("#percent").val() != "") {
					$("#amount").attr('disabled', 'disabled'); 
					$("#intervalType").attr('disabled', 'disabled'); 
				}
				else {
					$("#amount").attr('disabled', ''); 
					$("#intervalType").attr('disabled', ''); 
				}
			}
		},		

		actionUndoItem: function() {
			var me = this;
			var rowHtml = "";
			var rowNumber = -1;
			
			if (me.status == "")
				return;
			
			if (me.status == "Add") {
				var insertAt = $("#RecurringExpsGridBody").find('tr').length;
				$($("#RecurringExpsGridBody tr")[insertAt - 1]).remove();
			}
			else {
				rowNumber = parseInt(me.currentRowSelected.cells[0].innerHTML) - 1;
			
				rowHtml += me.getRecurringExpsGridRow(
					parseInt(me.currentRowSelected.cells[0].innerHTML)
					, false
			        , me.getAccountNumberName(me.expenses[rowNumber].fscAccountTo)
					, me.getJobTitle(me.expenses[rowNumber].houseCodeJobTo)
					, me.expenses[rowNumber].amount == "0" ? "&nbsp;" : parseFloat(me.expenses[rowNumber].amount).toFixed(2).toString()
					, me.expenses[rowNumber].percent == "0" ? "&nbsp;" : parseFloat(me.expenses[rowNumber].percent).toFixed(2).toString() + " %"
					, me.getAccountNumberName(me.expenses[rowNumber].fscAccountFrom)
					, me.getJobTitle(me.expenses[rowNumber].houseCodeJobFrom)
					, me.expenses[rowNumber].intervalType == "0" ? "&nbsp;" : me.intervalTypes[me.expenses[rowNumber].intervalType - 1].name
					, "No"
					);
					
				$(me.currentRowSelected).html(rowHtml); 
			}
				
			me.recurringExpensesGridEventSetup(me);
			me.status = "";
			me.rowBeingEdited = false;
			me.currentRowSelected = null;
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if(me.recurringExpensesReadOnly) return;
				
			if (!me.rowBeingEdited || me.status == "")
				return;

			if (me.status == "Add" || me.status == "Edit") {
				if ($("#amount").val() == "" && $("#percent").val() == "") {
					alert("Please enter either Amount or Percent");
					return false;
				}
				
				if ($("#percent").val() != "") {
					if ($("#applyTo").val() == $("#percentageOf").val()) {
						alert("Percentage Of cannot be the same as the Apply To column");
						return false;
					}
				}
			}
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
					
			var rowNumber = 0;
			var id = -1;
			var amount = "-1";
			var percent = "-1";
			var interval = -1;
			var accountFrom = -1;
			var version = 1;
						
			rowNumber = parseInt(me.currentRowSelected.cells[0].innerHTML);
			if (rowNumber <= me.expenses.length) {
				id = me.expenses[rowNumber - 1].id;
				version = me.expenses[rowNumber - 1].version;
			}
			
			if (me.status == "Add" || me.status == "Edit") {
					if ($("#percent").val() != "") {
					percent = $("#percent").val();
					accountFrom = parseInt($("#percentageOf").val());
				}
				else if ($("#amount").val() != "") {
					amount = $("#amount").val();
					interval = parseInt($("#intervalType").val());
				}
				
				var item = new fin.glm.recurringExpenses.RecurringExpense(
					id
					, parent.fin.appUI.houseCodeId
					, me.fiscalYear
					, me.period
					, parseInt($("#applyTo").val())					
					, parseInt($("#jobTo").val())
					, amount
					, percent								
					, accountFrom
					, parseInt($("#jobFrom").val())
			        , interval
					, false
					, version
				);				
			}
			else if (me.status == "Delete") {
				item = new fin.glm.recurringExpenses.RecurringExpense({ id: id });
			}			
						
			var xml = me.saveXmlBuildRecurringExpense(item);
		
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseRecurringExpense,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildRecurringExpense: function(){
			var args = ii.args(arguments, {
				item: { type: fin.glm.recurringExpenses.RecurringExpense }
			});
			var me = this;
			var xml = "";		
			
			if (me.status == "Add" || me.status == "Edit") {
				xml += '<recurringExpense';
				xml += ' id="' + args.item.id + '"';
				xml += ' houseCode="' + args.item.houseCode + '"';
				xml += ' fscYear="' + args.item.fscYear + '"';
				xml += ' fscPeriod="' + args.item.fscPeriod + '"';
				xml += ' fscAccountTo="' + args.item.fscAccountTo + '"';
				xml += ' houseCodeJobTo="' + args.item.houseCodeJobTo + '"';
				xml += ' amount="' + args.item.amount + '"';
				xml += ' percent="' + args.item.percent + '"';
				xml += ' fscAccountFrom="' + args.item.fscAccountFrom + '"';
				xml += ' houseCodeJobFrom="' + args.item.houseCodeJobFrom + '"';
				xml += ' intervalType="' + args.item.intervalType + '"';
				xml += ' readOnly="' + args.item.readOnly + '"';
				xml += ' version="' + args.item.version + '"';
				xml += '/>';
			}
			else if (me.status == "Delete") {
				xml += '<recurringExpenseDelete';
				xml += ' id="' + args.item.id + '"';
				xml += '/>';
			}
	
			return xml;
		},		
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponseRecurringExpense: function () {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			var traceType = ii.traceTypes.errorDataCorruption;
			var errorMessage = "";
			var id = 0;
			var rowNumber = 0;		
			var rowHtml = "";
			
			if(status == "success") {
				$(args.xmlNode).find("*").each(function () {

					switch (this.tagName) {
						case "recurringExpense":
							id = parseInt($(this).attr("id"), 10);				
						    item.version = parseInt($(this).attr("version"), 10);
							
							if (item.amount == "-1")
								item.amount = "0";
							if (item.percent == "-1")
								item.percent = "0";
							if (item.fscAccountFrom == -1)
								item.fscAccountFrom = 0;
							if (item.intervalType == -1)
								item.intervalType = 0;
							
							rowNumber = parseInt(me.currentRowSelected.cells[0].innerHTML) - 1;
							
							if (me.status == "Add") {
								item.id = id;
								me.expenses.push(item);
							}
							else if (me.status == "Delete") {
								me.expenses.splice(rowNumber, 1);
							}
							else {
								me.expenses[rowNumber] = item;
							}
							
							if (me.status == "Delete") {
								me.expensesLoaded(me);
							}
							else {
								rowHtml += me.getRecurringExpsGridRow(
								parseInt(me.currentRowSelected.cells[0].innerHTML)
								, false
						        , me.getAccountNumberName(me.expenses[rowNumber].fscAccountTo)
								, me.getJobTitle(me.expenses[rowNumber].houseCodeJobTo)
								, me.expenses[rowNumber].amount == "0" ? "&nbsp;" : parseFloat(me.expenses[rowNumber].amount).toFixed(2).toString()
								, me.expenses[rowNumber].percent == "0" ? "&nbsp;" : parseFloat(me.expenses[rowNumber].percent).toFixed(2).toString() + " %"
								, me.getAccountNumberName(me.expenses[rowNumber].fscAccountFrom)
								, me.getJobTitle(me.expenses[rowNumber].houseCodeJobFrom)
								, me.expenses[rowNumber].intervalType == "0" ? "&nbsp;" : me.intervalTypes[me.expenses[rowNumber].intervalType - 1].name
								, "No"
								);
								
								$(me.currentRowSelected).html(rowHtml);
							}
							
							me.recurringExpensesGridEventSetup(me);		 
							me.status = "";
							me.rowBeingEdited = false;
							me.currentRowSelected = null;						
					}
				});
			}
			else{
				alert('Error while updating Recurring Expenses Record: ' + $(args.xmlNode).attr("message"));
				errorMessage = $(args.xmlNode).attr("error");
				
				if( status == "invalid" ){
					traceType = ii.traceTypes.warning;
				}
				else{
					errorMessage += " [SAVE FAILURE]";
				}
			}
			
			$("#pageLoading").hide();				
		}
	}
});

function main() {
	fin.recurringExpensesUi = new fin.glm.recurringExpenses.UserInterface();
	fin.recurringExpensesUi.resize();
	fin.houseCodeSearchUi = fin.recurringExpensesUi;
}
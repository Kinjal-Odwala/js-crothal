ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.checkList" );
ii.Import( "fin.adh.setup.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5) ;
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );
ii.Style( "fin.cmn.usr.dropDown", 8 );
ii.Style( "fin.cmn.usr.checkList", 9) ;

ii.Class({
    Name: "fin.adh.UserInterface",
	Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.action = "";
			me.moduleId = 0;
			me.moduleAssociateId = 0;
			me.reportId = 0;
			me.moduleAssociateIds = "";
			me.moduleAssociateSelect = false;
			me.moduleChanged = false;
			me.report = 1;
			me.lastSelectedIndex = -1;
			me.renderRowIndex = -1;

			me.gateway = ii.ajax.addGateway("adh", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\adh";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();			
			me.configureCommunications();

			$("#AssociateModuleImage").click(function() {				
				if ($("#ModuleAssociateGroup").is(":visible")) {					
					$("#AssociateModuleImage").html("<img src='/fin/cmn/usr/media/Common/edit.png' title='Select associate modules.'/>");
					$("#ModuleAssociateGroup").hide("slow");
					me.loadAssociateSubModules();
				}
				else {
					$("#AssociateModuleImage").html("<img src='/fin/cmn/usr/media/Common/editSelected.png' title='Select associate modules.'/>");
					$("#ModuleAssociateGroup").show("slow");
				}
				me.moduleAssociateSelect = true;
			});

			$("#ImageUp").click(function() {
				me.actionUpItem();
			});

			$("#ImageDown").click(function() {
				me.actionDownItem();
			});

			me.moduleStore.fetch("userId:[user]", me.moduleLoaded, me);
			$(window).bind("resize", me, me.resize);
		},

		authorizationProcess: function fin_adh_setup_UserInterface_authorizationProcess() {
			var args = ii.args(arguments, {});
			var me = this;

			ii.timer.timing("Page Displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
		},

		sessionLoaded: function fin_adh_setup_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded.", ii.traceTypes.Information, "Session");
		},

		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;

			fin.adhUi.appReportGrid.setHeight($(window).height() - 85);
			fin.adhUi.appModuleColumnGrid.setHeight($(window).height() - 280);
		},

		defineFormControls: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.reportTitle = new ui.ctl.Input.Text({
				id: "ReportTitle",
				maxLength: 64
			});

			me.reportTitle.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.reportTitle.text.value == "")
						this.setInvalid("Please enter valid title.");
			});

			me.module = new ui.ctl.Input.DropDown.Filtered({
				id: "Module",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.moduleChange(); }
			});

			me.module.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {

					if (me.module.text.value == "")
						this.setInvalid("Please select the correct Module.");
			});

			me.moduleAssociateGroup = new ui.ctl.Input.CheckList({
				id: "ModuleAssociateGroup"
			});

			me.active = new ui.ctl.Input.Check({
		        id: "Active",
				required: false
		    });

			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },
				hasHotState: true
			});

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.anchorClear = new ui.ctl.buttons.Sizeable({
				id: "AnchorClear",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Clear&nbsp;&nbsp;</span>",
				title:"Clear field selection in the grid.",
				clickFunction: function() { me.actionClearItem(); },
				hasHotState: true
			});

			me.appReportGrid = new ui.ctl.Grid({
		        id: "AppReportGrid",
		        allowAdds: false,
				selectFunction: function(index) { me.itemSelect(index); }
		    });

			me.appReportGrid.addColumn("title", "title", "Report Title", "Report Title", null);
			me.appReportGrid.capColumns();

			me.appModuleColumnGrid = new ui.ctl.Grid({
				id: "AppModuleColumnGrid",
				allowAdds: false
			});

			me.appModuleColumnGrid.addColumn("description", "", "Column Name", "Column Name", "", function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<div title=\'" + data.description + "\'> " + data.description + " </div>";
            });

			me.appModuleColumnGrid.addColumn("columnType1", "", "Editable", "Editable", 75, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<center><input type=\"radio\" name=\"columnType" + index + "\" id=\"editableInputRadio" + index + "\" value=\"1\" class=\"iiInputCheck\"" + (data.columnType == 1 ? 'checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });	

			me.appModuleColumnGrid.addColumn("columnType2", "", "Hidden", "Hidden", 60, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<center><input type=\"radio\" name=\"columnType" + index + "\" id=\"hiddenInputRadio" + index + "\" value=\"2\" class=\"iiInputCheck\"" + (data.columnType == 2 ? 'checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });	

			me.appModuleColumnGrid.addColumn("columnType3", "", "ReadOnly", "ReadOnly", 80, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<center><input type=\"radio\" name=\"columnType" + index + "\" id=\"readOnlyInputRadio" + index + "\" value=\"3\" class=\"iiInputCheck\"" + (data.columnType == 3 ? 'checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });	

			me.appModuleColumnGrid.addColumn("columnType4", "", "Filter", "Filter", 55, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<center><input type=\"checkbox\" id=\"filterInputCheck" + index + "\" class=\"iiInputCheck\"" + (data.columnTypeFilter == 1 ? checked='checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });	

			me.appModuleColumnGrid.addColumn("columnType5", "", "Operator", "Operator", 75, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				var css = "iiInputCheck";

				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
				if (data.columnValidation.toLowerCase() != "datetime")
					css = "columnHidden";

                return "<center><input type=\"checkbox\" id=\"operatorInputCheck" + index + "\" class=\"" + css + "\"" + (data.columnTypeOperator == 1 ? checked='checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });	

			me.appModuleColumnGrid.addColumn("columnType6", "", "Sort By Asc", "Sort By Asc", 95, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<center><input type=\"radio\" name=\"SortOrder" + index + "\" id=\"sortOrderAscInputRadio" + index + "\" value=\"asc\" class=\"iiInputCheck\"" + (data.sortOrder == 'asc' ? 'checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });

			me.appModuleColumnGrid.addColumn("columnType7", "", "Sort By Desc", "Sort By Desc", 100, function(data) {
				var index = me.appModuleColumnGrid.rows.length - 1;
				if (me.appModuleColumnGrid.activeRowIndex != -1)
					index = me.renderRowIndex;
                return "<center><input type=\"radio\" name=\"SortOrder" + index + "\" id=\"sortOrderDescInputRadio" + index + "\" value=\"desc\" class=\"iiInputCheck\"" + (data.sortOrder == 'desc' ? 'checked' : '') + " onclick=\"fin.adhUi.actionClickItem(this," + index + ");\" /></center>";
            });

			me.appModuleColumnGrid.capColumns();
			$("#AppModuleColumnGrid").bind("dblclick", me, me.clearAppModuleColumnGridRow);
		},

		resizeControls: function() {
			var me = this;
			
			me.reportTitle.resizeText();
			me.module.resizeText();
			me.resize();
		},
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.modules = [];
			me.moduleStore = me.cache.register({
				storeId: "appModules",
				itemConstructor: fin.adh.Module,
				itemConstructorArgs: fin.adh.moduleArgs,
				injectionArray: me.modules
			});

			me.moduleColumns = [];
			me.moduleColumnStore = me.cache.register({
				storeId: "AdhReportColumns",
				itemConstructor: fin.adh.ModuleColumn,
				itemConstructorArgs: fin.adh.moduleColumnArgs,
				injectionArray: me.moduleColumns
			});

			me.reports = [];
			me.reportStore = me.cache.register({
				storeId: "AdhReports",
				itemConstructor: fin.adh.Report,
				itemConstructorArgs: fin.adh.reportArgs,
				injectionArray: me.reports
			});

			me.moduleAssociates = [];
			me.moduleAssociateStore = me.cache.register({
				storeId: "AppModuleAssociates",
				itemConstructor: fin.adh.ModuleAssociate,
				itemConstructorArgs: fin.adh.moduleAssociateArgs,
				injectionArray: me.moduleAssociates
			});
		},	

		moduleLoaded: function(me, activeId) {

			var found = true;
			
			me.module.reset();
			
			while (found) {
				found = false;
				for (var index = 0; index < me.modules.length; index++) {
					if (me.modules[index].associateModule) {
						me.modules.splice(index, 1);
						found = true;
						break;
					}
				}
			}

			me.modules.unshift(new fin.adh.Module({ id: 0, number: 0, name: "None", description: "", associateModule: "" }));
			me.module.setData(me.modules);
			me.module.select(0, me.module.focused);
			me.reportStore.fetch("userId:[user]", me.reportLoaded, me);
			me.resizeControls();
		},

		reportLoaded: function(me, activeId) {

			me.appReportGrid.setData(me.reports);
			if (me.reports.length > 0) {
				me.appReportGrid.body.select(0);
			}
		},

		moduleChange: function() {
			var me = this;
			
			me.moduleId = -1;
			
			if (me.module.indexSelected >= 0) {
				me.moduleId = me.modules[me.module.indexSelected].id;
				me.moduleDescription = me.modules[me.module.indexSelected].description;
				me.moduleChanged = true;
				me.moduleAssociateStore.reset();
				me.moduleAssociateStore.fetch("userId:[user],module:" + me.moduleId + ",", me.moduleAssociateLoaded, me);
				me.moduleAndAssociateModuleColumnsLoad(me.reportId, me.moduleId, "0", true);
			}		
		},

		moduleAndAssociateModuleColumnsLoad: function() {
			var args = ii.args(arguments, {
				reportId: {type: Number, required:false, defaultValue: 0},
				moduleId: {type: Number, required:false, defaultValue: 0},
				moduleAssociateIds: {type: String, required:false, defaultValue: "0"},
				clear: {type: Boolean, required:false, defaultValue: false}
			});
			var me = this;

			if (args.clear) {
				$("#SubModulesContainer").html("");
				me.moduleAssociateIds = 0;
				me.moduleAssociateGroup.reset();
			}
			
			$("#messageToUser").text("Loading");
			$("#pageLoading").show();
			me.moduleColumnStore.reset();
			me.moduleColumnStore.fetch("userId:[user],module:" + args.moduleId + ",moduleAssociate:" + args.moduleAssociateIds + ",report:"+ args.reportId + ",", me.moduleColumnsLoaded, me);
		},

		moduleColumnsLoaded: function(me, activeId) {

			me.appModuleColumnGrid.setData(me.moduleColumns);
			$("#pageLoading").hide();
		},

		itemSelect: function() {
			var args = ii.args(arguments, {
				index: {type: Number}
			});
			var me = this;			
			var index = args.index;
			var item = me.appReportGrid.data[index];
			var itemIndex = 0;

			me.action = "";
			me.lastSelectedIndex = args.index;
			me.reportTitle.setValue(me.appReportGrid.data[index].title);
			me.active.check.checked = me.appReportGrid.data[index].active;
			me.reportId = me.appReportGrid.data[index].id;
			me.moduleId = me.appReportGrid.data[index].module;
			me.moduleAssociateId = me.appReportGrid.data[index].moduleAssociate;
			me.moduleAssociateIds = me.moduleAssociateId;

			itemIndex = ii.ajax.util.findIndexById(me.moduleId.toString(), me.modules);
			if (itemIndex != undefined)
				me.module.select(itemIndex, me.module.focused);
			else
				me.module.select(0, me.module.focused);

			me.moduleAssociateStore.reset();
			me.moduleAssociateStore.fetch("userId:[user],module:" + me.moduleId + ",", me.moduleAssociateLoaded, me);
		},	

		moduleAssociateLoaded: function(me, activeId) {

			var items = [];
			var item = null;
			var moduleAssociateNames = "";

			$("#SubModulesContainer").html("");
			me.moduleAssociateGroup.renderPending = true;
			me.moduleAssociateGroup.setList(me.moduleAssociates);
			
			if (me.moduleChanged == true) {
				me.moduleChanged = false;
				return;
			}

			var associates = me.moduleAssociateId.split("#");

			for (var index in associates){
				item = ii.ajax.util.findItemById(associates[index], me.moduleAssociates);
				if (item != null) {
					items.push(item);
					moduleAssociateNames += item.name + ", ";
				}
			}

			$("#SubModulesContainer").html(moduleAssociateNames.substring(0, moduleAssociateNames.length - 2));
			me.moduleAssociateGroup.setData(items);
			me.moduleColumnStore.reset();
			me.moduleAndAssociateModuleColumnsLoad(me.reportId, me.moduleId, me.moduleAssociateId);
		},

		loadAssociateSubModules: function() {
			var me = this;
			var moduleAssociateNames = "";
			var item = null;

			me.moduleAssociateIds = "";

			for (var index in me.moduleAssociateGroup.selectedItems) {
				item = ii.ajax.util.findItemById(me.moduleAssociateGroup.selectedItems[index].id.toString(), me.moduleAssociates);
				if (item) {
					me.moduleAssociateIds += item.id + "#";
					moduleAssociateNames += item.name + ", ";
				}
			}

			$("#SubModulesContainer").html(moduleAssociateNames.substring(0, moduleAssociateNames.length - 2));
			me.moduleAssociateIds = me.moduleAssociateIds.substring(0, me.moduleAssociateIds.length - 1);
			me.moduleAndAssociateModuleColumnsLoad(me.reportId, me.moduleId, me.moduleAssociateIds);
		},

		clearAppModuleColumnGridRow: function() {
			var args = ii.args(arguments, {
				event: {type: Object} // The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var index = me.appModuleColumnGrid.activeRowIndex;

			if (index < 0) return;

			$("#editableInputRadio" + index)[0].checked = false;
			$("#hiddenInputRadio" + index)[0].checked = false;
			$("#readOnlyInputRadio" + index)[0].checked = false;
			$("#filterInputCheck" + index)[0].checked = false;
			$("#operatorInputCheck" + index)[0].checked = false;
			$("#sortOrderAscInputRadio" + index)[0].checked = false;
			$("#sortOrderDescInputRadio" + index)[0].checked = false;
		},

		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.action = "";

			if (me.lastSelectedIndex >= 0) {
				me.appReportGrid.body.select(me.lastSelectedIndex);
				me.itemSelect(me.lastSelectedIndex);
			}
		},

		actionClearItem: function() {			
			var args = ii.args(arguments, {});
			var me = this;

			if (me.appModuleColumnGrid.rows.length > 0)	{
				for (var index = 0; index <= me.appModuleColumnGrid.rows.length - 1; index++) {
					$("#editableInputRadio" + index).attr("checked", false);
					$("#hiddenInputRadio" + index).attr("checked", false);
					$("#readOnlyInputRadio" + index).attr("checked", false);
					$("#filterInputCheck" + index).attr("checked", false);
					$("#operatorInputCheck" + index).attr("checked", false);
					$("#sortOrderAscInputRadio" + index)[0].checked = false;
					$("#sortOrderDescInputRadio" + index)[0].checked = false;
				}
			}
		},

		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;

			me.action = "New";			
			me.reportTitle.setValue("");
			me.module.select(0, me.module.focused);
			me.report = 0;
			me.moduleId = 0;
			me.moduleAssociateId = 0;
			me.moduleAssociateIds = 0;
			me.reportId	= 0;
			me.active.check.checked = true;
			me.appReportGrid.body.deselectAll();
			$("#SubModulesContainer").html("");

			for (var index = 0; index < me.moduleColumns.length; index++) {
				me.moduleColumns[index].id = 0;
				me.moduleColumns[index].columnType = 0;
				me.moduleColumns[index].columnTypeFilter = 0;
				me.moduleColumns[index].columnTypeOperator = 0;
			}

			me.moduleAssociateGroup.reset();
			me.appModuleColumnGrid.setData([]);
		},
		
		actionClickItem: function(object, index) {
			var me = this;
			
			if (object.type == "radio") {
				if (object.id == "editableInputRadio" + index || object.id == "hiddenInputRadio" + index || object.id == "readOnlyInputRadio" + index)
					me.moduleColumns[index].columnType = parseInt(object.value);
				else if (object.id == "sortOrderAscInputRadio" + index || object.id == "sortOrderDescInputRadio" + index)
					me.moduleColumns[index].sortOrder = object.value;
			}
			else if (object.type == "checkbox") {
				if (object.id == "filterInputCheck" + index) {
					me.moduleColumns[index].columnTypeFilter = (object.checked ? 1 : 0);
					if (me.moduleColumns[index].columnTypeFilter == 0) {
						me.moduleColumns[index].columnTypeOperator = 0;
						$("#operatorInputCheck" + index)[0].checked = false;
					}
				}
				else if (object.id == "operatorInputCheck" + index) {
					me.moduleColumns[index].columnTypeOperator = (object.checked ? 1 : 0);
					if (me.moduleColumns[index].columnTypeOperator == 1) {
						me.moduleColumns[index].columnTypeFilter = 1;
						$("#filterInputCheck" + index)[0].checked = true;
					}
				}
			}
		},

		actionUpItem: function() {
			var me = this;
			var index = me.appModuleColumnGrid.activeRowIndex;

			if (index > 0) {
				var item = me.appModuleColumnGrid.data[index];
				var prevItem = me.appModuleColumnGrid.data[index - 1];

				me.renderRowIndex = index - 1;
				me.appModuleColumnGrid.data[index - 1] = item;
				me.appModuleColumnGrid.body.renderRow(index - 1, index - 1);

				me.renderRowIndex = index;
				me.appModuleColumnGrid.data[index] = prevItem;
				me.appModuleColumnGrid.body.renderRow(index, index);

				me.appModuleColumnGrid.body.deselect(index);
				me.appModuleColumnGrid.body.select(index - 1);
			}
		},

		actionDownItem: function() {
			var me = this;
			var index = me.appModuleColumnGrid.activeRowIndex;

			if (index != -1 && index < me.appModuleColumnGrid.data.length - 1) {
				var item = me.appModuleColumnGrid.data[index];
				var nextItem = me.appModuleColumnGrid.data[index + 1];

				me.renderRowIndex = index + 1;
				me.appModuleColumnGrid.data[index + 1] = item;
				me.appModuleColumnGrid.body.renderRow(index + 1, index + 1);

				me.renderRowIndex = index;
				me.appModuleColumnGrid.data[index] = nextItem;
				me.appModuleColumnGrid.body.renderRow(index, index);

				me.appModuleColumnGrid.body.deselect(index);
				me.appModuleColumnGrid.body.select(index + 1);
			}
		},

		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			var xml = "";
			var columnType = 0;
			var columnTypeFilter = 0;
			var columnTypeOperator = 0;
			var reportId = 0;	
			var hirNode = 0;
			var sortOrder ="";
			var sortColumnsCount = 0;

			if (me.reportTitle.text.value == "")	{
				alert("Please enter valid title.");
				return false;
			}

			if (me.module.indexSelected <=0) {
				alert("Please enter valid module.");
				return false;
			}

			if (me.action == "New") {
				reportId = 0;
				hirNode = 0;
			}
			else if (me.appReportGrid.data[me.lastSelectedIndex] != undefined) {
				reportId = me.appReportGrid.data[me.lastSelectedIndex].id;
				hirNode = me.appReportGrid.data[me.lastSelectedIndex].hirNode;
			}

			xml += '<adhReport';
			xml += ' id="' + reportId + '"';
			xml += ' title="' + ui.cmn.text.xml.encode(me.reportTitle.getValue()) + '"';
			xml += ' appModule="' + me.module.data[me.module.indexSelected].id + '"';
			xml += ' moduleAssociate="' + me.moduleAssociateIds + '"';
			xml += ' active="' + me.active.check.checked + '"';
			xml += ' hirNode="' + hirNode + '"';
			xml += '/>';

			for (var index = 0; index < me.appModuleColumnGrid.rows.length; index++) {
				columnType = 0;
				columnTypeFilter = 0;
				columnTypeOperator = 0;
				sortOrder = "";

				if (($("#editableInputRadio" + index)[0].checked))
					columnType = 1;
				else if	(($("#hiddenInputRadio" + index)[0].checked))
					columnType = 2;
				else if	(($("#readOnlyInputRadio" + index)[0].checked))
					columnType = 3;

				if ($("#filterInputCheck" + index)[0].checked)
					columnTypeFilter = 1;

				if ($("#operatorInputCheck" + index)[0].checked)
					columnTypeOperator = 1;

				if ($("#sortOrderAscInputRadio" + index)[0].checked)
					sortOrder = "Asc";

				if ($("#sortOrderDescInputRadio" + index)[0].checked)
					sortOrder = "Desc";

				if (sortOrder == "Asc" || sortOrder == "Desc")
					sortColumnsCount++;

				xml += '<adhReportColumn';
				xml += ' id="' + 0 + '"';
				xml += ' reportId="' + reportId + '"';
				xml += ' appModuleColumn="' + me.moduleColumns[index].id + '"';
				xml += ' columnType="' + columnType + '"';
				xml += ' columnTypeFilter="'+ columnTypeFilter +'"'
				xml += ' columnTypeOperator="'+ columnTypeOperator +'"'
				xml += ' sortOrder="'+ sortOrder +'"'
				xml += '/>';
			}

			if (xml == "")
				return;

			if (sortColumnsCount > 4) {
				return alert("Maximum 4 Sort By columns can be selected.");
			}

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: item}
			});

			return true;
		},

		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function () {
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

				$(args.xmlNode).find("*").each(function () {

					switch (this.tagName) {
						case "adhReport":

							var id = parseInt($(this).attr("id"), 10);
							var hirNode = parseInt($(this).attr("hirNode"), 10);

							item = new fin.adh.Report(
								id
								, me.reportTitle.getValue()
								, me.moduleId.toString()
								, me.moduleAssociateIds.toString()
								, me.active.check.checked
								, hirNode
							);

							if (me.appReportGrid.activeRowIndex < 0 && me.action == "New") {
								me.reports.push(item);
								me.appReportGrid.setData(me.reports);
								me.appReportGrid.body.select(me.reports.length - 1);
							}
							else if (me.appReportGrid.activeRowIndex >= 0) {
								me.reports[me.lastSelectedIndex] = item;
								me.appReportGrid.body.renderRow(me.lastSelectedIndex, me.lastSelectedIndex);
							}							

							break;
					}
				});

				me.action = "";
			}
			else {
				alert("[SAVE FAILURE] Error while updating Ad-Hoc Report: " + $(args.xmlNode).attr("message"));
			}
		}
	}
});

function main() {
	fin.adhUi = new fin.adh.UserInterface();
	fin.adhUi.resize();
}
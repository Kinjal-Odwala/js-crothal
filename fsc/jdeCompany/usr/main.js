ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import("ui.ctl.usr.buttons");
ii.Import( "fin.fsc.jdeCompany.usr.defs" );

ii.Style( "fin.cmn.usr.common" , 1);
ii.Style( "fin.cmn.usr.statusBar" , 2);
ii.Style( "fin.cmn.usr.toolbar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);
ii.Style( "fin.cmn.usr.button" , 6);
ii.Style( "fin.cmn.usr.dropDown" , 7);

ii.Class({
    Name: "fin.fsc.jdeCompany.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.jdeCompanyId = 0;
			me.jdeCompanyCountOnLoad = 0;
			me.isReadOnly = false;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			); 
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Fiscal\\JDECompanies";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.defineFormControls();
			me.configureCommunications();			
			me.setStatus("Loading");
			me.modified(false);
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_fsc_jdeCompany_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;
			
			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			
			if (me.isAuthorized) {
				$("#pageLoading").hide();
				$("#pageLoading").css({
					"opacity": "0.5",
					"background-color": "black"
				});
				$("#messageToUser").css({ "color": "white" });
				$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
				$("#pageLoading").fadeIn("slow");

				ii.timer.timing("Page displayed");
				me.loadCount = 2;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.patternStore.fetch("userId:[user]", me.patternsLoaded, me); 
				me.jdeCompanyStore.fetch("userId:[user]", me.jdeCompanyLoaded, me);
				me.isReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
				me.controlVisible();
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	
		
		sessionLoaded: function fin_fsc_jdeCompany_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resizeControls: function() {
			var me = this;
			
			me.jdeCompanyTitle.resizeText();
			me.resize();
		},
		
		resize: function() {
			var args = ii.args(arguments,{});

			fin.fsc.jdeCompanyGridUi.jdeCompanyGrid.setHeight($(window).height() - 140);	
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
					title: "Save the current Company.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction",
					brief: "Undo current changes to Company (Ctrl+U)",
					title: "Undo the changes to Company being edited.",
					actionFunction: function() { me.actionUndoItem(); }
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

			me.jdeCompanyGrid = new ui.ctl.Grid({
				id: "JDECompanyGridSelect",
				allowAdds: true,
				createNewFunction: fin.fsc.jdeCompany.JDECompany,
				selectFunction: function(index) { 
					if(me.jdeCompanys[index]) me.jdeCompanys[index].modified = true; 
				}
			});
			
			me.jdeCompanyTitle = new ui.ctl.Input.Text({
				id: "JDECompanyTitle",
				maxLength: 50,
				appendToId: "JDECompanyGridSelectControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.jdeCompanyTitle.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.jdeFiscalPattern = new ui.ctl.Input.DropDown.Filtered({
		        id: "JDEFiscalPattern" ,
		        formatFunction: function( type ){ return type.name; },
		        appendToId: "JDECompanyGridSelectControlHolder",
				changeFunction: function() { me.modified(); }
		    });			
			
			me.jdeFiscalPattern.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation(function(isFinal, dataMap) {
	
					var enteredText = me.jdeFiscalPattern.getValue();
						
					if (enteredText == "" || me.jdeFiscalPattern.numberSelected == -1)
						this.setInvalid("Please select the Pattern from list.");
				});
						
			me.jdeCompanyActive = new ui.ctl.Input.Check({
				id: "JDECompanyActive",
				appendToId: "JDECompanyGridSelectControlHolder",
				changeFunction: function() { me.modified(); }
			});
			
			me.jdeCompanyGrid.addColumn("title", "title", "JDE Company", "JDE Company", null, null, me.jdeCompanyTitle);
			me.jdeCompanyGrid.addColumn("pattern", "pattern", "Fiscal Pattern", "Fiscal Pattern", 170, function( fPattern ){ return fPattern.name; }, me.jdeFiscalPattern);
			me.jdeCompanyGrid.addColumn("active", "active", "Active", "Active", 80, null, me.jdeCompanyActive);
			me.jdeCompanyGrid.capColumns();
			me.jdeCompanyGrid.setHeight($(me.jdeCompanyGrid.element).parent().height() - 2);
		},
		
		configureCommunications: function() {
			var me = this;
			
			me.patterns = [];
			me.patternStore = me.cache.register({
				storeId: "fiscalPatterns",
				itemConstructor: fin.fsc.jdeCompany.FiscalPattern,
				itemConstructorArgs: fin.fsc.jdeCompany.fiscalPatternArgs,
				injectionArray: me.patterns
			});			
			
			me.jdeCompanys = [];
			me.jdeCompanyStore = me.cache.register({
				storeId: "fiscalJDECompanys",
				itemConstructor: fin.fsc.jdeCompany.JDECompany,
				itemConstructorArgs: fin.fsc.jdeCompany.jdeCompanyArgs,
				injectionArray: me.jdeCompanys,
				lookupSpec: {pattern: me.patterns}
			});
		},
		
		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
		},
		
		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
	
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
			var me = this;
			
			parent.fin.appUI.modified = args.modified;
			if (args.modified)
				me.setStatus("Edit");
		},
		
		setLoadCount: function(me, activeId) {
			var me = this;

			me.loadCount++;
			me.setStatus("Loading");
			$("#messageToUser").text("Loading");
			$("#pageLoading").fadeIn("slow");
		},
		
		checkLoadCount: function() {
			var me = this;

			me.loadCount--;
			if (me.loadCount <= 0) {
				me.setStatus("Loaded");
				$("#pageLoading").fadeOut("slow");
			}
		},
		
		patternsLoaded: function (me, activeId) {

			me.jdeFiscalPattern.reset();
			me.jdeFiscalPattern.setData(me.patterns);	
			me.checkLoadCount();		
		},
		
		controlVisible: function(){
			var me = this;
			
			if (me.isReadOnly) {
				me.jdeCompanyGrid.columns["title"].inputControl = null;
				me.jdeCompanyGrid.columns["pattern"].inputControl = null;
				me.jdeCompanyGrid.columns["active"].inputControl = null;
				me.jdeCompanyGrid.allowAdds = false;
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},

		jdeCompanyLoaded:function(me, activeId) {
			
			me.controlVisible();

			me.jdeCompanyGrid.setData(me.jdeCompanys);
			me.jdeCompanyCountOnLoad = me.jdeCompanys.length - 1;
			
			me.jdeCompanyGrid.setHeight($("#pageLoading").height() - 130);	
			
			me.resizeControls();
			me.checkLoadCount();
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
			
			if (processed) {
				return false;
			}
		},

		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
			
			me.setStatus("Loading");	
			window.location = "/fin/fsc/jdeCompany/usr/markup.htm";			
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;

			// Check to see if the data is not entered
			if (me.jdeCompanyGrid.activeRowIndex < 0) {
				return false;
			}
			
			if (me.jdeCompanyGrid.indexSelected < 0 || me.isReadOnly) return;

			me.validator.forceBlur();

			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}

			me.jdeCompanyGrid.body.deselectAll();

			var item = [];
			var company;

			for (var index = 0; index < me.jdeCompanys.length; index++) {
				
				if (me.jdeCompanys[index].modified == false && index <= me.jdeCompanyCountOnLoad) continue;
				
				company = new fin.fsc.jdeCompany.JDECompany(
					(me.jdeCompanys[index] != undefined ? me.jdeCompanys[index].id : 0)
					, me.jdeCompanyGrid.data[index].title
					, me.jdeCompanyGrid.data[index].pattern
					, me.jdeCompanyGrid.data[index].active
				);
				
				item.push(company);
			}

			if (item.length <=0) return;
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();
						
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
			var args = ii.args(arguments, {
				item: { type: [fin.fsc.jdeCompany.JDECompany] }
			});			
			var xml = "";
			var clientId = 0;
			var item = args.item;
			var index = 0;
			
			for (index in item) {			
				xml += '<jdeCompany'
				xml += ' id="' + item[index].id + '"';
				xml += ' title="' + ui.cmn.text.xml.encode(item[index].title) + '"';
				xml += ' patternId="' + item[index].pattern.number + '"';
				xml += ' active="' + item[index].active + '"';
				xml += ' clientId="' + ++clientId + '"';
				xml += '/>';
			}
			
			return xml;
		},	

		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction}, // The transaction that was responded to.
				xmlNode: {type: "XmlNode:transaction"} // The XML transaction node associated with the response.
			});			
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			
			if (status == "success") {
				me.modified(false);
				me.setStatus("Saved");
				me.actionUndoItem();
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating JDE Company details: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.fsc.jdeCompanyGridUi = new fin.fsc.jdeCompany.UserInterface();
	fin.fsc.jdeCompanyGridUi.resize();
}
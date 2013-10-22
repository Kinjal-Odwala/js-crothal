ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "fin.fsc.fiscalPattern.usr.defs" );

ii.Style( "fin.cmn.usr.common" , 1);
ii.Style( "fin.cmn.usr.statusBar" , 2);
ii.Style( "fin.cmn.usr.toolbar" , 3);
ii.Style( "fin.cmn.usr.input" , 4);
ii.Style( "fin.cmn.usr.grid" , 5);
ii.Style( "fin.cmn.usr.button" , 6);

ii.Class({
    Name: "fin.fsc.fiscalPattern.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.patternsReadOnly = false;			
			me.fiscalPatternId = 0;
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);			
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Fiscal\\Patterns";
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
		
		authorizationProcess: function fin_fsc_fiscalPattern_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = parent.fin.cmn.util.authorization.isAuthorized(me, me.authorizePath);
			me.patternsReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			
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
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.patternStore.fetch("userId:[user]", me.patternsLoaded, me);				
				me.controlVisible();
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},	
		
		sessionLoaded: function fin_fsc_fiscalPattern_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;

			fin.fscPatternUi.fiscalPattern.setHeight($(window).height() - 140);			
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
					title: "Save the current Pattern.",
					actionFunction: function(){ me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Pattern (Ctrl+U)", 
					title: "Undo the changes to Pattern being edited.",
					actionFunction: function(){ me.actionUndoItem(); }
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

			me.fiscalPattern = new ui.ctl.Grid({
				id: "FiscalPattern",
				allowAdds: true,
				selectFunction: function( index ) { 
					me.itemSelect(index); 
					if(fin.fscPatternUi.patterns[index]) fin.fscPatternUi.patterns[index].modified = true;
				},
				createNewFunction: fin.fsc.fiscalPattern.FiscalPattern
			});
			
			me.fiscalPatternTitle = new ui.ctl.Input.Text({
		        id: "FiscalPatternTitle" ,
		        maxLength: 16, 
				appendToId: "FiscalPatternControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.fiscalPatternTitle.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required );
				
			me.fiscalPatternActive = new ui.ctl.Input.Check({
		        id: "FiscalPatternActive" ,
		        className: "iiInputCheck",
				appendToId: "FiscalPatternControlHolder",
				changeFunction: function() { me.modified(); }
		    });

			me.fiscalPattern.addColumn("title", "title", "Fiscal Pattern", "Fiscal Pattern", null, null, this.fiscalPatternTitle);
			me.fiscalPattern.addColumn("active", "active", "Active", "Active", 80, null, me.fiscalPatternActive);
			me.fiscalPattern.capColumns();
			me.fiscalPattern.setHeight($(me.fiscalPattern.element).parent().height() - 2);			
		},
		
		configureCommunications: function fin_fsc_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});			
			var me = this;
			
			me.patterns = [];
			me.patternStore = me.cache.register({
				storeId: "fiscalPatterns",
				itemConstructor: fin.fsc.fiscalPattern.FiscalPattern,
				itemConstructorArgs: fin.fsc.fiscalPattern.fiscalPatternArgs,
				injectionArray: me.patterns
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
		
		resizeControls: function() {
			var me = this;
			
			me.fiscalPatternTitle.resizeText();
			me.resize();
		},
		
		controlVisible: function() {
			var me = this;
			
			if (me.patternsReadOnly) {
				me.fiscalPattern.columns["title"].inputControl = null;
				me.fiscalPattern.columns["active"].inputControl = null;
				me.fiscalPattern.allowAdds = false;
				
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},
		
		patternsLoaded: function fin_fsc_UserInterface_patternsLoaded(me, activeId) {
			
			me.fiscalPatternId = this.id;
			me.fiscalPattern.setData(me.patterns);
			me.patternCountOnLoad = me.patterns.length - 1;
			me.controlVisible();
			me.resizeControls();
			me.checkLoadCount();
		},
		
		/* @iiDoc {Method}
		 * Handles the selection event of a given item.
		 */
		itemSelect: function() {
			var args = ii.args(arguments,{
				index: {type: Number}  // The index of the data subItem to select
			});			
			var me = this;
			var index = args.index;
			
			if (me.fiscalPattern.data[index] != undefined) 
				me.fiscalPatternId = me.fiscalPattern.data[index].id;
			else 
				me.fiscalPatternId = 0;
				
			me.controlVisible();
		},

		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {type: Object}		// The (key) event object
			});			
			var event = args.event;
			var me = event.data;
			var processed = false;
			
			if (event.ctrlKey) {
				
				switch (event.keyCode) {
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

		actionUndoItem: function() {
			var me = this;

			if (!parent.fin.cmn.status.itemValid())
				return;
				
			me.setStatus("Loading");
			window.location = "/fin/fsc/fiscalPattern/usr/markup.htm";
		},
			
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			// Check to see if the data is not entered
			if(me.fiscalPattern.activeRowIndex < 0 || me.patternsReadOnly) return false;

			me.fiscalPattern.body.deselectAll();			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if( !me.validator.queryValidity(true) ){
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}

			var item = [];
			var pattern;

			for (var index = 0; index < me.patterns.length; index++) {

				if (me.patterns[index].modified == false && index <= me.patternCountOnLoad) continue;
								
				pattern = new fin.fsc.fiscalPattern.FiscalPattern(
					me.fiscalPattern.data[index].id
					, me.fiscalPattern.data[index].title
					, "1"
					, me.fiscalPattern.data[index].active
				);
				
				item.push(pattern);
			}

			var xml = me.saveXmlBuildFiscalPattern(item);
			
			if (item.length <= 0 ) return; //no records modified

			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponseFiscalPattern,
				referenceData: {me: me, item: item}
			});
			
			return true;
		},
		
		saveXmlBuildFiscalPattern: function () {
			var args = ii.args(arguments, {
				item: {type: [fin.fsc.fiscalPattern.FiscalPattern]}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
			var index = 0;
			
			for (index in item) {
				
				xml += '<fiscalPattern';
				xml += ' id="' + item[index].id + '"';
				xml += ' title="' + ui.cmn.text.xml.encode(item[index].title) + '"';
				xml += ' displayOrder="1"';
				xml += ' active="' + item[index].active + '"';
				xml += '/>';
			}
			
			return xml;
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponseFiscalPattern: function () {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var item = transaction.referenceData.item;
			var status = $(args.xmlNode).attr("status");
			
			if (status == "success") {
				me.modified(false);
				me.setStatus("Saved");
				window.location = "/fin/fsc/fiscalPattern/usr/markup.htm"
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating the Fiscal Pattern record: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.fscPatternUi = new fin.fsc.fiscalPattern.UserInterface();
	fin.fscPatternUi.resize();
}
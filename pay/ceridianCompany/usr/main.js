ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.pay.ceridianCompany.usr.defs" );

ii.Style( "fin.cmn.usr.common", 1 );
ii.Style( "fin.cmn.usr.statusBar", 2 );
ii.Style( "fin.cmn.usr.toolbar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.dropDown", 6 );
ii.Style( "fin.cmn.usr.button", 7 );

ii.Class({
    Name: "fin.pay.ceridianCompany.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
						
			me.ceridianFrequencyTypes = [];
			me.duplicateCode = "";
			me.duplicateDescription = "";
			me.loadCount = 0;
			
			me.gateway = ii.ajax.addGateway("pay", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);	
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Payroll\\CeridianCompanies";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.defineFormControls();			
			me.configureCommunications();
			me.setStatus("Loading");
			me.modified(false);
			
			$(document).bind("keydown", me, me.controlKeyProcessor);
			$(window).bind("resize", me, me.resize);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_pay_ceridianCompany_UserInterface_authorizationProcess() {
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
				me.loadCount = 1;
				me.session.registerFetchNotify(me.sessionLoaded,me);
				me.frequencyTypeStore.fetch("userId:[user]", me.frequencyTypesLoaded, me);
				me.ceridianCompaniesReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
				me.controlVisible();
			}				
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},
		
		sessionLoaded: function fin_pay_ceridianCompany_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			fin.payCeridianCompanyUi.ceridianCompany.setHeight($(window).height() - 130);
		},
		
		defineFormControls: function(){
			var me = this;

			me.actionMenu = new ui.ctl.Toolbar.ActionMenu({
				id: "actionMenu"
			});
			
			me.actionMenu
				.addAction({
					id: "saveAction",
					brief: "Save Ceridian Company (Ctrl+S)", 
					title: "Save the current Ceridian Company.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Ceridian Company (Ctrl+U)", 
					title: "Undo the changes to Ceridian Company being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});

			me.ceridianCompany = new ui.ctl.Grid({
				id: "CeridianCompany",
				appendToId: "divForm",
				allowAdds: true,
				selectFunction: function( index ) { 
					if (fin.payCeridianCompanyUi.companies[index]) fin.payCeridianCompanyUi.companies[index].modified = true;
				},
				createNewFunction: fin.pay.ceridianCompany.CeridianCompany
			});
		
			me.ceridianCompanyTitle = new ui.ctl.Input.Text({
		        id: "CeridianCompanyTitle",
		        maxLength: 64, 
				appendToId: "CeridianCompanyControlHolder",
				changeFunction: function() { me.modified(); }
		    });
			
			me.ceridianCompanyTitle.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation(function(isFinal, dataMap) {

					me.checkForDuplicates();

					if (me.duplicateCode != "") {
						this.setInvalid("Ceridian Company Code already exists.");
					}
				});
				
		    me.ceridianCompanyDescription = new ui.ctl.Input.Text({
		        id: "CeridianCompanyDescription",
		        maxLength: 64, 
				appendToId: "CeridianCompanyControlHolder",
				changeFunction: function() { me.modified(); }
		    });
		   
		    me.ceridianCompanyDescription.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation(function(isFinal, dataMap) {

					me.checkForDuplicates();

					if (me.duplicateDescription != "") {
						this.setInvalid("Ceridian Company Description already exists.");
					}
				});

			me.frequencyType = new ui.ctl.Input.DropDown.Filtered({
		        id: "FrequencyType",
				appendToId: "CeridianCompanyControlHolder",
				formatFunction: function(type) { return type.title; },
				changeFunction: function() { me.modified(); }
		    });	
		   
		    me.frequencyType.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )	
				.addValidation( function( isFinal, dataMap ) {
					
					if (me.frequencyType.indexSelected == -1)
						this.setInvalid("Please select the correct Frequency Type.");
				});		
			
			me.ceridianCompany.addColumn("brief", "brief", "Company Number", "Company Number", 150, null, me.ceridianCompanyTitle);
			me.ceridianCompany.addColumn("title", "title", "Description", "Description", null, null, me.ceridianCompanyDescription);
			me.ceridianCompany.addColumn("frequencyType", "frequencyType", "Pay Frequency", "Pay Frequency", 150, function( frequency ) { return frequency.title; }, me.frequencyType);
			me.ceridianCompany.capColumns();

			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});

			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});
		},
		
		resizeControls: function() {
			var me = this;
			
			me.ceridianCompanyTitle.resizeText();
			me.ceridianCompanyDescription.resizeText();
			me.frequencyType.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_pay_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.frequencyTypes = [];
			me.frequencyTypeStore = me.cache.register({
				storeId: "frequencyTypes",
				itemConstructor: fin.pay.ceridianCompany.FrequencyType,
				itemConstructorArgs: fin.pay.ceridianCompany.frequencyTypeArgs,
				injectionArray: me.frequencyTypes
			});			

			me.companies = [];
			me.companyStore = me.cache.register({
				storeId: "payrollCompanys",
				itemConstructor: fin.pay.ceridianCompany.CeridianCompany,
				itemConstructorArgs: fin.pay.ceridianCompany.ceridianCompanyArgs,
				injectionArray: me.companies,
				lookupSpec: { frequencyType: me.frequencyTypes }
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
		
		checkForDuplicates: function() {
			var me = this;

			me.duplicateCode = "";
			me.duplicateDescription = "";
			
			if (me.ceridianCompany.activeRowIndex == -1) return;

			for (var index = 0; index < me.ceridianCompany.data.length; index++) {
			
				if (me.ceridianCompany.data[index].brief.toLowerCase() == me.ceridianCompanyTitle.getValue().toLowerCase() 
					&& index != me.ceridianCompany.activeRowIndex) {
					me.duplicateCode = me.ceridianCompanyTitle.getValue().toLowerCase();
				}
			
				if (me.ceridianCompany.data[index].title.toLowerCase() == me.ceridianCompanyDescription.getValue().toLowerCase() 
					&& index != me.ceridianCompany.activeRowIndex) {
					me.duplicateDescription = me.ceridianCompanyDescription.getValue().toLowerCase();
				}
			}

			return true;
		},
				
		frequencyTypesLoaded: function(me, activeId) {

			me.frequencyType.setData(me.frequencyTypes);
			me.companyStore.fetch("userId:[user]", me.companiesLoaded, me);
		},		
		
		controlVisible: function(){
			var me = this;
			
			if (me.ceridianCompaniesReadOnly) {
				me.ceridianCompany.columns["brief"].inputControl = null;
				me.ceridianCompany.columns["title"].inputControl = null;
				me.ceridianCompany.columns["frequencyType"].inputControl = null;
				me.ceridianCompany.allowAdds = false;
				
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},
		
		companiesLoaded: function(me, activeId) {
				
			me.ceridianCompany.setData(me.companies);
			
			me.resizeControls();
			me.companyCountOnLoad = me.companies.length - 1;			
			me.saveFrequencyTypes(me);
			
			me.controlVisible();
			me.checkLoadCount();
		},
		
		saveFrequencyTypes: function(me) {
		
			for (var index = 0; index < me.companies.length; index++) {
				me.ceridianFrequencyTypes[index] = me.companies[index].frequencyType.id;
			}
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
							
			me.setLoadCount();
			
			if (me.ceridianCompany.activeRowIndex >= 0)
				me.ceridianCompany.body.deselect(me.ceridianCompany.activeRowIndex, true);
			me.companyStore.reset();
			me.companyStore.fetch("userId:[user]", me.companiesLoaded, me);
		},
			
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (me.ceridianCompaniesReadOnly) return;
			
			var recordChanged = false;

			me.ceridianCompany.body.deselectAll();
			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true) && me.ceridianCompany.activeRowIndex >= 0) {
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}
			
			for (var index = 0; index < me.ceridianFrequencyTypes.length; index++) {
				if (me.ceridianFrequencyTypes[index] != me.ceridianCompany.data[index].frequencyType.id) {
					recordChanged = true;
					break;
				}
			}
			
			if (recordChanged) {
				if (!confirm("You are about to alter the details of a Ceridian Company that may be associated to multiple House Codes as well as its Employees and is referenced for payroll processing."))
					return false; 	
			}	
	
			var item = [];
			var company;

			for (var index = 0; index < me.companies.length; index++) {
				
				if(me.companies[index].modified == false && index <= me.companyCountOnLoad) continue;
				
				company = new fin.pay.ceridianCompany.CeridianCompany(
					me.ceridianCompany.data[index].id
					, me.ceridianCompany.data[index].brief
					, me.ceridianCompany.data[index].title
					, me.ceridianCompany.data[index].frequencyType
				);

				item.push(company);
			}

			var xml = me.saveXmlBuild(item);

			if (item.length <= 0) return; //no records modified
			
			me.setStatus("Saving");
							
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");

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
				item: {type: [fin.pay.ceridianCompany.CeridianCompany]}
			});			
			var me = this;
			var item = args.item;
			var xml = "";
			var index = 0;
			
			for (index in item) {
				
				xml += '<payRollCompany';
				xml += ' id="' + item[index].id + '"';
				xml += ' brief="' + ui.cmn.text.xml.encode(item[index].brief) + '"';
				xml += ' title="' + ui.cmn.text.xml.encode(item[index].title) + '"';
				xml += ' frequencyType="' + item[index].frequencyType.id + '"';
				xml += ' displayOrder="1"';
				xml += ' active="1"';				
				xml += '/>';
			}
	
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
				
			if (status == "success") {
				me.modified(false);
				me.setStatus("Saved");
				me.actionUndoItem();
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Ceridian Company details: " + $(args.xmlNode).attr("message"));
			}
			
			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	
	fin.payCeridianCompanyUi = new fin.pay.ceridianCompany.UserInterface();
	fin.payCeridianCompanyUi.resize();
}
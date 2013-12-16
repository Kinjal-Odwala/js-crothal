ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.bud.annualInformation.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.input", 4 );
ii.Style( "fin.cmn.usr.grid", 5 );
ii.Style( "fin.cmn.usr.button", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );

ii.Class({
    Name: "fin.bud.annualInformation.UserInterface",
    Definition: {

		init: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.annualInformationId = 0;
			me.fiscalYearId = 0;
			me.startPeriods = [];
			me.endPeriods = [];
			me.liabilityAccountCodes = [];
			me.windowWidth = 0;
			me.windowHeight = 0;
			me.loadCount = 0;

			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\bud\\annualInformation";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.session = new ii.Session(me.cache);

			me.configureCommunications();
			me.defineFormControls();
			me.modified(false);
			me.setStatus("Loading");

			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
		},
			
		authorizationProcess: function fin_bud_annualInformation_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);
			
			$("#pageLoading").hide();
			$("#pageLoading").css({
				"opacity": "0.5",
				"background-color": "black"
			});
			$("#messageToUser").css({ "color": "white" });
			$("#imgLoading").attr("src", "/fin/cmn/usr/media/Common/loadingwhite.gif");
			$("#pageLoading").fadeIn("slow");
			
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded, me);
			me.fiscalYear.fetchingData();			
			me.yearStore.fetch("userId:[user],", me.yearsLoaded, me);
			me.accountStore.fetch("userId:[user],", me.accountsLoaded, me);
			//me.showAccountsLoading();
		},	
		
		sessionLoaded: function fin_bud_annualInformation_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
			
		resize: function fin_bud_annualInformation_UserInterface_resize() {
			var args = ii.args(arguments,{});
			var me = fin.annualInformationUI;
			var offset = 185;
			
			if (ii.browser.ie) {
				offset = 180;
			}

			if ((me.windowWidth != $(window).width()) || (me.windowHeight != $(window).height())) {
				$("#contentAreasContainerLeft").height($(window).height() - offset);
				$("#contentAreasContainerRight").height($(window).height() - offset);
				
				if (ii.browser.ie) {
					$("#AccountCodesText").height($(window).height() - 480);
					me.accountGrid.setHeight($(window).height() - 212);
				}					
				else {
					$("#AccountCodesText").height($(window).height() - 485);
					me.accountGrid.setHeight($(window).height() - 217);
				}					

				$("#Announcement").width($(window).width() - 290);
				me.windowWidth = $(window).width();
				me.windowHeight = $(window).height();
			}
		},
			
		defineFormControls: function fin_bud_annualInformation_UserInterface_defineFormControls() {
			var me = this;
			
			me.fiscalYear = new ui.ctl.Input.DropDown.Filtered({
		        id: "FiscalYear",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.yearChanged(); }
		    });
			
			me.fiscalYear.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.fiscalYear.indexSelected == -1)
						this.setInvalid("Please select the correct Year.");
				});
			
			me.startDate = new ui.ctl.Input.Date({
		        id: "StartDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
		    	changeFunction: function() { me.modified(); }
			});
			
			me.startDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.startDate.text.value;
					
					if(enteredText == "") 
						return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
			
			me.cutOffDate = new ui.ctl.Input.Date({
		        id: "CutOffDate",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); },
				changeFunction: function() { me.modified(); }
		    });
			
			me.cutOffDate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				.addValidation( function( isFinal, dataMap ) {					
					var enteredText = me.cutOffDate.text.value;
					
					if(enteredText == "") 
						return;
											
					if(ui.cmn.text.validate.generic(enteredText, "^\\d{1,2}(\\-|\\/|\\.)\\d{1,2}\\1\\d{4}$") == false)
						this.setInvalid("Please enter valid date.");
				});
			
			me.generalLiabilityRate = new ui.ctl.Input.Money({
		        id: "GenLiabilityRate",
				statusLeft: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.generalLiabilityRate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
			
			me.startPeriod = new ui.ctl.Input.DropDown.Filtered({
		        id: "StartPeriod",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.startPeriod.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.startPeriod.indexSelected == -1)
						this.setInvalid("Please select the correct Start Period.");
				});
			
			me.endPeriod = new ui.ctl.Input.DropDown.Filtered({
		        id: "EndPeriod",
				formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });
			
			me.endPeriod.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )
				.addValidation( function( isFinal, dataMap ) {
				
					if (me.endPeriod.indexSelected == -1)
						this.setInvalid("Please select the correct End Period.");
				});
			
			me.benefitAdjPercent = new ui.ctl.Input.Money({
		        id: "Percent",
				statusLeft: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.benefitAdjPercent.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.supplySurchargeRate = new ui.ctl.Input.Money({
		        id: "SupplySurchargeRate",
				statusLeft: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.supplySurchargeRate.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.computerRelatedChargeUnit = new ui.ctl.Input.Money({
		        id: "ComputerRelatedChargeUnit",
				statusLeft: false,
				changeFunction: function() { me.modified(); }
		    });
			
			me.computerRelatedChargeUnit.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.computerRelatedChargeOverhead = new ui.ctl.Input.Money({
		        id: "ComputerRelatedChargeOverhead",
				statusLeft: false,
				changeFunction: function() { me.modified(); }
		    });

			me.computerRelatedChargeOverhead.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.retailVacationAccrualPercent = new ui.ctl.Input.Money({
		        id: "RetailVacationAccrualPercent",
				statusLeft: false,
				changeFunction: function() { me.modified(); }
		    });

			me.retailVacationAccrualPercent.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)

			me.accountCodes = new ui.ctl.Input.Text({
		        id: "AccountCodes",
				maxLength: 255,
				textArea: true
		    });
			
			me.accountCodes.setValue("");
			me.accountCodes.text.readOnly = true;		

			me.announcement = $("#Announcement")[0];

			$("#Announcement").height(65);
			$("#Announcement").keypress(function() {
				if (me.announcement.value.length > 999) {
					me.announcement.value = me.announcement.value.substring(0, 1000);
					return false;
				}
			});
			$("#Announcement").change(function() { me.modified(); });

			me.accountGrid = new ui.ctl.Grid({
				id: "AccountGrid",
				appendToId: "divForm"
			});
			
			var rowNumber = -1;
			me.accountGrid.addColumn("assigned", "assigned", "", "Checked means assigned to annual Information", 30, function() { rowNumber += 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + rowNumber + "\" class=\"iiInputCheck\" onchange=\"actionClickItem();\" />";				
            });
			me.accountGrid.addColumn("code", "code", "Code", "Code", 100);
			me.accountGrid.addColumn("description", "description", "Description", "Description", null);
			me.accountGrid.capColumns();
			
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
		},
		
		configureCommunications: function fin_bud_annualInformation_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.years = [];
			me.yearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.bud.annualInformation.Year,
				itemConstructorArgs: fin.bud.annualInformation.yearArgs,
				injectionArray: me.years
			});	
									
			me.periods = [];
			me.periodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.bud.annualInformation.Period,
				itemConstructorArgs: fin.bud.annualInformation.periodArgs,
				injectionArray: me.periods
			});
			
			me.accounts = [];
			me.accountStore = me.cache.register({
				storeId: "accounts",
				itemConstructor: fin.bud.annualInformation.Account,
				itemConstructorArgs: fin.bud.annualInformation.accountArgs,
				injectionArray: me.accounts	
			});
			
			me.annualInformations = [];
			me.annualInformationStore = me.cache.register({
				storeId: "budAnnualInformations",
				itemConstructor: fin.bud.annualInformation.AnnualInformation,
				itemConstructorArgs: fin.bud.annualInformation.annualInformationArgs,
				injectionArray: me.annualInformations
			});			
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
			
			if (processed)
				return false;
		},
		
		setStatus: function(status) {
			var me = this;

			fin.cmn.status.setStatus(status);
		},
		
		dirtyCheck: function(me) {

			return !fin.cmn.status.itemValid();
		},
		
		modified: function () {
            var args = ii.args(arguments, {
                modified: { type: Boolean, required: false, defaultValue: true }
            });
            var me = this;

            parent.parent.fin.appUI.modified = args.modified;
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
			
			me.fiscalYear.resizeText();
			me.startDate.resizeText();
			me.cutOffDate.resizeText();
			me.generalLiabilityRate.resizeText();
			me.startPeriod.resizeText();
			me.endPeriod.resizeText();
			me.benefitAdjPercent.resizeText();
			me.supplySurchargeRate.resizeText();
			me.computerRelatedChargeUnit.resizeText();
			me.computerRelatedChargeOverhead.resizeText();
			me.retailVacationAccrualPercent.resizeText();
			me.accountCodes.resizeText();
			me.resize();
		},
		
//		showAccountsLoading: function() {
//			var me = this;
//	
//			$("#accountsLoading").css({
//				"width": $("#AccountGrid").width() + 10,
//				"height": $("#AccountGrid").height() + 10
//			});
//			
//			$("#accountsLoading").show();
//		},
		
		yearsLoaded: function(me, activeId) {

  			me.fiscalYear.setData(me.years);
			me.fiscalYear.select(0, me.fiscalYear.focused);				
			me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;			
		},
				
		yearChanged: function() {
			var me = this;
	
			if (me.fiscalYear.indexSelected == -1)
				return;
			
			me.fiscalYearId = me.fiscalYear.data[me.fiscalYear.indexSelected].id;				
			me.loadPeriods();
			me.modified();
			me.yearChange = true;
		},
		
		loadPeriods: function() {
			var me = this;
			
			me.startPeriod.fetchingData();
			me.endPeriod.fetchingData();
			me.periodStore.fetch("userId:[user],fiscalYearId:" + me.fiscalYearId, me.periodsLoaded, me);
		},
		
		periodsLoaded: function(me, activeId) {		
				
			me.startPeriods = me.periods.slice();
			me.endPeriods = me.periods.slice();
			
			me.startPeriod.setData(me.startPeriods);			
			me.endPeriod.setData(me.endPeriods);
			//me.showAccountsLoading();
			me.setLoadCount();
			me.annualInformationStore.fetch("userId:[user],fscYear:" + me.fiscalYearId, me.annualInformationsLoaded, me);
		},
		
		accountsLoaded: function (me, activeId) {
			
			me.accountGrid.setData(me.accounts);
			me.loadPeriods();
		},
		
		annualInformationsLoaded: function(me, activeId) {
			var index = 0;
			var accountCodes = [];
				
			if (me.annualInformations.length > 0) {
				
				me.annualInformationId = me.annualInformations[0].id;
				me.startDate.setValue(me.annualInformations[0].startDate);
				me.cutOffDate.setValue(me.annualInformations[0].cutOffDate);
				me.generalLiabilityRate.setValue(me.annualInformations[0].genLiabilityRate);
				
				index = ii.ajax.util.findIndexById(me.annualInformations[0].benefitAdjStartPeriod.toString(), me.startPeriods);
				if (index != undefined)	
					me.startPeriod.select(index, me.startPeriod.focused);
					
				index = ii.ajax.util.findIndexById(me.annualInformations[0].benefitAdjEndPeriod.toString(), me.endPeriods);
				if (index != undefined)	
					me.endPeriod.select(index, me.endPeriod.focused);

				me.benefitAdjPercent.setValue(me.annualInformations[0].benefitAdjPercent);
				me.supplySurchargeRate.setValue(me.annualInformations[0].supplySurchargeRate);
				me.computerRelatedChargeUnit.setValue(me.annualInformations[0].computerRelatedChargeUnit);
				me.computerRelatedChargeOverhead.setValue(me.annualInformations[0].computerRelatedChargeOverhead);
				me.retailVacationAccrualPercent.setValue(me.annualInformations[0].retailVacationAccrualPercent);
				me.accountCodes.setValue(me.annualInformations[0].genLiabilityAccCodes);
				me.announcement.value = me.annualInformations[0].announcement;

				me.liabilityAccountCodes = me.annualInformations[0].genLiabilityAccCodes.split(",");
				
				for (var index = 0; index < me.accounts.length; index++) {
					$("#assignInputCheck" + index)[0].checked = me.isCodeAssigned(me.accounts[index].code);
				}
			}
			else {
				me.annualInformationId = 0;
				me.startDate.setValue("");
				me.cutOffDate.setValue("");
				me.generalLiabilityRate.setValue("");
				me.startPeriod.reset();
				me.endPeriod.reset();
				me.benefitAdjPercent.setValue("");
				me.supplySurchargeRate.setValue("");
				me.computerRelatedChargeUnit.setValue("");
				me.computerRelatedChargeOverhead.setValue("");
				me.retailVacationAccrualPercent.setValue("");
				me.accountCodes.setValue("");
				me.announcement.value = "";				

				for (var index = 0; index < me.accounts.length; index++) {
					$("#assignInputCheck" + index)[0].checked = false;
				}				
			}

			me.resizeControls();
			//$("#accountsLoading").hide();
			me.checkLoadCount();	
			if (me.yearChange) {
				me.yearChange = false;
				me.setStatus("Edit");
			}	
		},
		
		isCodeAssigned: function(code) {
			var me = this;
			
			for (var index = 0; index < me.liabilityAccountCodes.length; index++) {
				if (me.liabilityAccountCodes[index] == code) {
					me.liabilityAccountCodes.splice(index, 1)
					return true;
				}					
			}
			
			return false;
		},
		
		actionUndoItem: function() {		
			var args = ii.args(arguments,{});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;

			//me.showAccountsLoading();
			me.setLoadCount();
			me.annualInformationsLoaded(me);			
		},
		
		actionSaveItem: function() {		
			var args = ii.args(arguments,{});
			var me = this;
			var item = [];
			
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true)) {
				alert("In order to save, the errors on the page must be corrected.");
				return;
			}
			
			if (me.announcement.value == "") {
				alert("Announcement field is required. Please make an entry.");
				return;
			}
			
			me.setStatus("Saving");
			
			$("#messageToUser").text("Saving");
			$("#pageLoading").fadeIn("slow");			
				
			item = new fin.bud.annualInformation.AnnualInformation(
				me.annualInformationId
				, me.fiscalYearId
				, me.startDate.lastBlurValue
				, me.cutOffDate.lastBlurValue
				, me.generalLiabilityRate.getValue().toString()
				, me.accountCodes.getValue()
				, me.startPeriod.data[me.startPeriod.indexSelected].id
				, me.endPeriod.data[me.endPeriod.indexSelected].id
				, me.benefitAdjPercent.getValue().toString()
				, me.supplySurchargeRate.getValue().toString()
				, me.computerRelatedChargeUnit.getValue().toString()
				, me.computerRelatedChargeOverhead.getValue().toString()
				, me.retailVacationAccrualPercent.getValue().toString()
				, me.announcement.value
				);
				
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
				item: {type: fin.bud.annualInformation.AnnualInformation}
			});			
			var me = this;
			var item = args.item;
			var xml = "";			
	
			xml += '<budAnnualInformation';
			xml += ' id="' + item.id + '"';
			xml += ' yearId="' + item.fscYear + '"';
			xml += ' startDate="' + item.startDate + '"';
			xml += ' cutOffDate="' + item.cutOffDate + '"';
			xml += ' liabilityRate="' + item.genLiabilityRate + '"';
			xml += ' liabilityAccountCodes="' + item.genLiabilityAccCodes + '"';
			xml += ' startPeriod="' + item.benefitAdjStartPeriod + '"';			
			xml += ' endPeriod="' + item.benefitAdjEndPeriod + '"';
			xml += ' percent="' + item.benefitAdjPercent + '"';
			xml += ' supplySurchargeRate="' + item.supplySurchargeRate + '"';
			xml += ' computerRelatedChargeUnit="' + item.computerRelatedChargeUnit + '"';
			xml += ' computerRelatedChargeOverhead="' + item.computerRelatedChargeOverhead + '"';
			xml += ' retailVacationAccrualPercent="' + item.retailVacationAccrualPercent + '"';
			xml += ' announcement="' + ui.cmn.text.xml.encode(item.announcement) + '"';
			xml += '/>';

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
			
			$("#pageLoading").fadeOut("slow");

			if (status == "success") {
				me.modified(false);
				ii.trace("Annual information saved.", ii.traceTypes.Information, "Info");

				$(args.xmlNode).find("*").each(function() {
					switch (this.tagName) {

						case "budAnnualInformation":

							if (me.annualInformationId == 0) {
								me.annualInformationId = parseInt($(this).attr("id"), 10);
								item.id = me.annualInformationId;
								me.annualInformations.push(item);
							}
							else
								me.annualInformations[0] = item;

							break;
					}
				});
				
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating the annual information: " + $(args.xmlNode).attr("message"));
			}
		}
	}
});

function actionClickItem() {
	var me = fin.annualInformationUI;
	var accountCodes = "";
		
	for (var index = 0; index < me.accounts.length; index++) {
		
		if ($("#assignInputCheck" + index)[0].checked) {
			if (accountCodes == "")
				accountCodes += me.accounts[index].code;
			else
				accountCodes += "," + me.accounts[index].code;
		}
	}
	
	me.accountCodes.setValue(accountCodes);
	me.modified();
}

function main() {
	
	fin.annualInformationUI = new fin.bud.annualInformation.UserInterface();
	fin.annualInformationUI.resize();
}
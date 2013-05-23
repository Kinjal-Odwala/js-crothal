ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.fsc.fiscalCalender.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.dropDown", 7 );
ii.Style( "fin.cmn.usr.dateDropDown", 8 );
ii.Style( "fin.cmn.usr.button", 9 );

ii.Class({
    Name: "fin.fsc.fiscalCalender.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.status = "";
			me.fiscalYearId = 0;
			me.fiscalYearRowId;
			me.yearId = 0;
			me.calendarReadOnly = false;
			
			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor(
				me.gateway
				, function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);			
				
			me.validator = new ui.ctl.Input.Validation.Master();
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Fiscal\\Calendar";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();			
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$(document).bind("keydown", me, me.controlKeyProcessor);
			
			me.fiscalYearStore.fetch("userId:[user]", me.fiscalYearsLoaded, me);
			me.modified(false);
			
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}
		},
		
		authorizationProcess: function fin_fsc_fiscalCalender_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.calendarReadOnly = me.authorizer.isAuthorized(me.authorizePath + "\\Read");
			me.controlVisible();
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_fsc_fiscalCalender_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
	
		resize: function() {
			var args = ii.args(arguments, {});
			var me = this;

			if ($("#GridContianer").width() < 710)
				$("#FiscalPeriod").width(710);
			else
				$("#FiscalPeriod").width($("#GridContianer").width() - 5);

			fin.fiscalCalenderUi.fiscalYearGrid.setHeight($(window).height() - 80);	
			fin.fiscalCalenderUi.fiscalPeriodGrid.setHeight($(window).height() - 185);	
			$("#fiscalPeriodsLoading").height($(window).height() - 158);
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
					title: "Save the current Calendar.",
					actionFunction: function() { me.actionSaveItem(); }
				})
				.addAction({
					id: "newAction", 
					brief: "New Calendar(Ctrl+N)", 
					title: "Create a new blank Calendar.",
					actionFunction: function() { me.actionNewItem(); }
				})
				.addAction({
					id: "cancelAction", 
					brief: "Undo current changes to Calendar (Ctrl+U)", 
					title: "Undo the changes to Calendar being edited.",
					actionFunction: function() { me.actionUndoItem(); }
				});
				
			me.anchorSave = new ui.ctl.buttons.Sizeable({
				id: "AnchorSave",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Save&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionSaveItem(); },
				hasHotState: true
			});
			
			me.anchorNew = new ui.ctl.buttons.Sizeable({
				id: "AnchorNew",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;New&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionNewItem(); },				
				hasHotState: true
			});
			
			me.anchorUndo = new ui.ctl.buttons.Sizeable({
				id: "AnchorUndo",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Undo&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionUndoItem(); },
				hasHotState: true
			});

			me.fiscalYearGrid = new ui.ctl.Grid({
				id: "FiscalYear",
				appendToId: "divForm",
				allowAdds: false,
				selectFunction: function( index ) { me.itemSelectYear(index); },
				validationFunction: function() {
					if (me.status != "new") 
						return parent.fin.cmn.status.itemValid(); 
				}
			});
			
			me.fiscalYearGrid.addColumn("patternTitle", "patternTitle", "Fiscal Pattern", "Fiscal Pattern", 150);
			me.fiscalYearGrid.addColumn("title", "title", "Fiscal Year", "Fiscal Year", null);
			me.fiscalYearGrid.capColumns();

			me.fiscalCalenderPattern = new ui.ctl.Input.DropDown.Filtered({
		        id: "FiscalCalenderPattern",
		        formatFunction: function( type ) { return type.name; },
				changeFunction: function() { me.modified(); }
		    });			
			
			me.fiscalCalenderPattern.makeEnterTab()
				.setValidationMaster(me.validator)
				.addValidation(ui.ctl.Input.Validation.required)
				
			me.fiscalCalenderYear = new ui.ctl.Input.Text({
		        id: "FiscalCalenderYear",
		        maxLength: 4,
				changeFunction: function() { me.modified(); }
		    });
			
			me.fiscalCalenderYear.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (/^\d{4}$/.test(me.fiscalCalenderYear.getValue()) == false) {
					this.setInvalid("Please enter valid year.");
				}
			});

			me.fiscalPeriodGrid = new ui.ctl.Grid({
				id: "FiscalPeriod",
				appendToId: "divForm",
				selectFunction: function(index) { if(me.fiscalPeriods[index]) me.fiscalPeriods[index].modified = true; }
			});
				
			me.fiscalStartDate = new ui.ctl.Input.Date({
		        id: "FiscalStartDate",
		        appendToId: "FiscalPeriodControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
					
			me.fiscalStartDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {
					
				var enteredText = me.fiscalStartDate.lastBlurValue;
				
				if (enteredText == "") 
					return;
					
				me.modified();
										
				if (/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false) {							
					this.setInvalid("Please enter valid date.");
				}
			});
			
			me.fiscalEndDate = new ui.ctl.Input.Date({
		        id: "FiscalEndDate",
				appendToId: "FiscalPeriodControlHolder",
				formatFunction: function(type) { return ui.cmn.text.date.format(type, "mm/dd/yyyy"); }
		    });
			
			me.fiscalEndDate.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( ui.ctl.Input.Validation.required )					
				.addValidation( function( isFinal, dataMap ) {

				var enteredText = me.fiscalEndDate.lastBlurValue;

				if (enteredText == "") 
					return;

				me.modified();
				
				if (/^(0[1-9]|1[012]|[1]?[0])[\/-](0[1-9]|[12][0-9]|3[01])[\/-](\d{4}|\d{2})$/.test(enteredText) == false) {							
					this.setInvalid("Please enter valid date.");
				}
			});
			
			me.week1 = new ui.ctl.Input.Text({
		        id: "FiscalCalenderWeek1",
				appendToId: "FiscalPeriodControlHolder",
		        maxLength: 1,
				changeFunction: function() { me.modified(); }
		    });
			
			me.week1.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (!(/^\d{1}$/.test(me.week1.getValue()))) {
					this.setInvalid("Please enter valid value for Week 1.");
				}
			});
			
			me.week2 = new ui.ctl.Input.Text({
		        id: "FiscalCalenderWeek2",
				appendToId: "FiscalPeriodControlHolder",
		        maxLength: 1,
				changeFunction: function() { me.modified(); }
		    });
			
			me.week2.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (!(/^\d{1}$/.test(me.week2.getValue()))) {
					this.setInvalid("Please enter valid value for Week 2.");
				}
			});
			
			me.week3 = new ui.ctl.Input.Text({
		        id: "FiscalCalenderWeek3",
				appendToId: "FiscalPeriodControlHolder",
		        maxLength: 1,
				changeFunction: function() { me.modified(); }
		    });
			
			me.week3.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (!(/^\d{1}$/.test(me.week3.getValue()))) {
					this.setInvalid("Please enter valid value for Week 3.");
				}
			});
			
			me.week4 = new ui.ctl.Input.Text({
		        id: "FiscalCalenderWeek4",
				appendToId: "FiscalPeriodControlHolder",
		        maxLength: 1,
				changeFunction: function() { me.modified(); }
		    });
			
			me.week4.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (!(/^\d{1}$/.test(me.week4.getValue()))) {
					this.setInvalid("Please enter valid value for Week 4.");
				}
			});
			
			me.week5 = new ui.ctl.Input.Text({
		        id: "FiscalCalenderWeek5",
				appendToId: "FiscalPeriodControlHolder",
		        maxLength: 1,
				changeFunction: function() { me.modified(); }
		    });
			
			me.week5.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (!(/^\d{1}$/.test(me.week5.getValue()))) {
					this.setInvalid("Please enter valid value for Week 5.");
				}
			});
			
			me.week6 = new ui.ctl.Input.Text({
		        id: "FiscalCalenderWeek6",
				appendToId: "FiscalPeriodControlHolder",
		        maxLength: 1,
				changeFunction: function() { me.modified(); }
		    });
			
			me.week6.makeEnterTab()
				.setValidationMaster( me.validator )
				.addValidation( function( isFinal, dataMap ) {
				
				if (!(/^\d{1}$/.test(me.week6.getValue()))) {
					this.setInvalid("Please enter valid value for Week 6.");
				}
			});
			
			me.fiscalPeriodGrid.addColumn("startDate", "startDate", "Start Date", "Start Date", 120, function(startDate){return ui.cmn.text.date.format(startDate, "mm/dd/yyyy");}, this.fiscalStartDate);
			me.fiscalPeriodGrid.addColumn("endDate", "endDate", "End Date", "End Date", null, function(endDate){return ui.cmn.text.date.format(endDate, "mm/dd/yyyy");}, this.fiscalEndDate);
			me.fiscalPeriodGrid.addColumn("week1", "week1", "Week 1", "Week 1", 70, null, me.week1);
			me.fiscalPeriodGrid.addColumn("week2", "week2", "Week 2", "Week 2", 70, null, me.week2);
			me.fiscalPeriodGrid.addColumn("week3", "week3", "Week 3", "Week 3", 70, null, me.week3);
			me.fiscalPeriodGrid.addColumn("week4", "week4", "Week 4", "Week 4", 70, null, me.week4);
			me.fiscalPeriodGrid.addColumn("week5", "week5", "Week 5", "Week 5", 70, null, me.week5);
			me.fiscalPeriodGrid.addColumn("week6", "week6", "Week 6", "Week 6", 70, null, me.week6);
			me.fiscalPeriodGrid.capColumns();			
		},
		
		resizeControls: function() {
			var me = this;
			
			me.fiscalCalenderPattern.resizeText();
			me.fiscalStartDate.resizeText();
			me.fiscalEndDate.resizeText();
			me.resize();
		},
		
		configureCommunications: function fin_fsc_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;
			
			me.fiscalYears = [];
			me.fiscalYearStore = me.cache.register({
				storeId: "fiscalYears",
				itemConstructor: fin.fsc.fiscalCalender.FiscalYear,
				itemConstructorArgs: fin.fsc.fiscalCalender.fiscalYearArgs,
				injectionArray: me.fiscalYears
			});		
			
			me.fiscalPeriods = [];
			me.fiscalPeriodStore = me.cache.register({
				storeId: "fiscalPeriods",
				itemConstructor: fin.fsc.fiscalCalender.FiscalPeriod,
				itemConstructorArgs: fin.fsc.fiscalCalender.fiscalPeriodArgs,
				injectionArray: me.fiscalPeriods
			});		
			
			me.patterns = [];
			me.patternStore = me.cache.register({
				storeId: "fiscalPatterns",
				itemConstructor: fin.fsc.fiscalCalender.FiscalPattern,
				itemConstructorArgs: fin.fsc.fiscalCalender.fiscalPatternArgs,
				injectionArray: me.patterns
			});			
		},
		
		dirtyCheck: function(me) {
				
			return !fin.cmn.status.itemValid();
		},
	
		modified: function() {
			var args = ii.args(arguments, {
				modified: {type: Boolean, required: false, defaultValue: true}
			});
		
			parent.fin.appUI.modified = args.modified;
		},
		
		controlVisible: function() {
			var me = this;
			
			if (me.calendarReadOnly) {
								
				$("#FiscalCalenderYearText").attr('disabled', true);
				$("#FiscalCalenderPatternText").attr('disabled', true);
				$("#FiscalCalenderPatternAction").removeClass("iiInputAction");
				
				me.fiscalPeriodGrid.columns["startDate"].inputControl = null;
				me.fiscalPeriodGrid.columns["endDate"].inputControl = null;
				me.fiscalPeriodGrid.allowAdds = false;
				
				$("#actionMenu").hide();
				$(".footer").hide();
			}
		},
		
		fiscalYearsLoaded: function fin_fsc_UserInterface_fiscalYearsLoaded(me, activeId) {

			me.controlVisible();
			
			if (me.fiscalYears[0] == null)
				alert("No matching record found!!");
				
			me.fiscalYearId = this.id;
			me.fiscalYearGrid.setData(me.fiscalYears);
			me.fiscalCalenderPattern.fetchingData();
			me.patternStore.fetch("userId:[user]", me.patternsLoaded, me);
			me.resizeControls();
		},
		
		patternsLoaded: function fin_fsc_UserInterface_patternsLoaded(me, activeId) {

			me.fiscalCalenderPattern.reset();
			me.fiscalCalenderPattern.setData(me.patterns);
					
			$("#pageLoading").hide();
		},
		
		fiscalPeriodsLoaded: function fin_fsc_UserInterface_fiscalPeriodsLoaded(me, activeId) {
			
			me.controlVisible();
			
			if (me.fiscalPeriods[0] == null) {
				me.fiscalPeriodGrid.setData([]);
				return;
			}

			me.fiscalPeriodGrid.setData(me.fiscalPeriods);
			me.fiscalCalenderYear.setValue(me.fiscalPeriods[0].fscYeaTitle);
			
			$("#fiscalPeriodsLoading").hide();
		},
		
		itemSelectYear: function() { 
			var args = ii.args(arguments, {
				index: {type: Number}  // The index of the data subItem to select
			});
			var me = this;
			var index = args.index;
			var selectId = 0;
			
			if (!parent.fin.cmn.status.itemValid()){
				me.fiscalYearGrid.body.deselect(args.index, true);
				return;
			}
				
			me.status = "";	
						
			if (me.fiscalYearGrid.data[index] != undefined) {

				me.fiscalYearId = me.fiscalYearGrid.data[index].id;
				me.fiscalYearRowId = me.fiscalYearGrid.activeRowIndex;
				
				selectId = ii.ajax.util.findIndexById(me.fiscalYearGrid.data[index].patternId.toString(), me.patterns);
				if (selectId != undefined)
					me.fiscalCalenderPattern.select(selectId, me.fiscalCalenderPattern.focused);
					
				me.fiscalCalenderYear.setValue(me.fiscalYearGrid.data[index].title);
				me.yearId = me.fiscalYearGrid.data[index].id;
				
				if (me.yearId == "")
					return false;
					
								
				$("#fiscalPeriodsLoading").show();
								
				me.fiscalPeriodStore.fetch("fiscalYearId:" + me.yearId + ",userId:[user]", me.fiscalPeriodsLoaded, me);
			}
			else
				me.fiscalYearId = 0;
			
			me.controlVisible();	
		},
		
		/* @iiDoc {Method}
		 * Handles the processing of shortcut keys for the UI.
		 * 
		 * @Remarks
		 * Currently defined are: Ctrl+D = delete item, Ctrl+A = show action
		 * menu, Ctrl+M = mimic (duplicate) item, Ctrl+N = create new
		 * item, Ctrl+S = save item, and Ctrl+U = undo item changes.
		 */
		controlKeyProcessor: function() {
			var args = ii.args(arguments, {
				event: {
					type: Object
				} // The (key) event object
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
						
					case 78: // Ctrl+N
						me.actionNewItem();
						processed = true;
						break;
						
					case 85: //Ctrl+U
						me.actionUndoItem();  
						processed = true;
						break;
				}
			}
			
			if (processed) {
				return false;
			}
		},
	
		actionNewItem: function(me, activeId) {
			var args = ii.args(arguments, {});
			var me = this;
			
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.calendarReadOnly) return;
			
			me.fiscalYearId = 0;

			$("#fiscalPeriodsLoading").show();
			me.fiscalCalenderPattern.reset();
			me.fiscalYearGrid.body.deselectAll();
			me.fiscalPeriodStore.fetch("fiscalYearId:0,userId:[user]", me.fiscalPeriodsLoaded, me);
			me.status = "new";
		},

		actionUndoItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
				
			if (!parent.fin.cmn.status.itemValid())
				return;
				
			if (me.status == "" && me.fiscalYearGrid.activeRowIndex < 0)
				return;
				
			me.status = "";
			
			if (me.fiscalYearGrid.activeRowIndex < 0) {
				me.fiscalCalenderPattern.reset();
				me.fiscalCalenderYear.setValue("");
				me.fiscalPeriodGrid.setData([]);
				
				return;
			}

			if (me.fiscalPeriodGrid.activeRowIndex >= 0)
				me.fiscalPeriodGrid.body.deselect(me.fiscalPeriodGrid.activeRowIndex, true);

  			$("#fiscalPeriodsLoading").show();
			me.fiscalPeriodStore.reset();	
			me.itemSelectYear(me.fiscalYearGrid.activeRowIndex);
		},

		actionSaveItem: function() {
			var args = ii.args(arguments, {});
			var me = this;
			
			if (me.calendarReadOnly) return;
			
			if (me.fiscalYearId <= 0 && me.status != "new") {
				alert("Please select/save corresponding year record.");
				return false;
			}

			if (me.fiscalPeriodGrid.activeRowIndex >= 0)
				me.fiscalPeriodGrid.body.deselect(me.fiscalPeriodGrid.activeRowIndex);

			me.validator.forceBlur();
						
			// Check to see if the data entered is valid
			if (!me.validator.queryValidity(true) && me.fiscalPeriodGrid.activeRowIndex >= 0) {
				alert("In order to save, the errors on the page must be corrected.");
				return false;
			}			

			if (me.fiscalCalenderPattern.indexSelected == -1) {				
				alert("Please select Fiscal Pattern.");
				return false;
			}

			for (var index = 0; index < me.fiscalYearGrid.rows.length - 1; index++) {
				
				if ((me.fiscalCalenderYear.getValue() == me.fiscalYearGrid.data[index].title && me.status == "new") ||
					(me.fiscalYearGrid.activeRowIndex >= 0
					&& me.fiscalYearGrid.activeRowIndex != index
					&& me.fiscalCalenderYear.getValue() == me.fiscalYearGrid.data[index].title))
				{
					alert('Fiscal Year [' + me.fiscalCalenderYear.getValue() + '] already exists. Please select different year.');
					return;
				}
			}		
			
			var fiscalPeriodDatas = [];
			var fiscalPeriodData;
			var	periodStartDate;
			var	periodEndDate;
			var	prevPeriodEndDate;	

			for (var index = 0; index < me.fiscalPeriodGrid.rows.length; index++) {	

				periodStartDate = new Date(me.fiscalPeriods[index].startDate);	
				periodEndDate = new Date(me.fiscalPeriods[index].endDate);
				
				if (periodStartDate >= periodEndDate) {
					alert("Start Date of Period [" + (index + 1) + "] should not be greater than End Date.");
					me.fiscalPeriodGrid.body.select(index);
					me.fiscalStartDate.setInvalid("Please enter valid date.");
					return false;											
				}
				
				if (index != 0) {
					prevPeriodEndDate = new Date(me.fiscalPeriods[index - 1].endDate);	
	
					if (prevPeriodEndDate >= periodStartDate) {
						alert("End Date of Period " + index  + " should not be greater than Start Date of Period " + (index + 1));
					    me.fiscalPeriodGrid.body.select(index - 1);
						me.fiscalEndDate.setInvalid("Please enter valid date.");
						return false;						
					}				
				}

				if (me.fiscalPeriods[index].modified == false
					&& (index > 0) // other than first
					&& (me.fiscalPeriods[index].id > 0) // existing
					&& me.status != "new") continue;
				
				fiscalPeriodData = new fin.fsc.fiscalCalender.FiscalPeriod(
					 me.fiscalPeriodGrid.data[index].id
					, me.fiscalPeriods[0].year
					, me.fiscalCalenderYear.getValue()
					, index + 1
					, me.fiscalPeriods[index].startDate
					, me.fiscalPeriods[index].endDate
					, me.fiscalPeriods[index].week1
					, me.fiscalPeriods[index].week2
					, me.fiscalPeriods[index].week3
					, me.fiscalPeriods[index].week4
					, me.fiscalPeriods[index].week5
					, me.fiscalPeriods[index].week6
				);
				
				fiscalPeriodDatas.push(fiscalPeriodData);
			};

			$("#messageToUser").text("Saving");
			$("#pageLoading").show();

			var item = new fin.fsc.fiscalCalender.FiscalYear(
				me.fiscalYearId
				, me.fiscalCalenderPattern.data[me.fiscalCalenderPattern.indexSelected].id
				, me.fiscalCalenderPattern.data[me.fiscalCalenderPattern.indexSelected].name
				, me.fiscalCalenderYear.getValue()
				, "1"
				, fiscalPeriodDatas
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
				item: {type: fin.fsc.fiscalCalender.FiscalYear}
			});			
			var me = this;
			var index;
			var clientId = 0;
			var item = args.item;
			var xml = "";
			
			xml += '<fiscalYear';
			xml += ' id="' + (me.status == "new" ? 0 : me.fiscalYearId ) + '"';
			xml += ' patternId="' + item.patternId + '"';
			xml += ' title="' + item.title + '"';
			xml += ' active="true"';
			xml += ' displayOrder="1"';
			xml += ' clientId="' + ++clientId + '">';
			
			for (index in item.periods) {
				periodItem = item.periods[index]
				
				xml += '<fiscalPeriod'
				xml += ' id="' + (me.status == "new" ? 0 : periodItem.id ) + '"';
				xml += ' year="' + (me.status == "new" ? 0 : periodItem.year  ) + '"';
				xml += ' title="' + periodItem.title + '"';
				xml += ' startDate="' + periodItem.startDate.toLocaleString() + '"';
				xml += ' endDate="' + periodItem.endDate.toLocaleString() + '"';
				xml += ' week1="' + periodItem.week1 + '"';
				xml += ' week2="' + periodItem.week2 + '"';
				xml += ' week3="' + periodItem.week3 + '"';
				xml += ' week4="' + periodItem.week4 + '"';
				xml += ' week5="' + periodItem.week5 + '"';
				xml += ' week6="' + periodItem.week6 + '"';
				xml += ' active="true"';
				xml += ' displayOrder="1"';
				xml += ' clientId="' + ++clientId + '"';
				xml += '/>';
			}
			
			xml += '</fiscalYear>';

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
				me.status = "";
				
				for (var index = 0; index < me.fiscalPeriods.length; index++) {
					me.fiscalPeriods[index].modified = false;
				}
				
				$(args.xmlNode).find("*").each(function() {

					switch (this.tagName) {
						case "fiscalYear":
							me.fiscalYearId = parseInt($(this).attr("id"), 10);

							var item = new fin.fsc.fiscalCalender.FiscalYear(
								me.fiscalYearId
								, me.fiscalCalenderPattern.data[me.fiscalCalenderPattern.indexSelected].id
								, me.fiscalCalenderPattern.data[me.fiscalCalenderPattern.indexSelected].name
								, me.fiscalCalenderYear.getValue()
								, "1"								
							);
							
							if (me.status == "new") {
								me.fiscalYears.unshift(item);
								me.fiscalYearRowId = 0;
								me.fiscalYearGrid.setData(me.fiscalYears);
								me.fiscalYearGrid.body.select(me.fiscalYearRowId);
							}
							else {
								me.fiscalYears[me.fiscalYearRowId] = item;
								me.fiscalYearGrid.body.renderRow(me.fiscalYearRowId, me.fiscalYearRowId);
							}
																	
							break;
						
					}
				});
			}
			else {
				alert("[SAVE FAILURE] Error while updating Fiscal Calendar details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").hide();
		}
	}
});

function main() {
	fin.fiscalCalenderUi = new fin.fsc.fiscalCalender.UserInterface();
	fin.fiscalCalenderUi.resize();
}
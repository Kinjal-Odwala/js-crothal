ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.buttons" );
ii.Import( "fin.bud.staffing.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);

ii.Class({
    Name: "fin.bud.staffing.UserInterface",
    Definition: {
	
		init: function() {
			var args = ii.args(arguments, {});
			var me = this;
			var searchString = location.search.substring(1);
			var pos = searchString.indexOf("=");
			
			me.houseCode = parseInt(searchString.substring(pos + 1));
			me.yearId = parent.fin.budMasterUi.year;
			me.shift = 1;
			me.status = "";
			me.doResize = true;
			
			me.gateway = ii.ajax.addGateway("bud", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage){ me.nonPendingError(status, errorMessage); }
			);
			
			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\staffing";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);
				
			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
			
			me.shiftTypeStore.fetch("userId:[user],", me.shiftTypesLoaded, me);
			$("#StaffingHourReduction").hide();
			
			$("input[@name='StaffingOption']").click(function() {
	
				if (this.id == "StaffingDetail") {
					$("#pageLoading").show();
					$("#StaffingHeader").text("Staffing Hours Detail");
					$("#StaffingHourReduction").hide();
					$("#Button").show();
					$("#divShiftType").show();					
					
					me.defineStaffingHourGrid(false, true);
					me.setGridWidth();	
					me.staffingHourStore.fetch("userId:[user],houseCode:" + me.houseCode + ",year:" + me.yearId + ",shiftType:" + me.shift, me.staffingHoursLoaded, me);
				}
				
				if (this.id == "StaffingSummary") {
					$("#pageLoading").show();
					$("#StaffingHeader").text("Staffing Hours Summary");
					$("#divShiftType").hide();
					$("#Button").hide();
					$("#StaffingHourReduction").show();
					
					me.defineStaffingHourGrid(true, false);	
					me.setGridWidth();			
					me.staffingHourStore.fetch("userId:[user],houseCode:" + me.houseCode + ",year:" + me.yearId + ",shiftType:-1", me.staffingHoursLoaded, me);
				}				
			});		
		},
		
		authorizationProcess: function fin_bud_staffing_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_staffing_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			if (fin.staffingUi.doResize) {		
				$("#divStaffingHour").height($(window).height() - 170);
				fin.staffingUi.staffingHourGrid.setHeight($(window).height() - 225);	
			}						
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
		
		defineFormControls: function() {
			var me = this;			
				
			me.shiftType = new ui.ctl.Input.DropDown.Filtered({
		        id: "ShiftType",
				formatFunction: function( type ){ return type.name; },
				changeFunction: function(){ me.shiftChanged(); },
				required : false
		    });
			
			me.anchorAddUnit = new ui.ctl.buttons.Sizeable({
				id: "AnchorAddUnit",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Add Unit&nbsp;&nbsp;</span>",
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
			
			me.defineStaffingHourGrid(false, true);
		},	
		
		defineStaffingHourGrid: function() {
			var args = ii.args(arguments, {
				readOnly: {type: Boolean}
				, showDetail: {type: Boolean}
				, addUnit: {type: Boolean, required: false, defaultValue: false}
			});
			var me = this;
	
			me.doResize = false;
			$("#StaffingHourGrid").html("");
			
			me.staffingHourGrid = new ui.ctl.Grid({
				id: "StaffingHourGrid",
				appendToId: "divForm",
				selectFunction: function(index) {
					if (fin.staffingUi.staffingHours[index]) 
						fin.staffingUi.staffingHours[index].modified = true;
				},
				createNewFunction: fin.bud.staffing.StaffingHour
			});
			
			if (args.readOnly) {
				if (args.showDetail)
					me.staffingHourGrid.addColumn("unitTitle", "unitTitle", "Unit \\ Position", "Unit \\ Position", null);
				else
					me.staffingHourGrid.addColumn("shiftTitle", "shiftTitle", "Shift", "Shift", null);
				me.staffingHourGrid.addColumn("currentSunday", "currentSunday", "Sun", "Sunday", 50);
				me.staffingHourGrid.addColumn("currentMonday", "currentMonday", "Mon", "Monday", 50);
				me.staffingHourGrid.addColumn("currentTuesday", "currentTuesday", "Tue", "Tuesday", 50);
				me.staffingHourGrid.addColumn("currentWednesday", "currentWednesday", "Wed", "Wednesday", 50);
				me.staffingHourGrid.addColumn("currentThursday", "currentThursday", "Thu", "Thursday", 50);
				me.staffingHourGrid.addColumn("currentFriday", "currentFriday", "Fri", "Friday", 50);
				me.staffingHourGrid.addColumn("currentSaturday", "currentSaturday", "Sat", "Saturday", 50);
				me.staffingHourGrid.addColumn("currentWeeklyTotal", "currentWeeklyTotal", "Wkly Total", "Weekly Total", 100);
				me.staffingHourGrid.addColumn("currentHolidays", "currentHolidays", "Legal Hol", "Legal Holidays", 100);
				me.staffingHourGrid.addColumn("proposedSunday", "proposedSunday", "Sun", "Sunday", 50);
				me.staffingHourGrid.addColumn("proposedMonday", "proposedMonday", "Mon", "Monday", 50);
				me.staffingHourGrid.addColumn("proposedTuesday", "proposedTuesday", "Tue", "Tuesday", 50);
				me.staffingHourGrid.addColumn("proposedWednesday", "proposedWednesday", "Wed", "Wednesday", 50);
				me.staffingHourGrid.addColumn("proposedThursday", "proposedThursday", "Thu", "Thursday", 50);
				me.staffingHourGrid.addColumn("proposedFriday", "proposedFriday", "Fri", "Friday", 50);
				me.staffingHourGrid.addColumn("proposedSaturday", "proposedSaturday", "Sat", "Saturday", 50);
				me.staffingHourGrid.addColumn("proposedWeeklyTotal", "proposedWeeklyTotal", "Wkly Total", "Weekly Total", 100);
				me.staffingHourGrid.addColumn("proposedHolidays", "proposedHolidays", "Legal Hol", "Legal Holidays", 100);
			}
			else {
				me.unitTitle = new ui.ctl.Input.Text({
			        id: "UnitTitle",
			        maxLength : 50, 
					appendToId : "staffingHourGrid"
			    });
				
				me.unitTitle.makeEnterTab()
					.setValidationMaster( me.validator )
					.addValidation( ui.ctl.Input.Validation.required )
				
				me.currentSunday = new ui.ctl.Input.Money({
			        id: "CurrentSunday",
					appendToId : "staffingHourGrid"
			    });
				
				me.currentMonday = new ui.ctl.Input.Money({
			        id: "CurrentMonday",
					appendToId : "staffingHourGrid"
			    });
				
				me.currentTuesday = new ui.ctl.Input.Money({
			        id: "CurrentTuesday",
					appendToId : "staffingHourGrid"
			    });
				
				me.currentWednesday = new ui.ctl.Input.Money({
			        id: "CurrentWednesday",
					appendToId : "staffingHourGrid"
			    });
				
				me.currentThursday = new ui.ctl.Input.Money({
			        id: "CurrentThursday",
					appendToId : "staffingHourGrid"
			    });
				
				me.currentFriday = new ui.ctl.Input.Money({
			        id: "CurrentFriday",
					appendToId : "staffingHourGrid"
			    });
				
				me.currentSaturday = new ui.ctl.Input.Money({
			        id: "CurrentSaturday",
					appendToId : "staffingHourGrid"
			    });				
				
				me.currentHolidays = new ui.ctl.Input.Money({
			        id: "CurrentHolidays",
					appendToId : "staffingHourGrid"
			    });
				
				if (!args.addUnit) {
					me.proposedSunday = new ui.ctl.Input.Money({
				        id: "ProposedSunday",
						appendToId : "staffingHourGrid"
				    });
					
					me.proposedMonday = new ui.ctl.Input.Money({
				        id: "ProposedMonday",
						appendToId : "staffingHourGrid"
				    });
					
					me.proposedTuesday = new ui.ctl.Input.Money({
				        id: "ProposedTuesday",
						appendToId : "staffingHourGrid"
				    });
					
					me.proposedWednesday = new ui.ctl.Input.Money({
				        id: "ProposedWednesday",
						appendToId : "staffingHourGrid"
				    });
					
					me.proposedThursday = new ui.ctl.Input.Money({
				        id: "ProposedThursday",
						appendToId : "staffingHourGrid"
				    });
					
					me.proposedFriday = new ui.ctl.Input.Money({
				        id: "ProposedFriday",
						appendToId : "staffingHourGrid"
				    });
					
					me.proposedSaturday = new ui.ctl.Input.Money({
				        id: "ProposedSaturday",
						appendToId : "staffingHourGrid"
				    });				
					
					me.proposedHolidays = new ui.ctl.Input.Money({
				        id: "ProposedHolidays",
						appendToId : "staffingHourGrid"
				    });
				}						
				
				me.staffingHourGrid.addColumn("unitTitle", "unitTitle", "Unit \\ Position", "Unit \\ Position", null, null, me.unitTitle);
				me.staffingHourGrid.addColumn("currentSunday", "currentSunday", "Sun", "Sunday", 50, null, me.currentSunday);
				me.staffingHourGrid.addColumn("currentMonday", "currentMonday", "Mon", "Monday", 50, null, me.currentMonday);
				me.staffingHourGrid.addColumn("currentTuesday", "currentTuesday", "Tue", "Tuesday", 50, null, me.currentTuesday);
				me.staffingHourGrid.addColumn("currentWednesday", "currentWednesday", "Wed", "Wednesday", 50, null, me.currentWednesday);
				me.staffingHourGrid.addColumn("currentThursday", "currentThursday", "Thu", "Thursday", 50, null, me.currentThursday);
				me.staffingHourGrid.addColumn("currentFriday", "currentFriday", "Fri", "Friday", 50, null, me.currentFriday);
				me.staffingHourGrid.addColumn("currentSaturday", "currentSaturday", "Sat", "Saturday", 50, null, me.currentSaturday);
				if (!args.addUnit)
					me.staffingHourGrid.addColumn("currentWeeklyTotal", "currentWeeklyTotal", "Wkly Total", "Weekly Total", 100);
				me.staffingHourGrid.addColumn("currentHolidays", "currentHolidays", "Legal Hol", "Legal Holidays", 100, null, me.currentHolidays);
				
				if (!args.addUnit) {				
					me.staffingHourGrid.addColumn("proposedSunday", "proposedSunday", "Sun", "Sunday", 50, null, me.proposedSunday);
					me.staffingHourGrid.addColumn("proposedMonday", "proposedMonday", "Mon", "Monday", 50, null, me.proposedMonday);
					me.staffingHourGrid.addColumn("proposedTuesday", "proposedTuesday", "Tue", "Tuesday", 50, null, me.proposedTuesday);
					me.staffingHourGrid.addColumn("proposedWednesday", "proposedWednesday", "Wed", "Wednesday", 50, null, me.proposedWednesday);
					me.staffingHourGrid.addColumn("proposedThursday", "proposedThursday", "Thu", "Thursday", 50, null, me.proposedThursday);
					me.staffingHourGrid.addColumn("proposedFriday", "proposedFriday", "Fri", "Friday", 50, null, me.proposedFriday);
					me.staffingHourGrid.addColumn("proposedSaturday", "proposedSaturday", "Sat", "Saturday", 50, null, me.proposedSaturday);
					me.staffingHourGrid.addColumn("proposedWeeklyTotal", "proposedWeeklyTotal", "Wkly Total", "Weekly Total", 100);
					me.staffingHourGrid.addColumn("proposedHolidays", "proposedHolidays", "Legal Hol", "Legal Holidays", 100, null, me.proposedHolidays);
				}					
			}	
			
			if (args.addUnit) {		
				me.staffingHourGrid.allowAdds = true;
			}		
		
			me.staffingHourGrid.capColumns();
			me.doResize = true;
		},		
		
		configureCommunications: function() {
			var args = ii.args(arguments, {});
			var me = this;

			me.shiftTypes = [];
			me.shiftTypeStore = me.cache.register({
				storeId: "budShiftTypes",
				itemConstructor: fin.bud.staffing.ShiftType,
				itemConstructorArgs: fin.bud.staffing.shiftTypeArgs,
				injectionArray: me.shiftTypes
			});
			
			me.staffingHours = [];
			me.staffingHourStore = me.cache.register({
				storeId: "budStaffingHours",
				itemConstructor: fin.bud.staffing.StaffingHour,
				itemConstructorArgs: fin.bud.staffing.staffingHourArgs,
				injectionArray: me.staffingHours
			});	
		},
		
		shiftTypesLoaded: function(me, activeId) {
						
			me.shiftType.setData(me.shiftTypes);
			me.shiftType.select(0, me.shiftType.focused);
			me.shift = me.shiftTypes[me.shiftType.indexSelected].id;
			
			me.staffingHourStore.fetch("userId:[user],houseCode:" + me.houseCode + ",year:" + me.yearId + ",shiftType:" + me.shift, me.staffingHoursLoaded, me);
		},
		
		staffingHoursLoaded: function(me, activeId) {
				
			me.staffingHourGrid.setData(me.staffingHours);
			me.generateTotalRow();
			$("#pageLoading").hide();
		},
		
		generateTotalRow: function() {
			var me = this;
			var index = 0;
			var total = new Array(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
			var rowHtml = "";
			var width = "";
		
			for (index = 0; index < me.staffingHours.length; index++) {
				total[0] += parseFloat(me.staffingHours[index].currentSunday);
				total[1] += parseFloat(me.staffingHours[index].currentMonday);
				total[2] += parseFloat(me.staffingHours[index].currentTuesday);
				total[3] += parseFloat(me.staffingHours[index].currentWednesday);
				total[4] += parseFloat(me.staffingHours[index].currentThursday);
				total[5] += parseFloat(me.staffingHours[index].currentFriday);
				total[6] += parseFloat(me.staffingHours[index].currentSaturday);
				total[7] += parseFloat(me.staffingHours[index].currentWeeklyTotal);
				total[8] += parseFloat(me.staffingHours[index].currentHolidays);
				total[9] += parseFloat(me.staffingHours[index].proposedSunday);
				total[10] += parseFloat(me.staffingHours[index].proposedMonday);
				total[11] += parseFloat(me.staffingHours[index].proposedTuesday);
				total[12] += parseFloat(me.staffingHours[index].proposedWednesday);
				total[13] += parseFloat(me.staffingHours[index].proposedThursday);
				total[14] += parseFloat(me.staffingHours[index].proposedFriday);
				total[15] += parseFloat(me.staffingHours[index].proposedSaturday);
				total[16] += parseFloat(me.staffingHours[index].proposedWeeklyTotal);
				total[17] += parseFloat(me.staffingHours[index].proposedHolidays);
			}
			
			width = me.staffingHourGrid.header.element[0].childNodes[0].style.cssText;
			rowHtml += '<div class="iiGridFooterColumn" style="' + width + '"></div>';
			width = me.staffingHourGrid.header.element[0].childNodes[1].style.cssText;
			rowHtml += '<div class="iiGridFooterColumn" style="text-align: center; ' + width + '">Total</div>';
			
			for (index = 0; index < total.length; index++) {
				width = me.staffingHourGrid.header.element[0].childNodes[index + 2].style.cssText;
				rowHtml += '<div class="iiGridFooterColumn" style="' + width + '">' + total[index].toString() + '</div>';
			}
			
			rowHtml += '<div class="iiGridFooterColumnEndCap"><input class="iiGridFocusInput"/></div>'
				
			$("#StaffingHourTotalGrid").html(rowHtml);		
		
			var StaffChanges = total[16] - total[7];
            var ShortStaffChanges = total[10] - total[17];
					
		    if (StaffChanges >= 0)
				$("#PlannedReduction").text(StaffChanges);
			else
				$("#PlannedReduction").text("(" + Math.abs(StaffChanges)+ ")");
			if (ShortStaffChanges >= 0)
				$("#StaffingReduction").text(ShortStaffChanges);
			else
				$("#StaffingReduction").text("(" + Math.abs(ShortStaffChanges) + ")");
		},
				
		shiftChanged: function() {
			var args = ii.args(arguments,{});
			var me = this;
			
			$("#pageLoading").show();
			me.shift = me.shiftTypes[me.shiftType.indexSelected].id;
			me.staffingHourStore.fetch("userId:[user],houseCode:" + me.houseCode + ",year:" + me.yearId + ",shiftType:" + me.shift, me.staffingHoursLoaded, me);
		},
		
		actionNewItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
		
			if (me.status == "") {
				me.status = "New";
				$("#pageLoading").show();
				$("#divGrid").width("100%");
				$(".divGridHeader").css({"width": "100%"});
				$("#StaffingHourTotalGrid").hide();
				$("#headerProposedStaffing").hide();				
			
				me.defineStaffingHourGrid(false, true, true);
				me.staffingHourStore.reset();
				me.staffingHourGrid.setData([]);
				me.staffingHourGrid.setHeight($(window).height() - 225);
				
				$("#pageLoading").hide();
			}		
		},
		
		setGridWidth: function() {
			var me = this; 
			$("#divGrid").width(1400);
			$(".divGridHeader").css({"width": "50%"});
			$("#StaffingHourTotalGrid").show();
			$("#headerProposedStaffing").show();
			$("#divStaffingHour").height($(window).height() - 170);
			me.staffingHourGrid.setHeight($(window).height() - 225);
			me.status = "";
		},
		
		actionUndoItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var reload = false;			
			
			if (me.status == "New") {
				$("#pageLoading").show();				
				me.defineStaffingHourGrid(false, true);
				me.setGridWidth();
				reload = true;
			}
			else {
				for (var index = 0; index < me.staffingHours.length; index++) {
					if (me.staffingHours[index].modified == true) {
						reload = true;
						break;						
					}
				}				
			}
			
			if (reload) {
				$("#pageLoading").show();
				me.staffingHourStore.reset();
				me.staffingHourStore.fetch("userId:[user],houseCode:" + me.houseCode + ",year:" + me.yearId + ",shiftType:" + me.shift, me.staffingHoursLoaded, me);
			}		
			
			me.status = "";
		},
		
		actionSaveItem: function() {
			var args = ii.args(arguments,{});
			var me = this;
			var items = [];
			var staffing;
			
			me.staffingHourGrid.body.deselectAll();
			me.validator.forceBlur();
			
			// Check to see if the data entered is valid
			if(!me.validator.queryValidity(true) && me.staffingHourGrid.activeRowIndex >= 0) {
				alert( "In order to save, the errors on the page must be corrected.");
				return false;
			}			
		
			for (var index = 0; index < me.staffingHourGrid.data.length; index++) {
				if(me.staffingHourGrid.data[index].modified == true || me.status == "New") {
					staffing = new fin.bud.staffing.StaffingHour (
						me.staffingHourGrid.data[index].id
						, me.houseCode
						, me.yearId
						, me.shift
						, me.staffingHourGrid.data[index].unit
						, me.staffingHourGrid.data[index].shiftTitle
						, me.staffingHourGrid.data[index].unitTitle
						, me.staffingHourGrid.data[index].currentSunday
						, me.staffingHourGrid.data[index].currentMonday
						, me.staffingHourGrid.data[index].currentTuesday
						, me.staffingHourGrid.data[index].currentWednesday
						, me.staffingHourGrid.data[index].currentThursday
						, me.staffingHourGrid.data[index].currentFriday
						, me.staffingHourGrid.data[index].currentSaturday
						, me.staffingHourGrid.data[index].currentWeeklyTotal
						, me.staffingHourGrid.data[index].currentHolidays
						, me.staffingHourGrid.data[index].proposedSunday
						, me.staffingHourGrid.data[index].proposedMonday
						, me.staffingHourGrid.data[index].proposedTuesday
						, me.staffingHourGrid.data[index].proposedWednesday
						, me.staffingHourGrid.data[index].proposedThursday
						, me.staffingHourGrid.data[index].proposedFriday
						, me.staffingHourGrid.data[index].proposedSaturday
						, me.staffingHourGrid.data[index].proposedWeeklyTotal
						, me.staffingHourGrid.data[index].proposedHolidays
						, me.staffingHourGrid.data[index].modified					
					);

					items.push(staffing);
				}				
			}

			if(items.length <= 0 ) //no records modified
				return;
							
			$("#messageToUser").text("Saving");
			$("#pageLoading").show();			
			
			var xml = me.saveXmlBuildStaffingHour(items);
	
			// Send the object back to the server as a transaction
			me.transactionMonitor.commit({
				transactionType: "itemUpdate",
				transactionXml: xml,
				responseFunction: me.saveResponse,
				referenceData: {me: me, item: items}
			});
			
			return true;
		},
		
		saveXmlBuildStaffingHour: function() {
			var args = ii.args(arguments, {
				items: { type: [fin.bud.staffing.StaffingHour] }
			});
			var me = this;
			var items = args.items;
			var xml = "";
			
			for (index in items) {
				xml += '<budStaffingHour';
				xml += ' id="' + items[index].id + '"';
				xml += ' houseCode="' + items[index].houseCode + '"';
				xml += ' year="' + items[index].year + '"';
				xml += ' shiftType="' + items[index].shiftType + '"';
				xml += ' unit="' + items[index].unit + '"';
				xml += ' unitTitle="' + items[index].unitTitle + '"';
				xml += ' currentSunday="' + items[index].currentSunday + '"';
				xml += ' currentMonday="' + items[index].currentMonday + '"';
				xml += ' currentTuesday="' + items[index].currentTuesday + '"';
				xml += ' currentWednesday="' + items[index].currentWednesday + '"';
				xml += ' currentThursday="' + items[index].currentThursday + '"';
				xml += ' currentFriday="' + items[index].currentFriday + '"';
				xml += ' currentSaturday="' + items[index].currentSaturday + '"';
				xml += ' currentHolidays="' + items[index].currentHolidays + '"';
				xml += ' proposedSunday="' + items[index].proposedSunday + '"';
				xml += ' proposedMonday="' + items[index].proposedMonday + '"';
				xml += ' proposedTuesday="' + items[index].proposedTuesday + '"';
				xml += ' proposedWednesday="' + items[index].proposedWednesday + '"';
				xml += ' proposedThursday="' + items[index].proposedThursday + '"';
				xml += ' proposedFriday="' + items[index].proposedFriday + '"';
				xml += ' proposedSaturday="' + items[index].proposedSaturday + '"';
				xml += ' proposedHolidays="' + items[index].proposedHolidays + '"';
				xml += '/>';
			}		

			return xml;
		},
		
		/* @iiDoc {Method}
		 * Handles the server's response to a save transaction.
		 */
		saveResponse: function() {
			var args = ii.args(arguments, {
				transaction: {type: ii.ajax.TransactionMonitor.Transaction},	
				xmlNode: {type: "XmlNode:transaction"}							
			});
			var transaction = args.transaction;
			var me = transaction.referenceData.me;
			var errorMessage = "";
			var status = $(args.xmlNode).attr("status");
						
			if (status == "success") {
				if (me.status == "New") {									
					me.defineStaffingHourGrid(false, true);
					me.setGridWidth();
					me.staffingHourStore.reset();
					me.staffingHourGrid.setData([]);
					me.staffingHourStore.fetch("userId:[user],houseCode:" + me.houseCode + ",year:" + me.yearId + ",shiftType:" + me.shift, me.staffingHoursLoaded, me);
				}
				else
					$("#pageLoading").hide();			
			}
			else {
				errorMessage = "[SAVE FAILURE] Error while updating Staffing Hour Record: " + $(args.xmlNode).attr("message")
				alert(errorMessage);
				$("#pageLoading").hide();						
			}
			
			$("#messageToUser").text("Loading");
				
		}
		
	}
});

function main() {
	fin.staffingUi = new fin.bud.staffing.UserInterface();
	fin.staffingUi.resize();
}

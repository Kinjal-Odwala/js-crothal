ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.toolbar" );
ii.Import("ui.ctl.usr.buttons");
ii.Import( "fin.bud.laborCalculations.usr.defs" );

ii.Style( "style" , 1);
ii.Style( "fin.cmn.usr.common" , 2);
ii.Style( "fin.cmn.usr.statusBar" , 3);
ii.Style( "fin.cmn.usr.toolbar" , 4);
ii.Style( "fin.cmn.usr.input" , 5);
ii.Style( "fin.cmn.usr.grid" , 6);
ii.Style( "fin.cmn.usr.button" , 7);
ii.Style( "fin.cmn.usr.dropDown" , 8);
ii.Style( "fin.cmn.usr.dateDropDown" , 9);

ii.Class({
    Name: "fin.bud.laborCalculations.UserInterface",
    Definition: {
	
		init: function(){
			var args = ii.args(arguments, {});
			var me = this;

			me.gateway = ii.ajax.addGateway("fsc", ii.config.xmlProvider); 
			me.cache = new ii.ajax.Cache(me.gateway);
			
			me.authorizer = new ii.ajax.Authorizer( me.gateway );	//@iiDoc {Property:ii.ajax.Authorizer} Boolean
			me.authorizePath = "bud\\laborCalculations";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded(){
					me.authorizationProcess.apply(me);
				},
				me);
			
			me.session = new ii.Session(me.cache);

			me.defineFormControls();
			me.configureCommunications();
			
			$(window).bind("resize", me, me.resize);
			$().bind("keydown", me, me.controlKeyProcessor);
			$("#LegalHolidays").hide();
			$("#Vacation").hide();
			$("#ProdEmployees").hide();
			$("#ProductivePerEmployee").hide();
			$("#ComputationLaborStandards").hide();
			$("#ComputationLaborStandardsDollars").hide();
			/*
$("input[@name='StaffingOption']").click
			//$("input[@StaffingOption]").click
			(function(){
				if (this.id == 'CurrentStaffing') {
					$('#WorksheetProposedStaffing').hide();
					$('#WorksheetCurrentStaffing').show();
					fin.staffingUI.detailWorksheetCurrentStaffing.setHeight($(fin.staffingUI.detailWorksheetCurrentStaffing.element).parent().height() - 2);
					fin.staffingUI.detailWorksheetProposedStaffing.setHeight($(fin.staffingUI.detailWorksheetProposedStaffing.element).parent().height() - 2);
				}
				
				if (this.id == 'ProposedStaffing') {
					$('#WorksheetCurrentStaffing').hide();
					$('#WorksheetProposedStaffing').show();
					fin.staffingUI.summaryWorksheetCurrentStaffing.setHeight($(fin.staffingUI.summaryWorksheetCurrentStaffing.element).parent().height() - 2);
					fin.staffingUI.summaryWorksheetProposedStaffing.setHeight($(fin.staffingUI.summaryWorksheetProposedStaffing.element).parent().height() - 2);
				}
				
			});
*/
			
			
			$("input[@name='LaborOption']").click(function() {
	
				if (this.id == "SickPayLabor") {
					$("#SickPay").show();
					$("#LegalHolidays").hide();
					$("#Vacation").hide();
					$("#ProdEmployees").hide();
					$("#ProductivePerEmployee").hide();
					$("#ComputationLaborStandards").hide();
					$("#ComputationLaborStandardsDollars").hide();
				}
				
				if (this.id == "LegalHolidaysLabor") {
					$("#LegalHolidays").show();
					$("#SickPay").hide();
					$("#Vacation").hide();
					$("#ProdEmployees").hide();
					$("#ProductivePerEmployee").hide();
					$("#ComputationLaborStandards").hide();
					$("#ComputationLaborStandardsDollars").hide();
				}
				
				if (this.id == "VacationLabor") {
					$("#Vacation").show();
					$("#SickPay").hide();
					$("#LegalHolidays").hide();
					$("#ProdEmployees").hide();
					$("#ProductivePerEmployee").hide();
					$("#ComputationLaborStandards").hide();
					$("#ComputationLaborStandardsDollars").hide();
				}
				if (this.id == "EmployeesHealthDentalLabor") {
					$("#ProdEmployees").show();
					$("#SickPay").hide();
					$("#LegalHolidays").hide();
					$("#Vacation").hide();
					$("#ProductivePerEmployee").hide();
					$("#ComputationLaborStandards").hide();
					$("#ComputationLaborStandardsDollars").hide();
				}
				if (this.id == "ProdDaysLabor") {
					$("#ProductivePerEmployee").show();
					$("#SickPay").hide();
					$("#LegalHolidays").hide();
					$("#Vacation").hide();
					$("#ProdEmployees").hide();
					$("#ComputationLaborStandards").hide();
					$("#ComputationLaborStandardsDollars").hide();
				}
				if (this.id == "LaborStandardsLabor") {
					$("#ComputationLaborStandards").show();
					$("#SickPay").hide();
					$("#LegalHolidays").hide();
					$("#Vacation").hide();
					$("#ProdEmployees").hide();
					$("#ProductivePerEmployee").hide();
					$("#ComputationLaborStandardsDollars").hide();
				}
				if (this.id == "LaborStandardsInDollarsLabor") {
					$("#ComputationLaborStandardsDollars").show();
					$("#SickPay").hide();
					$("#LegalHolidays").hide();
					$("#Vacation").hide();
					$("#ProdEmployees").hide();
					$("#ProductivePerEmployee").hide();
					$("#ComputationLaborStandards").hide();
				}				
			});
		
		},
		
		authorizationProcess: function fin_bud_laborCalculations_UserInterface_authorizationProcess(){
			var args = ii.args(arguments,{});
			var me = this;

			$("#pageLoading").hide();
		
			me.isAuthorized = me.authorizer.isAuthorized( me.authorizePath);
				
			ii.timer.timing("Page displayed");
			me.session.registerFetchNotify(me.sessionLoaded,me);
		},	
		
		sessionLoaded: function fin_bud_laborCalculations_UserInterface_sessionLoaded(){
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("session loaded.", ii.traceTypes.Information, "Session");
		},
		
		defineFormControls: function(){
			var me = this;

			me.holidayPeriodGrid = new ui.ctl.Grid({
				id: "HolidayPeriodGrid",
				appendToId: "divForm",
				allowAdds: true
			});
			me.holidayPeriodGrid.addColumn("Holiday", "Holiday", "Holiday", "Holiday", 250);
			me.holidayPeriodGrid.addColumn("Period", "Period", "Period", "Period",null);
			me.holidayPeriodGrid.capColumns();
			me.holidayPeriodGrid.setHeight($(me.holidayPeriodGrid.element).parent().height() - 2);
			
			me.vacationGrid = new ui.ctl.Grid({
				id: "VacationGrid",
				appendToId: "divForm",
				allowAdds: true
			});
			me.vacationGrid.addColumn("Employees", "Employees", "Employees", "Employees", 150);
			me.vacationGrid.addColumn("Annual Vacation Entitlement", "Annual Vacation Entitlement ", " Annual Vacation Entitlement ", " Annual Vacation Entitlement ", 300);
			me.vacationGrid.addColumn("Proj Vac Days Entitlement", "Proj Vac Days Entitlement", "Proj Vac Days Entitlement", "Proj Vac Days Entitlement",null);
			me.vacationGrid.capColumns();
			me.vacationGrid.setHeight($(me.vacationGrid.element).parent().height() - 2);
			
			me.employeesGrid = new ui.ctl.Grid({
				id: "EmployeesGrid",
				appendToId: "divForm",
				allowAdds: true
			});
			me.employeesGrid.addColumn(" ", " ", " ", " ", 45);
			me.employeesGrid.addColumn("Medical 1", "Medical 1 ", " Medical 1 ", " Medical 1 ", 95);
			me.employeesGrid.addColumn("Medical 2", "Medical 2", "Medical 2", "Medical 2", 95);
			me.employeesGrid.addColumn("Liberty Plan", "Liberty Plan", "Liberty Plan", "Liberty Plan", 130);
			me.employeesGrid.addColumn("Dental Only", "Dental Only", "Dental Only", "Dental Only", 130);
			me.employeesGrid.addColumn("Total", "Total", "Total", "Total", 70);
			me.employeesGrid.addColumn("Life", "Life", "Life", "Life", 50);
			me.employeesGrid.addColumn("Union", "Union", "Union", "Union", null);
			me.employeesGrid.capColumns();
			me.employeesGrid.setHeight($(me.employeesGrid.element).parent().height() - 2);
			
			me.biweeklyGrid = new ui.ctl.Grid({
				id: "BiweeklyGrid",
				appendToId: "divForm",
				allowAdds: true
			});
			me.biweeklyGrid.addColumn(" ", " ", " ", " ", 45);
			me.biweeklyGrid.addColumn("Medical 1", "Medical 1 ", " Medical 1 ", " Medical 1 ", 95);
			me.biweeklyGrid.addColumn("Medical 2", "Medical 2", "Medical 2", "Medical 2", 95);
			me.biweeklyGrid.addColumn("Liberty Plan", "Liberty Plan", "Liberty Plan", "Liberty Plan", 130);
			me.biweeklyGrid.addColumn("Dental Only", "Dental Only", "Dental Only", "Dental Only", 130);
			me.biweeklyGrid.addColumn("Total", "Total", "Total", "Total", 70);
			me.biweeklyGrid.addColumn("Life", "Life", "Life", "Life", 50);
			me.biweeklyGrid.addColumn("Union", "Union", "Union", "Union", null);
			me.biweeklyGrid.capColumns();
			me.biweeklyGrid.setHeight($(me.biweeklyGrid.element).parent().height() - 2);
			
			me.productiveEmployees  = new ui.ctl.Grid({
				id: "ProductiveEmployees ",
				appendToId: "divForm",
				allowAdds: true
			});
			me.productiveEmployees.addColumn("Period", "Period", "Period", "Period", 70);
			me.productiveEmployees.addColumn("1", "1 ", "1 ", "1 ", 35);
			me.productiveEmployees.addColumn("2", "2", "2", "2", 35);
			me.productiveEmployees.addColumn("3", "3", "3", "3", 35);
			me.productiveEmployees.addColumn("4", "4", "4", "4", 35);
			me.productiveEmployees.addColumn("5", "5", "5", "5", 35);
			me.productiveEmployees.addColumn("6", "6", "6", "6", 35);
			me.productiveEmployees.addColumn("7", "7", "7", "7", 35);
			me.productiveEmployees.addColumn("8", "8", "8", "8", 35);
			me.productiveEmployees.addColumn("9", "9", "9", "9", 35);
			me.productiveEmployees.addColumn("10", "10", "10", "10", 40);
			me.productiveEmployees.addColumn("11", "11", "11", "11", 40);
			me.productiveEmployees.addColumn("12", "12", "12", "12", 40);
			me.productiveEmployees.addColumn("13", "13", "13", "13", 40);
			me.productiveEmployees.addColumn("Total", "Total", "Total", "Total", null);
			me.productiveEmployees.capColumns();
			me.productiveEmployees.setHeight($(me.productiveEmployees.element).parent().height() - 2);
			
			me.summaryWorksheetProposedStaffing = new ui.ctl.Grid({
				id: "SummaryWorksheetProposedStaffing",
				appendToId: "divForm",
				allowAdds: true
			});
			me.summaryWorksheetProposedStaffing.addColumn("Unit \ Position", "Unit \ Position", "Unit \ Position", "Unit \ Position", 125);
			me.summaryWorksheetProposedStaffing.addColumn("Sun", "Sun ", " Sun ", " Sun ", 50);
			me.summaryWorksheetProposedStaffing.addColumn("Mon", "Mon", "Mon", "Mon", 50);
			me.summaryWorksheetProposedStaffing.addColumn("Tues", "Tues", "Tues", "Tues", 50);
			me.summaryWorksheetProposedStaffing.addColumn("Weds", "Weds", "Weds", "Weds", 50);
			me.summaryWorksheetProposedStaffing.addColumn("Thurs", "Thurs", "Thurs", "Thurs", 70);
			me.summaryWorksheetProposedStaffing.addColumn("Fri", "Fri", "Fri", "Fri", 50);
			me.summaryWorksheetProposedStaffing.addColumn("Sat", "Sat", "Sat", "Sat", 50);
			me.summaryWorksheetProposedStaffing.addColumn("Wkly Total", "Wkly Total", "Wkly Total", "Wkly Total", 110);
			me.summaryWorksheetProposedStaffing.addColumn("Legal Hol", "Legal Hol", "Legal Hol", "Legal Hol",null);
			me.summaryWorksheetProposedStaffing.capColumns();
			me.summaryWorksheetProposedStaffing.setHeight($(me.summaryWorksheetProposedStaffing.element).parent().height() - 2);

			me.productivePerEmployeeGrid = new ui.ctl.Grid({
				id: "ProductivePerEmployeeGrid",
				appendToId: "divForm",
				allowAdds: true
			});
			me.productivePerEmployeeGrid.addColumn("Paid Leave", "Paid Leave", "Paid Leave", "Paid Leave", 125);
			me.productivePerEmployeeGrid.addColumn("Days", "Days ", " Days ", " Days ", 50);
			me.productivePerEmployeeGrid.addColumn("Percentage", "Percentage", "Percentage", "Percentage",null);
			me.productivePerEmployeeGrid.capColumns();
			me.productivePerEmployeeGrid.setHeight($(me.productivePerEmployeeGrid.element).parent().height() - 2);
			
			$("#pageLoading").hide();
		},
			
		
		configureCommunications: function(){
			
				var Test7 = "Estimated date of increase (period)";
				var rowHtml = "";
				for (var index = 0; index < 2; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='300px'>" + Test7 + "</td>";
					rowHtml += "<td class='textAlign' width='150px'><input id='TextBox' type='text' value='80%' readonly></td>";
					rowHtml += "</tr>";
				}

				$("#LivingIncrease").html(rowHtml);
				
				$("#LivingIncrease tr:odd").addClass("grid_row");
				$("#LivingIncrease tr:even").addClass("grid_row_alternate");
				$("#LivingIncrease tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
			
				var Test6 = "";
				var rowHtml = "";
				for (var index = 0; index < 8; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='500px'>" + '&nbsp;' + "</td>";
					rowHtml += "<td class='textAlign' width='150px'>" + 100 + "</td>";
					rowHtml += "</tr>";
				}

				$("#MeritIncrease").html(rowHtml);
				
				$("#MeritIncrease tr:odd").addClass("grid_row");
				$("#MeritIncrease tr:even").addClass("grid_row_alternate");
				$("#MeritIncrease tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
				
				var Test5 = "Sick Pay Standard";
				var rowHtml = "";
				for (var index = 0; index < 5; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='500px'>" + Test5 + "</td>";
					rowHtml += "<td class='textAlign' width='150px'>" + 962 + "</td>";
					rowHtml += "</tr>";
				}

				$("#ComputationStandard").html(rowHtml);
				
				$("#ComputationStandard tr:odd").addClass("grid_row");
				$("#ComputationStandard tr:even").addClass("grid_row_alternate");
				$("#ComputationStandard tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
				
				var Test4 = "Non replacement of employees on vacation";
				var rowHtml = "";
				for (var index = 0; index < 4; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='300px'>" + Test4 + "</td>";
					rowHtml += "<td class='textAlign' width='150px'><input id='TextBox' type='text' value='80%' readonly></td>";
					rowHtml += "<td class='textAlign' width='200px'>" + 9621 + "</td>";
					rowHtml += "</tr>";
				}

				$("#AdjustedLaborStandard").html(rowHtml);
				
				$("#AdjustedLaborStandard tr:odd").addClass("grid_row");
				$("#AdjustedLaborStandard tr:even").addClass("grid_row_alternate");
				$("#AdjustedLaborStandard tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
			
				var Test3 = "Projected number of new employees";
				var rowHtml = "";
				for (var index = 0; index < 2; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='500px'>" + Test3 + "</td>";
					rowHtml += "<td class='textAlign' width='150px'><input id='TextBox' type='text' value='0.00' readonly></td>";
					rowHtml += "</tr>";
				}

				$("#LaborStandard").html(rowHtml);
				
				$("#LaborStandard tr:odd").addClass("grid_row");
				$("#LaborStandard tr:even").addClass("grid_row_alternate");
				$("#LaborStandard tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
				
				var Test2 = "Hours Per Day Per Employee";
				var rowHtml = "";
				for (var index = 0; index < 2; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='500px'>" + Test2 + "</td>";
					rowHtml += "<td class='textAlign' width='150px'><input id='TextBox' type='text' value='0.00' readonly></td>";
					rowHtml += "</tr>";
				}

				$("#EstimateGrid").html(rowHtml);
				
				$("#EstimateGrid tr:odd").addClass("grid_row");
				$("#EstimateGrid tr:even").addClass("grid_row_alternate");
				$("#EstimateGrid tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
				
				var Test = "testing";
				var rowHtml = "";
				for (var index = 0; index < 5; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='500px'>" + Test + "</td>";
					rowHtml += "<td class='textAlign' width='150px'><input id='TextBox' type='text' value='0.00' readonly></td>";
					rowHtml += "</tr>";
				}

				$("#SickPayGrid").html(rowHtml);
				
				$("#SickPayGrid tr:odd").addClass("grid_row");
				$("#SickPayGrid tr:even").addClass("grid_row_alternate");
				$("#SickPayGrid tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
				
				var Test1 = "testing Legal Holidays";
				var rowHtml = "";
				for (var index = 0; index < 5; index++) {
					rowHtml += "<tr>";
					rowHtml += "<td class='textAlign' width='500px'>" + Test1 + "</td>";
					rowHtml += "<td class='textAlign' width='150px'><input id='TextBox' type='text' value='0.00' readonly></td>";
					rowHtml += "</tr>";
				}

				$("#LegalHolidaysGrid").html(rowHtml);
				
				$("#LegalHolidaysGrid tr:odd").addClass("grid_row");
				$("#LegalHolidaysGrid tr:even").addClass("grid_row_alternate");
				$("#LegalHolidaysGrid tr").mouseover(function(){
					$(this).addClass("grid_row_over");
				}).mouseout(function(){
					$(this).removeClass("grid_row_over");
				}).click(function(){
					$(this).toggleClass("grid_row_click");
				});
		
			
		},

		resize: function(){
			var args = ii.args(arguments,{});
			var me = this;
		}
		}
});



function main(){
	fin.staffingUI = new fin.bud.laborCalculations.UserInterface();
	fin.staffingUI.resize();
}

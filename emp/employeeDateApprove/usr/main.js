ii.Import( "ii.krn.sys.ajax" );
ii.Import( "ii.krn.sys.session" );
ii.Import( "ui.ctl.usr.input" );
ii.Import( "ui.ctl.usr.grid" );
ii.Import( "ui.ctl.usr.statusBar" );
ii.Import( "ui.cmn.usr.text" );
ii.Import( "fin.cmn.usr.util" );
ii.Import( "fin.cmn.usr.defs" );
ii.Import( "fin.emp.employeeDateApprove.usr.defs" );

ii.Style( "style", 1 );
ii.Style( "fin.cmn.usr.common", 2 );
ii.Style( "fin.cmn.usr.statusBar", 3 );
ii.Style( "fin.cmn.usr.toolbar", 4 );
ii.Style( "fin.cmn.usr.input", 5 );
ii.Style( "fin.cmn.usr.grid", 6 );
ii.Style( "fin.cmn.usr.button", 7 );

ii.Class({
    Name: "fin.emp.UserInterface",
	Definition: {
	
		init: function fin_emp_UserInterface_init() {
			var args = ii.args(arguments, {});
			var me = this;

			me.loadCount = 0;
			me.status = "";

			me.gateway = ii.ajax.addGateway("emp", ii.config.xmlProvider);
			me.cache = new ii.ajax.Cache(me.gateway);
			me.transactionMonitor = new ii.ajax.TransactionMonitor( 
				me.gateway, 
				function(status, errorMessage) { me.nonPendingError(status, errorMessage); }
			);

			me.validator = new ui.ctl.Input.Validation.Master();
			me.session = new ii.Session(me.cache);

			me.authorizer = new ii.ajax.Authorizer( me.gateway );
			me.authorizePath = "\\crothall\\chimes\\fin\\Setup\\EmpDateApprove";
			me.authorizer.authorize([me.authorizePath],
				function authorizationsLoaded() {
					me.authorizationProcess.apply(me);
				},
				me);

			me.defineFormControls();
			me.configureCommunications();
			me.setStatus("Loading");

			$(window).bind("resize", me, me.resize);
			if (top.ui.ctl.menu) {
				top.ui.ctl.menu.Dom.me.registerDirtyCheck(me.dirtyCheck, me);
			}

			// Disable the context menu but not on localhost because its used for debugging
			if (location.hostname != "localhost") {
				$(document).bind("contextmenu", function(event) {
					return false;
				});
			}
		},

		authorizationProcess: function fin_emp_UserInterface_authorizationProcess() {
			var args = ii.args(arguments,{});
			var me = this;

			me.isAuthorized = me.authorizer.isAuthorized(me.authorizePath);

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
				me.session.registerFetchNotify(me.sessionLoaded, me);
				me.employeeStore.fetch("userId:[user],object:DateModification,batch:0,startPoint:0,maximumRows:0", me.employeesLoaded, me);
			}
			else
				window.location = ii.contextRoot + "/app/usr/unAuthorizedUI.htm";
		},

		sessionLoaded: function fin_emp_UserInterface_sessionLoaded() {
			var args = ii.args(arguments, {
				me: {type: Object}
			});

			ii.trace("Session Loaded", ii.traceTypes.Information, "Session");
		},
		
		resize: function() {
			
			if (!fin.employeeDateApproveUi) return;

		    fin.employeeDateApproveUi.employeeGrid.setHeight($(window).height() - 155);
		},
		
		defineFormControls: function() {
			var me = this;

			me.employeeGrid = new ui.ctl.Grid({
				id: "EmployeeGrid",
				appendToId: "divForm",
				allowAdds: false
			});

			me.employeeGrid.addColumn("assigned", "assigned", "", "", 30, function() {
				var index = me.employeeGrid.rows.length - 1;
                return "<input type=\"checkbox\" id=\"assignInputCheck" + index + "\" class=\"iiInputCheck\" onclick=\"fin.employeeDateApproveUi.actionClickItem(this);\" />";
            });
			me.employeeGrid.addColumn("column4", "column4", "House Code", "House Code", 90);
			me.employeeGrid.addColumn("column5", "column5", "First Name", "First Name", null);
			me.employeeGrid.addColumn("column6", "column6", "Last Name", "Last Name", 120);
			me.employeeGrid.addColumn("column7", "column7", "Employee #", "Employee Number", 90);
			me.employeeGrid.addColumn("column15", "column15", "Hire Date", "Hire Date", 80);
			me.employeeGrid.addColumn("column16", "column16", "Original Hire Date", "Original Hire Date", 120);
			me.employeeGrid.addColumn("column17", "column17", "Seniority Date", "Seniority Date", 120);
			me.employeeGrid.addColumn("column18", "column18", "Effective Date", "Effective Date", 80);
			me.employeeGrid.addColumn("column19", "column19", "Effective Date Job", "Effective Date Job", 80);
			me.employeeGrid.addColumn("column20", "column20", "Effective Date Compensation", "Effective Date Compensation", 120);
			me.employeeGrid.capColumns();

			me.selectAll = new ui.ctl.Input.Check({
		        id: "SelectAll",
				changeFunction: function() { me.actionSelectAllItem(); }
		    });
			
			me.anchorApprove = new ui.ctl.buttons.Sizeable({
				id: "AnchorApprove",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Approve&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionApproveItem(); },
				hasHotState: true
			});

			me.anchorReject = new ui.ctl.buttons.Sizeable({
				id: "AnchorReject",
				className: "iiButton",
				text: "<span>&nbsp;&nbsp;Reject&nbsp;&nbsp;</span>",
				clickFunction: function() { me.actionRejectItem(); },
				hasHotState: true
			});
		},		

		configureCommunications: function fin_emp_UserInterface_configureCommunications() {
			var args = ii.args(arguments, {});
			var me = this;

			me.employees = [];
			me.employeeStore = me.cache.register({
				storeId: "appGenericImports",
				itemConstructor: fin.emp.EmployeeGeneral,
				itemConstructorArgs: fin.emp.employeeGeneralArgs,
				injectionArray: me.employees
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
		
		employeesLoaded: function(me, activeId) { 

			me.employeeGrid.setData(me.employees);
			me.setStatus("Loaded");
			me.checkLoadCount();
		},
		
		actionClickItem: function(objCheckBox) {
			var me = this;
			var allSelected = true;

			if (objCheckBox.checked) {
				for (var index = 0; index < me.employees.length; index++) {
					if ($("#assignInputCheck" + index)[0].checked == false) {
						allSelected = false;
						break;
					}
				}
			}
			else
				allSelected = false;
			
			me.modified();
			me.selectAll.setValue(allSelected.toString());
		},
		
		actionSelectAllItem: function() {
			var me = this;

			me.modified(true);

			for (var index = 0; index < me.employees.length; index++) {
				$("#assignInputCheck" + index)[0].checked = me.selectAll.check.checked;
			}
		},
		
		setEmployeeGrid: function() {
			var me = this;

			for (var index = me.employees.length - 1; index >= 0; index--) {
				if ($("#assignInputCheck" + index)[0].checked) {
					me.employees.splice(index, 1);
				}
			}
			me.employeeGrid.setData(me.employees);
			me.selectAll.setValue("false");
		},
		
		actionApproveItem: function() {
			var me = this;
			
			me.status = "Approved";
			me.actionSaveItem();
		},
		
		actionRejectItem: function() {
			var me = this;
			
			me.status = "Rejected";
			me.actionSaveItem();
		},
		
		actionSaveItem: function() {
			var me = this;
			var item = [];
			var xml = "";

			if (me.status == "Approved") {
				for (var index = 0; index < me.employees.length; index++) {
					if ($("#assignInputCheck" + index)[0].checked) {
						xml += '<employeeDateUpdate';
						xml += ' employeeId="' + me.employees[index].column1 + '"';
						xml += ' hireDate="' + me.employees[index].column9 + '"';
						xml += ' originalHireDate="' + me.employees[index].column10 + '"';
						xml += ' seniorityDate="' + me.employees[index].column11 + '"';
						xml += ' effectiveDate="' + me.employees[index].column12 + '"';
						xml += ' effectiveDateJob="' + me.employees[index].column13 + '"';
						xml += ' effectiveDateCompensation="' + me.employees[index].column14 + '"';
						xml += '/>';
					}
				}
			}

			for (var index = 0; index < me.employees.length; index++) {
				if ($("#assignInputCheck" + index)[0].checked) {
					xml += '<appGenericImportDateModification';
					xml += ' id="' + me.employees[index].id + '"';
					xml += ' status="' + me.status + '"';
					xml += '/>';
				}
			}

			if (xml == "")
				return;

			$("#messageToUser").html("Saving");
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
				me.setEmployeeGrid();
				me.status = "";
				me.setStatus("Saved");
			}
			else {
				me.setStatus("Error");
				alert("[SAVE FAILURE] Error while updating Employee date modification details: " + $(args.xmlNode).attr("message"));
			}

			$("#pageLoading").fadeOut("slow");
		}
	}
});

function main() {
	fin.employeeDateApproveUi = new fin.emp.UserInterface();
	fin.employeeDateApproveUi.resize();
}
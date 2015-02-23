 
    function pageLoad() {
 
        $(window).bind("resize", this, resize);
        $("#documentContent").attr("src", "home.htm");
        $("#pageLoading").hide();

        $("#ulEdit0").treeview({
            animated: "medium"
            , persist: "location"
	        , collapsed: true
        });

        actionAddNodes();
    }

	function actionAddNodes() {

		actionNodeAppend(10, 0, "Enterprise System Management (ESM)", 1);

		actionNodeAppend(100, 10, "Configuration", 1);
		actionNodeAppend(101, 100, "People", 0, "ppl/person.htm");
		actionNodeAppend(101, 100, "Skills", 0, "ppl/skill.htm");

		actionNodeAppend(120, 10, "Organization", 1);
		actionNodeAppend(121, 120, "Hierarchy", 0, "setup/hierarchy.htm");
		actionNodeAppend(122, 120, "Security (Arbitrary Group)", 0, "setup/security.htm");
		actionNodeAppend(123, 120, "Sites", 0, "hcm/site.htm");

		actionNodeAppend(20, 0, "Team Finance", 1);

		actionNodeAppend(200, 20, "Home", 1);
		actionNodeAppend(201, 200, "Notifications", 0, "dataCollector/notification.htm");

		actionNodeAppend(220, 20, "Budgeting", 1);
		actionNodeAppend(221, 220, "Annualized Budget", 0, "bud/AnnualizedBudget.htm");
		actionNodeAppend(222, 220, "Budget Summary", 0, "bud/BudgetSummary.htm");
		actionNodeAppend(223, 220, "Annual Projections", 0, "bud/AnnualProjection.htm");
		actionNodeAppend(224, 220, "Administration", 0, "bud/Administration.htm");
		actionNodeAppend(225, 220, "Annualized Budget 2012", 0, "bud/AnnualizedBudget.htm");
		actionNodeAppend(226, 220, "Import Budget", 0, "bud/ImportBudget.htm");
		actionNodeAppend(227, 220, "MOP", 0, "bud/mop.htm");

		actionNodeAppend(240, 20, "General Ledger", 1);
		actionNodeAppend(241, 240, "Recurring Expenses", 0, "glm/recurringExpense.htm");
		actionNodeAppend(242, 240, "Journal Entry", 0, "glm/journalEntry.htm");
		actionNodeAppend(243, 240, "Transaction Summary", 0, "glm/transactionsummary.htm");

		actionNodeAppend(260, 20, "Payroll", 1);
		actionNodeAppend(261, 260, "Calendar", 0, "pay/payCalendar.htm");
		actionNodeAppend(262, 260, "Ceridian Companies", 0, "pay/ceridianCompany.htm");
		actionNodeAppend(263, 260, "Salary & Wages", 0, "pay/payroll.htm");

		actionNodeAppend(280, 20, "Purchasing", 1);
		actionNodeAppend(281, 280, "Vendors", 0, "pur/vendor.htm");
		actionNodeAppend(282, 280, "Items", 0, "pur/item.htm");
		actionNodeAppend(283, 280, "Catalogs", 0, "pur/catalog.htm");			
		actionNodeAppend(284, 280, "Purchase Orders", 0, "pur/purchaseOrder.htm");
		actionNodeAppend(285, 280, "Price Update", 0, "pur/itemPriceUpdate.htm");
		actionNodeAppend(285, 280, "PO Requisition", 0, "pur/poRequisition.htm");
		actionNodeAppend(285, 280, "Cap Requisition", 0, "pur/capitalRequisition.htm");

		actionNodeAppend(300, 20, "Inventory", 1);
		actionNodeAppend(301, 300, "Administration", 0, "inv/administration.htm");
		actionNodeAppend(302, 300, "Inventory Items", 0, "inv/inventoryItem.htm");

		actionNodeAppend(320, 20, "Work Orders", 1);
		actionNodeAppend(321, 320, "Work Orders", 0, "wom/workOrder.htm");
		actionNodeAppend(322, 320, "Complete Work Orders", 0, "wom/completeWorkOrder.htm");

		actionNodeAppend(330, 20, "Payables", 1);
		actionNodeAppend(331, 330, "AP Import", 0, "rev/apImport.htm");
		actionNodeAppend(332, 330, "AP Search", 0, "rev/apSearch.htm");

		actionNodeAppend(340, 20, "Receivables", 1);
		actionNodeAppend(341, 340, "Invoice Search", 0, "rev/invoiceSearch.htm");
		actionNodeAppend(342, 340, "Invoicing / AR", 0, "rev/invoice.htm");
		actionNodeAppend(343, 340, "WO to Invoice", 0, "rev/workOrderToInvoice.htm");
		actionNodeAppend(344, 340, "Bulk Import", 0, "rev/bulkInvoiceImport.htm");

		actionNodeAppend(360, 20, "Fiscal", 1);
		actionNodeAppend(361, 360, "Patterns", 0, "fsc/fiscalPattern.htm");
		actionNodeAppend(362, 360, "Calendar", 0, "fsc/fiscalCalendar.htm");
		actionNodeAppend(363, 360, "JDE Companies", 0, "fsc/jdeCompany.htm");
		actionNodeAppend(364, 360, "Chart of Accounts", 0, "fsc/account.htm");			

		actionNodeAppend(380, 20, "House Codes", 1);
		actionNodeAppend(381, 380, "Remit To", 0, "hcm/remitTo.htm");
		actionNodeAppend(382, 380, "Sites", 0, "hcm/site.htm");
		actionNodeAppend(383, 380, "House Codes", 0, "hcm/houseCode.htm");
		actionNodeAppend(384, 380, "Jobs", 0, "hcm/job.htm");
		actionNodeAppend(385, 380, "Import House Codes", 0, "hcm/houseCodeImport.htm");
		actionNodeAppend(385, 380, "House Code Wizard", 0, "hcm/houseCodeWizard.htm");
		actionNodeAppend(386, 380, "Epay Sites", 0, "hcm/ePaySite.htm");
		actionNodeAppend(386, 380, "EPay Site Survey", 0, "hcm/ePaySiteSurvey.htm");

		actionNodeAppend(400, 20, "Report", 1);
		actionNodeAppend(401, 400, "EBR Report", 0, "template.htm");
		actionNodeAppend(401, 400, "Ad-Hoc", 0, "rpt/adHoc.htm");
		actionNodeAppend(402, 400, "SSRS", 0, "rpt/ssrs.htm");

        actionNodeAppend(420,  20,  "Setup", 1);
        actionNodeAppend(421,  420, "Employees", 1);
        actionNodeAppend(4210, 421, "Employee Search", 0, "setup/employee/search.htm");
		actionNodeAppend(4211, 421, "Employee General", 0, "setup/employee/employeeGeneral.htm");
        actionNodeAppend(4212, 421, "Wizard: New Hire", 0, "setup/employee/newHire.htm");
        actionNodeAppend(4213, 421, "Wizard: Rehire", 0, "setup/employee/rehire.htm");
        actionNodeAppend(4214, 421, "Wizard: House Code Transfer", 0, "setup/employee/houseCodeTransfer.htm");
        actionNodeAppend(4215, 421, "Wizard: Termination", 0, "setup/employee/termination.htm");
        actionNodeAppend(4216, 421, "Wizard: Edit", 0, "setup/employee/edit.htm");
		actionNodeAppend(4217, 421, "Wizard: Date Modification", 0, "setup/employee/dateModification.htm");
		actionNodeAppend(4218, 421, "Wizard: Basic Life Indicator", 0, "setup/employee/basicLifeIndicator.htm");

		actionNodeAppend(422, 420, "Hierarchy", 0, "setup/hierarchy.htm");
		actionNodeAppend(423, 420, "Security", 0, "setup/security.htm");
		actionNodeAppend(424, 420, "System Variables", 0, "setup/systemVariables.htm");
		actionNodeAppend(425, 420, "EPay Scheduler", 0, "template.htm");
		actionNodeAppend(426, 420, "Import Employees", 0, "setup/employeeImport.htm");
		actionNodeAppend(427, 420, "Tax Rates", 0, "setup/taxRate.htm");
		actionNodeAppend(428, 420, "Data Collector", 0, "dataCollector/dataCollectorSetup.htm");
		actionNodeAppend(429, 420, "Ad-Hoc Report", 0, "setup/adHocReport.htm");
		actionNodeAppend(430, 420, "Hierarchy Management", 0, "setup/hierarchyManagement.htm");
		actionNodeAppend(431, 420, "State Minimum Wage", 0, "setup/minimumWage.htm");
		actionNodeAppend(431, 420, "Emp Hierarchy", 0, "setup/employeeHierarchy.htm");
		actionNodeAppend(431, 420, "Employee PTO", 0, "setup/employeePTO.htm");
		actionNodeAppend(431, 420, "Emp Request", 0, "setup/empRequest.htm");
		actionNodeAppend(431, 420, "Local Tax Code", 0, "setup/localTaxCode.htm");

		actionNodeAppend(30, 0, "Enterprise Business Reporting (EBR)", 1);
		actionNodeAppend(500, 30, "EBR Report", 0, "template.htm");

		actionNodeAppend(50, 0, "Windows Services", 1);
		actionNodeAppend(701, 50, "Import", 1);
		actionNodeAppend(702, 50, "Export", 1);
		actionNodeAppend(703, 50, "EPay", 1);
		actionNodeAppend(704, 701, "JDE Transaction Import", 0, "teamFinService/jdeTRX.htm");
		actionNodeAppend(705, 701, "AR Paid Import", 0, "teamFinService/arPaid.htm");
		actionNodeAppend(706, 701, "Purchase Order Import", 0, "teamFinService/poImport.htm");
		actionNodeAppend(707, 702, "Invoice Export", 0, "teamFinService/invoiceExport.htm");
		actionNodeAppend(708, 702, "Journal Entry Export", 0, "teamFinService/jeExport.htm");
		actionNodeAppend(709, 702, "Purchase Order Export", 0, "teamFinService/poExport.htm");
		actionNodeAppend(710, 702, "HR Export", 0, "teamFinService/hrExport.htm");
		actionNodeAppend(711, 702, "Payroll Export", 0, "teamFinService/payrollExport.htm");
		actionNodeAppend(712, 702, "Forecast Export", 0, "teamFinService/forecastExport.htm");
        actionNodeAppend(713, 703, "Hours Import", 0, "teamFinService/EPayDownloadHours.htm");
		actionNodeAppend(714, 703, "Employees Export", 0, "teamFinService/EPayUploadEmployees.htm");
        actionNodeAppend(715, 703, "Sites Export", 0, "teamFinService/EPayUploadSites.htm");

		actionNodeAppend(60, 0, "Web Services", 1);
		actionNodeAppend(801, 60, "EPay", 0, "template.htm");
		actionNodeAppend(802, 60, "SAP Employees", 0, "template.htm");

		actionNodeAppend(70, 0, "Scheduled Jobs", 1);
		actionNodeAppend(901, 70, "EPay", 0, "template.htm");
		actionNodeAppend(902, 70, "Kronos Punch Import", 0, "scheduledJobs/importPunch.htm");
		actionNodeAppend(903, 70, "Item Price Update", 0, "scheduledJobs/itemPriceUpdate.htm");
		actionNodeAppend(904, 70, "AP Import", 0, "scheduledJobs/apImport.htm");

        resize();
	}

	function actionNodeAppend(id, parentId, title, childNodeCount, fileName) {

        nodeHtml = "<li id=\"liNode" + id + "\">"

		if (!fileName)
	    	nodeHtml += "<span id=\"span" + id + "\" class='module'>" + title + "</span>";
		else
			nodeHtml += "<span id=\"span" + id + "\" class='file'><a href='" + fileName + "' target='documentContent'>" + title + "</a></span>";
 
        //add a list holder if the node has children
        if (childNodeCount != 0) {
        	nodeHtml += "<ul id=\"ulEdit" + id + "\"></ul>";
		}

        nodeHtml += "</li>";

        var treeNode = $(nodeHtml).appendTo("#ulEdit" + parentId);
        $("#ulEdit0").treeview({add: treeNode});
	}
 
	function resize() {

        $("#divContent").height($(window).height() - 40);
        $("#divFrame").height($(window).height() - 30);
        $("#divFrame").width($(window).width() - 265);
    }
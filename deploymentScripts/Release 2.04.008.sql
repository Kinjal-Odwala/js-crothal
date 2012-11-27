/*
Last production release version 2.04.007 on 15th August 2012 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.008', M_ENV_ENV_Database_Version = '2.04.008' 
Where M_ENV_ENVIRONMENT = 3

/*
ALTER TABLE [TeamFinV2].[dbo].[AdhReportColumns] ADD AdhRepcSortOrder Varchar(16) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD HcmJobOverrideSiteTax Bit NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD HcmJobGEOCode Varchar(2) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD HcmEPayGroupType Int NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD HcmJobServiceContract Varchar(100) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD HcmJobGeneralLocationCode Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucEPayTask Int NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodeJobs] ADD HcmHoucjLanguage1 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodeJobs] ADD HcmHoucjLanguage2 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodeJobs] ADD HcmHoucjLanguage3 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodeJobs] ADD HcmHoucjDefaultHouseCode Bit NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceBatches] ADD RevInvbModBy Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceBatches] ADD RevInvbModAt DateTime NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmServiceLines] ADD HcmSerlFinancialEntity BIT NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpBasicLifeIndicatorType Int NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceContract Varchar(100) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoGeneralLocationCode Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerWorkOrderNumber Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrderTasks] ADD WomwotMarkup Decimal(8, 2) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrderItems] ADD WomwoiMarkup Decimal(8, 2) NULL
*/
INSERT INTO Teamfinv2.dbo.HcmJobTypes (HcmJobtBrief, HcmJobtTitle, HcmJobtDescription, HcmJobtDisplayOrder, HcmJobtActive, HcmJobtModBy, HcmJobtModAt)
VALUES ('Epay Site', 'Epay Site', 'Epay Site', 4, 1, 'Compass-USA\Data Conversion', GetDate())

-- SSRS Reports - AR, PO, WO, Budget Reports [Begin]

-- Updated the CT and production on 12th September, 2012
Declare @HirNode Int
	, @HirNodeParent Int
	, @DisplayOrder Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\By Invoice Number'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('By Invoice Numbe', 'By Invoice Number', 'By Invoice Number', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_AR%2fInvoiceNumber&rs:Command=Render', @HirNode)

Select @HirNode = HirNode, @HirNodeParent = HirNodeParent, @DisplayOrder = HirNodDisplayOrder From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\Print by User ID'
EXEC ESMV2.dbo.HirNodeUpdate @HirNode, 1, @HirNodeParent, 9, 'Invoice Create By', 'Invoice CreateBy', 'Invoice Create By', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\Invoice Create By'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Invoice CreateBy', 'Invoice Create By', 'Invoice Create By', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_AR%2fInvoiceCreateBy&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\Invoice Status'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Invoice Status', 'Invoice Status', 'Invoice Status', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_AR%2fInvoiceStatus&rs:Command=Render', @HirNode)

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports'
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Invoice Batch', 'Invoice Batch', 'Invoice Batch', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\Invoice Batch'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Invoice Batch', 'Invoice Batch', 'Invoice Batch', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_AR%2fInvoiceBatch&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\PO Reports\By Org and Time'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('By Org and Time', 'By Org and Time', 'By Org and Time', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_PO%2fPurchaseOrderOrgTime&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\PO Reports\By PO Number'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('By PO Number', 'By PO Number', 'By PO Number', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_PO%2fPurchaseOrderNumber&rs:Command=Render', @HirNode)

-- Updated the CT and production on 14th September, 2012

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Work Order Reports\Work Order Request'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('WO Request', 'Work Order Request', 'Work Order Request', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_WorkOrder%2fWorkOrderRequest&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Work Order Reports\Work Order Status'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('WO Status', 'Work Order Status', 'Work Order Status', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_WorkOrder%2fWorkOrderStatus&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Annual Summary'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Annual Summary', 'Annual Summary', 'Annual Summary', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Annual_Summary&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Budget vs Actual'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Budget vs Actual', 'Budget vs Actual', 'Budget vs Actual', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Actual_vs_Budget&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Detail Rollup'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Detail Rollup', 'Detail Rollup', 'Detail Rollup', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Detail_Rollup&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Period Projections'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Period Projectio', 'Period Projections', 'Period Projections', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Period_Projection&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Annual Status'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Annual Status', 'Annual Status', 'Annual Status', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Status_&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Labor Calculations'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Labor Calculatns', 'Labor Calculations', 'Labor Calculations', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Labor_Calculations&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Contract Billing'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Contract Billing', 'Contract Billing', 'Contract Billing', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Contract_Billing&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Adjustments'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Adjustments', 'Adjustments', 'Adjustments', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Adjustments&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Capital Expenses'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Capital Expenses', 'Capital Expenses', 'Capital Expenses', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Capital_Expenditures&rs:Command=Render', @HirNode)

-- SSRS Reports - AR, PO, WO, Budget Reports [End]

-- HouseCode --> Epay Sites Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 707
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Epay Sites' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/hcm/ePaySite/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\%'
-- HouseCode --> Epay Sites Menu Insert [End]

-- HouseCode --> EPay Task field level security nodes Insert [Begin]

Declare @HirNodeParent Int
	, @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'EPayTask', 'ePayTask', 'ePayTask', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll\EPayTask'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'EPayTask', 'ePayTask', 'ePayTask', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll\EPayTask'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

-- HouseCode --> EPay Task field level security nodes Insert [End]

INSERT INTO Teamfinv2.dbo.EmpBasicLifeIndicatorTypes(EmpBlitBrief, EmpBlitTitle, EmpBlitDescription, EmpBlitDisplayOrder, EmpBlitActive, EmpBlitModBy, EmpBlitModAt)
VALUES ('1X', '1X', '1X', 1, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO Teamfinv2.dbo.EmpBasicLifeIndicatorTypes(EmpBlitBrief, EmpBlitTitle, EmpBlitDescription, EmpBlitDisplayOrder, EmpBlitActive, EmpBlitModBy, EmpBlitModAt)
VALUES ('2X', '2X', '2X', 1, 1, 'Compass-USA\Data Conversion', GetDate())

-- HouseCode --> Jobs field level security nodes Insert [Begin]

Declare @HirNodeParent Int
	, @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'TaxId', 'taxId', 'taxId', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\TaxId'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'OverrideSiteTax', 'overrideSiteTax', 'overrideSiteTax', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\OverrideSiteTax'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'GEOCode', 'geoCode', 'geoCode', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\GEOCode'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'ServiceContract', 'serviceContract', 'serviceContract', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\ServiceContract'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'GeneralLocationCode', 'generalLocationCode', 'generalLocationCode', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\GeneralLocationCode'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

-- HouseCode --> Jobs field level security nodes Insert [End]

-- Employee Wizard - Basic Life Indicator Security Node [Begin]

Declare @HirNodeParent As Int
Declare @DisplayOrder Int

Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard'
Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes

EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'BasicLifeIndicator', 'BasicLifeIndicator', 'BasicLifeIndicator', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard\BasicLifeIndicator'
Insert into ESMV2.dbo.HirGroupNodes Values (@HirNodeParent, 1, 'Compass-USA\Data Conversion', GetDate())

-- Employee Wizard - Basic Life Indicator Security Node [End]

/*
CT updated on 17th October 2012 11PM EST
*/

/*
CT updated on 7th November 2012 11PM EST
*/

Update the following js and SP manually

1. RevInvoiceBulkImportValidate - Stored Procedure
2. fin\rev\bulkInvoiceImport\usr\main.js
3. fin\bud\mop\usr\fin.bud.mop.js

/*
Last production release version 2.04.008 on 14th November 2012 11PM EST
*/
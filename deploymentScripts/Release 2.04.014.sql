/*
Last production release version 2.04.013 on 3rd Septmber 2014 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.014', M_ENV_ENV_Database_Version = '2.04.014' 
Where M_ENV_ENVIRONMENT = 4

-- Add security nodes for action menu items in Emp Request UI [Begin]
----- NOTES:  Verify whether the nodes are exists or not before executing the script
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmpRequest'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'DateModification', 'Date Modification', 'Date Modification', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\EmpRequest\DateModification', 'crothall', 'chimes', 'fin', 'Setup', 'EmpRequest', 'DateModification', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SSNModification', 'SSN Modification', 'SSN Modification', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\EmpRequest\SSNModification', 'crothall', 'chimes', 'fin', 'Setup', 'EmpRequest', 'SSNModification', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ReverseTerminate', 'Reverse Termination', 'Reverse Termination', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Setup\EmpRequest\ReverseTerminate', 'crothall', 'chimes', 'fin', 'Setup', 'EmpRequest', 'ReverseTerminate', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\EmpRequest%'
-- Add security nodes for action menu items in Emp Request UI [End]

-- House Code --> House Code Workflow Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 709
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'House Code Workflow' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/hcm/houseCodeWorkflow/usr/markup.htm'
	, @HirNodeParent

Update EsmV2.dbo.AppMenuItems Set AppMeniBrief = 'HC Workflow', AppMeniID = 'hcwf' Where AppMeniTitle = 'House Code Workflow'
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup%'
-- House Code --> House Code Workflow Menu Insert [End]

-- Add the following keys in hcm-->act web.config file
<add key="HouseCodeRequestApprovalPath" value="https://teamfin.crothall.com/fin/app/usr/markup.htm" />
-- Add the following keys in hcm-->act-->config spring-persistence.xml file
<value>crothall.chimes.fin.app.dom, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null</value>

-- Purchasing --> PO Capital Requisition Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 407
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Cap Requisition' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/pur/capitalRequisition/usr/markup.htm'
	, @HirNodeParent

Update EsmV2.dbo.AppMenuItems Set AppMeniTitle = 'PO Capital Requisition' Where AppMeniActionData = '/fin/pur/capitalRequisition/usr/markup.htm'
Update EsmV2.dbo.HirNodes Set HirNodBrief = 'CapRequisition', HirNodTitle = 'Capital Requisition', HirNodDescription = 'Capital Requisition', HirNodFullPath = '\crothall\chimes\fin\Purchasing\CapitalRequisition', HirNodLevel5 = 'CapitalRequisition'
Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\CapRequisition'

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing%'
-- Purchasing --> PO Capital Requisition Menu Insert [End] 

-- Add the following key in pur-->act web.config file
<add key="POCapitalRequisitionEmail" value="sus-purchasing@compass-usa.com" />
<add key="POCapitalRequisitionApprovalPath" value="https://teamfin.crothall.com/net/crothall/chimes/fin/pur/act/ApprovePOCapitalRequisition.aspx" />

-- Reports --> SSRS Parameters Insert [Begin]
--ALTER TABLE [TeamFinV2].[dbo].[RptReportParameters] ADD RptReppReferenceTableName VARCHAR(64) NULL
--ALTER TABLE [TeamFinV2].[dbo].[RptReportParameters] ADD RptReppDisplayOrder INT

Declare @RptReport Int

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'By Invoice Number'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Starting Invoice Number', 'StartInvoiceNumber', 'Text', 'Text', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Ending Invoice Number', 'EndInvoiceNumber', 'Text', 'Text', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Invoice Create By'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Create Date', 'StartCreateDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Create Date', 'EndCreateDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'User ID', 'CreateUserID', 'Text', 'Text', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Invoice Status'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Invoice Status', 'InvoiceStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'StatusType', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Invoice Date', 'StartInvoiceDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Invoice Date', 'EndInvoiceDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Invoice Batch'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Batch Number', 'BatchNumber', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'BatchNumber', 1)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Annual Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Budget vs Actual'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Thru Fiscal Period', 'ThruFiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Detail Rollup'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Report Type', 'ReportType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ReportType' , 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Period Projections'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Annual Status'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Budget', 'Budget', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Report', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Labor Calculations'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Contract Billing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Adjustments'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Capital Expenses'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Personnel Listing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatus', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Crothall Employee', 'CrothallEmployee', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CrothallEmployee', 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Personnel New Hires'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Hire Date', 'BeginHireDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Hire Date', 'EndHireDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatus', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Crothall Employee', 'CrothallEmployee', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CrothallEmployee', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Personnel Pay Rate Change'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Pay Rate Change Date', 'BegPayRateChgDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Pay Rate Change Date', 'EndPayRateChgDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatus', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Crothall Employee', 'CrothallEmployee', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CrothallEmployee', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Personnel Review'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Hire Date', 'BeginHireDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Hire Date', 'EndHireDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatus', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Crothall Employee', 'CrothallEmployee', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CrothallEmployee', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Personnel Seniority'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Hire Date', 'BeginHireDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Hire Date', 'EndHireDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatus', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Crothall Employee', 'CrothallEmployee', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CrothallEmployee', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Personnel Termination'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Termination Date', 'BeginTermDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Termination Date', 'EndTermDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Crothall Employee', 'CrothallEmployee', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CrothallEmployee', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Detailed Profit and Loss'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Report Type', 'ReportType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ReportType', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Job Cost Analysis'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Transaction Details'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period From', 'FiscalPeriodFrom', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriodFrom', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period To', 'FiscalPeriodTo', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriodTo', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'GL Accounts', 'GLAccounts', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscAccount', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Period Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll by PayCode'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Pay Codes', 'PayCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayCode', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll Details'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Pay Codes', 'PayCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayCode', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll Log'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Week', 'Week', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'WkPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Pay Codes', 'PayCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayCode', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll Summmary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Pay Codes', 'PayCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayCode', 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll Daily Hours'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Week', 'Week', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'WkPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Shift', 'Shift', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Shift', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll Sign Sheet'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Shift', 'Shift', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Shift', 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'EFT Stats'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'PayrollCompany', 'PayrollCompany', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayrollCompany', 1)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'By Org and Time'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Create Date', 'StartPODate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Create Date', 'EndPODate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'By PO Number'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Starting PO Number', 'StartPONumber', 'Text', 'Text', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Ending PO Number', 'EndPONumber', 'Text', 'Text', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Forecasts by Site'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Hierarchy Level', 'ExcludeHierarchyLevel', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExLevel', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Names', 'ExcludeNames', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExName', 6)

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Period Forecasts'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Hierarchy Level', 'ExcludeHierarchyLevel', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExLevel', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Names', 'ExcludeNames', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExName', 6)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Report Type', 'ReportType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ReportType', 7)

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'MOP Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Hierarchy Level', 'ExcludeHierarchyLevel', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExLevel', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Names', 'ExcludeNames', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExName', 6)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Report Type', 'ReportType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ReportType', 7)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Current Week', 'CurrentWeek', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Week', 8)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Comments', 'Comments', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Comments', 9)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'MOP'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Work Order Request'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'WO Status', 'WOStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'StatusType', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Starting WO Start Date', 'StartWODate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Ending WO Start Date', 'EndWODate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Work Order Status'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'WO Status', 'WOStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'StatusType', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Starting WO Start Date', 'StartWODate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Ending WO Start Date', 'EndWODate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'House Code Information'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Hourly Labor Increase'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Budget Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year', 'FscYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYears', 1, 100)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'GL Accounts', 'FscAccount', 'Integer', 'MultiSelect', '(Select All)', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscAccountCategories', 2, 350)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Customers', 'Customer', 'Integer', 'MultiSelect', '(Select All)', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customers', 3, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCodes', 4, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Exclude Overhead Accounts', 'OverHead', 'Integer', 'DropDown', '3', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeOverheadAccounts', 5, 100)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Payroll Register'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'End Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Report Type', 'ReportType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Report' , 5)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Minimum Wage Exception'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatus', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Less Than Minimum Wage', 'MinimumWage', 'Text', 'Text', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'League Standings'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exclude', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Hierarchy Level', 'ExcludeHierarchyLevel', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExLevel', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Names', 'ExcludeNames', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExName', 6)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Audit Report'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Pay Period Ending Date', 'PayPeriodEndingDate', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriod', 1)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'EPay Act vs Bud'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Week', 'Week', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'WkPeriod', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 2)

Select @RptReport =  RptReport From RptReports Where RptRepTitle = 'Labor Dashboard'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Week', 'FiscalWeek', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'WkPeriod', 2)
-- Reports --> SSRS Parameters Insert [End]

-- Reports --> SSRS Reports Update [Begin]
Declare @HirNode Int
	, @HirNodeParent Int
	, @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Wage and Hour Reports', 'Wage and Hour', 'Wage and Hour Reports', @DisplayOrder, 1, 'Wage and Hour Reports'
End
-----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Meal Break Detail')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Meal Break Detail', 'Meal Break Det', 'Meal Break Detail', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Meal Break Detail'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Meal Break Detail')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Meal Break Det', 'Meal Break Detail', 'Meal Break Detail', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Wage_and_Hour%2fEpayMealBreakDetail&rs:Command=Render', @HirNode)
End
-----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Meal Break Hierarchy')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Meal Break Hierarchy', 'Meal Break Hir', 'Meal Break Hierarchy', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Meal Break Hierarchy'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Meal Break Hierarchy')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Meal Break Hir', 'Meal Break Hierarchy', 'Meal Break Hierarchy', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Wage_and_Hour%2fEpayMealBreakHierarchy&rs:Command=Render', @HirNode)
End
--------------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Punch Detail')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Punch Detail', 'Punch Detail', 'Punch Detail', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Punch Detail'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Punch Detail')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Punch Detail', 'Punch Detail', 'Punch Detail', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Wage_and_Hour%2fEpayPunchDetail&rs:Command=Render', @HirNode)
End
---------------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Punch Hierarchy')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Punch Hierarchy', 'Punch Hir', 'Punch Hierarchy', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\Punch Hierarchy'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Punch Hierarchy')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Punch Hir', 'Punch Hierarchy', 'Punch Hierarchy', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Wage_and_Hour%2fEpayPunchHierarchy&rs:Command=Render', @HirNode)
End
-----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\40 Hour Detail')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, '40 Hour Detail', '40 Hour Detail', '40 Hour Detail', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\40 Hour Detail'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = '40 Hour Detail')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('40 Hour Detail', '40 Hour Detail', '40 Hour Detail', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Wage_and_Hour%2fTeamFin2_Employee_40Hrs_Detail&rs:Command=Render', @HirNode)
End
----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\40 Hour Hierarchy')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, '40 Hour Hierarchy', '40 Hour Hir', '40 Hour Hierarchy', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Wage and Hour Reports\40 Hour Hierarchy'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = '40 Hour Hierarchy')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('40 Hour Hir', '40 Hour Hierarchy', '40 Hour Hierarchy', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Wage_and_Hour%2fTeamFin2_Employee_Hierarchy_40Hrs_Detail&rs:Command=Render', @HirNode)
End
----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports\MOP Rollup')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'MOP Rollup', 'MOP Rollup', 'MOP Rollup', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports\MOP Rollup'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'MOP Rollup')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('MOP Rollup', 'MOP Rollup', 'MOP Rollup', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_WOR%2fMOP_Rollup&rs:Command=Render', @HirNode)
End
----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports\MOP Rollup By Hierarchy')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'MOP Rollup By Hierarchy', 'MOP Rollup Hier', 'MOP Rollup By Hierarchy', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports\MOP Rollup By Hierarchy'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'MOP Rollup By Hierarchy')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('MOP Rollup Hier', 'MOP Rollup By Hierarchy', 'MOP Rollup By Hierarchy', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_WOR%2fMOP_Rollup_By_Hierarchy&rs:Command=Render', @HirNode)
End
----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Account Listing')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Account Listing', 'Account Listing', 'Account Listing', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Account Listing'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Account Listing')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Account Listing', 'Account Listing', 'Account Listing', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Informational%2fMarketing_Account_Listing&rs:Command=Render', @HirNode)
End
----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Account Detail Listing')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Account Detail Listing', 'Account Det List', 'Account Detail Listing', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Account Detail Listing'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Account Detail Listing')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Account Det List', 'Account Detail Listing', 'Account Detail Listing', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Informational%2fMarketing_Account_Detail_Listing&rs:Command=Render', @HirNode)
End
----------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Client Listing')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Client Listing', 'Client Listing', 'Client Listing', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Client Listing'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Client Listing')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Client Listing', 'Client Listing', 'Client Listing', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Informational%2fMarketing_Client_Listing&rs:Command=Render', @HirNode)
End
--------

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Lost Client Listing')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Lost Client Listing', 'Lost Client List', 'Lost Client Listing', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\Lost Client Listing'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Lost Client Listing')
Begin
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Lost Client List', 'Lost Client Listing', 'Lost Client Listing', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Informational%2fMarketing_Lost_Client_Listing&rs:Command=Render', @HirNode)
End
----------

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Budget Summary'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Budget Summary')
Begin
	INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Budget Summary', 'Budget Summary', 'Budget Summary', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Summary&rs:Command=Render', @HirNode)
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Detail Pivot'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Detail Pivot')
Begin
	INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Detail Pivot', 'Detail Pivot', 'Detail Pivot', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fBudget_Detail_Pivot&rs:Command=Render', @HirNode)
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Budget Reports\Management Labor Increase'
If Not Exists(Select RptReport From TeamFinV2.dbo.RptReports Where RptRepTitle = 'Management Labor Increase')
Begin
	INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
	VALUES('Management Labor', 'Management Labor Increase', 'Management Labor Increase', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Budgeting%2fMgmt_Labor_Increase&rs:Command=Render', @HirNode)
End
---------------------------------------------------------------

Declare @RptReport INT

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Budget Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Report Type', 'ReportType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ReportType' , 5)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Detail Pivot'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'GL Accounts', 'GLAccounts', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscAccount', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 5)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Management Labor Increase'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Year', 'FiscalYear', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscYear', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'OverHead', 4)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'MOP Rollup'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'MOP Rollup By Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Customers', 'Customers', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customer', 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCodes', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCode', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Fiscal Period', 'FiscalPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FscPeriod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Group Level', 'GroupLevel', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'GroupLevel', 4)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Meal Break Detail'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'To Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'House Code', 'HouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'State', 'State', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'States', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'UnionNonUnion', 5)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Meal Break Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'To Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'State', 'State', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'States', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'UnionNonUnion', 5)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Punch Detail'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'To Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'House Code', 'HouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'State', 'State', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'States', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'UnionNonUnion', 5)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Punch Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'To Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCode', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'State', 'State', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'States', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'UnionNonUnion', 5)

select @RptReport =  RptReport from RptReports where RptRepTitle = '40 Hour Detail'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'To Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Entry Method', 'EntryMethod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EntryMethod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCode', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'State', 'State', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'States', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'UnionNonUnion', 6)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Hours', 'Hour40Exception', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'Hour40Exception', 7)

select @RptReport =  RptReport from RptReports where RptRepTitle = '40 Hour Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'To Date', 'EndDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Entry Method', 'EntryMethod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'EntryMethod', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCode', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'State', 'State', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'States', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'UnionNonUnion', 6)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Show Total Count and Hours', 'ShowCntHrs', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ShowCntHrs', 7)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'MOP Rollup By Hierarchy'
Update RptReportParameters Set RptReppReferenceTableName = 'Exclude' Where RptReport = @RptReport And RptReppName = 'ExcludeHouseCodes'

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Account Detail Listing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Primary Service', 'PrimaryService', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PrimaryService', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Service Line', 'ServiceLine', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ServiceLine', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Financial Entity', 'FinancialEntity', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FinancialEntity', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Contract Type', 'ContractType', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ContractType', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'House Code Status', 'HouseCodeStatus', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodeStatus', 6)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Account Listing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Primary Service', 'PrimaryService', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PrimaryService', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Service Line', 'ServiceLine', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ServiceLine', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Financial Entity', 'FinancialEntity', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FinancialEntity', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Contract Type', 'ContractType', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ContractType', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'House Code Status', 'HouseCodeStatus', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodeStatus', 6)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Client Listing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Primary Service', 'PrimaryService', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PrimaryService', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Service Line', 'ServiceLine', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ServiceLine', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Financial Entity', 'FinancialEntity', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FinancialEntity', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Contract Type', 'ContractType', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ContractType', 5)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'House Code Status', 'HouseCodeStatus', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodeStatus', 6)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'Lost Client Listing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'From Start Date', 'StartDate', 'Date', 'Date', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Primary Service', 'PrimaryService', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'PrimaryService', 2)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Service Line', 'ServiceLine', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ServiceLine', 3)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Financial Entity', 'FinancialEntity', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'FinancialEntity', 4)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder)
Values (@RptReport, 'Contract Type', 'ContractType', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ContractType', 5)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Meal Break Detail'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Exceptions', 'Exception', 'Integer', 'DropDown', 'Both', 1, 'Compass-USA\Data Conversion', GetDate(), 'Exception', 6, 100)

select @RptReport =  RptReport from RptReports where RptRepTitle = 'MOP Rollup'
Update RptReportParameters Set RptReppReferenceTableName = 'Exclude' Where RptReport = @RptReport And RptReppName = 'ExcludeHouseCodes'
Update RptReportParameters Set RptReppReferenceTableName = 'YearPeriods', RptReppWidth = '150'  Where RptReppName = 'ThruFiscalPeriod'
Update RptReportParameters Set RptReppTitle = 'Payroll Company' Where RptReppName = 'PayrollCompany'
update RptReportParameters set RptReppMandatory = 1 where RptReppTitle = 'From Start Date'

Update RptReportParameters Set RptReppDefaultValue = '3' where RptReppName = 'FscYear'
Update RptReportParameters Set RptReppDefaultValue = '1' where RptReppName = 'FscPeriod'
Update RptReportParameters Set RptReppDefaultValue = '(Select All)' where RptReppName = 'EmployeeStatus'
Update RptReportParameters Set RptReppDefaultValue = '(Select All)' where RptReppName = 'GLAccounts'
Update RptReportParameters Set RptReppDefaultValue = '(Select All)' where RptReppName = 'WOStatus'
Update RptReportParameters Set RptReppDefaultValue = '(Select All)' where RptReppName = 'InvoiceStatus'
Update RptReportParameters Set RptReppDefaultValue = '3' where RptReppName = 'ExcludeOverheadAccounts'
Update RptReportParameters Set RptReppDefaultValue = '0' where RptReppName = 'ReportType'
Update RptReportParameters Set RptReppDefaultValue = 'Started' where RptReppName = 'Budget'
Update RptReportParameters Set RptReppDefaultValue = 'ALL' where RptReppName = 'CrothallEmployee'
Update RptReportParameters Set RptReppDefaultValue = 'Both' where RptReppName = 'Comments'
Update RptReportParameters Set RptReppDefaultValue = 'Both' where RptReppName = 'UnionNonUnion'
Update RptReportParameters Set RptReppDefaultValue = '1' where RptReppName = 'EntryMethod'
Update RptReportParameters Set RptReppDefaultValue = '0' where RptReppName = 'Hour40Exception'
Update RptReportParameters Set RptReppDefaultValue = '1' where RptReppName = 'HouseCodeStatus'
update RptReportParameters set RptReppDefaultValue = 'False' where RptReppName = 'ShowCntHrs'

update RptReportParameters set RptReppWidth = 200 where RptReppControlType = 'Date'
update RptReportParameters set RptReppWidth = 200 where RptReppControlType = 'Text'
update RptReportParameters set RptReppWidth = 400 where RptReppName = 'ExcludeHouseCodes'
update RptReportParameters set RptReppWidth = 400 where RptReppName = 'Customers'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'ExcludeOverheadAccounts'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'ReportType'
update RptReportParameters set RptReppWidth = 350 where RptReppName = 'GLAccounts'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'FiscalPeriod'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'FiscalPeriodTo'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'FiscalPeriodFrom'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'FiscalYear'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'Budget'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'CrothallEmployee'
update RptReportParameters set RptReppWidth = 300 where RptReppName = 'PayCodes'
update RptReportParameters set RptReppWidth = 200 where RptReppName = 'Week'
update RptReportParameters set RptReppWidth = 400 where RptReppName = 'PayrollCompany'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'ExcludeHierarchyLevel'
update RptReportParameters set RptReppWidth = 400 where RptReppName = 'ExcludeNames'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'CurrentWeek'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'Comments'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'GroupLevel'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'HouseCodeStatus'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'PayPeriodEndingDate'
update RptReportParameters set RptReppWidth = 200 where RptReppName = 'FiscalWeek'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'UnionNonUnion'
update RptReportParameters set RptReppWidth = 250 where RptReppName = 'EntryMethod'
update RptReportParameters set RptReppWidth = 150 where RptReppName = 'Hour40Exception'
update RptReportParameters set RptReppWidth = 100 where RptReppName = 'ShowCntHrs'
update RptReportParameters set RptReppWidth = 400 where RptReppName = 'BatchNumber'

--ALTER TABLE [TeamFinV2].[dbo].[RptReportParameters] ADD [RptReppMandatory] [bit] NULL
--ALTER TABLE [TeamFinV2].[dbo].[RptReportParameters] ADD [RptReppWidth] [int] NULL
--ALTER TABLE [TeamFinV2].[dbo].[RptReports] ADD RptRepParameterAvailable BIT
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 0
--Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'Budget vs Actual'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'EFT Stats'
--Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'Payroll Register'

Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'Forecasts by Site'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'League Standings'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'Period Forecasts'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'MOP'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'MOP Summary'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'MOP Rollup'
Update [TeamFinV2].[dbo].[RptReports] Set RptRepParameterAvailable = 1 Where RptRepTitle = 'MOP Rollup By Hierarchy'

-- Reports --> SSRS Reports Update [End]

-- Add the following keys in rpt-->act web.config file
<add key="FinPayPath" value="/net/crothall/chimes/fin/pay/act/provider.aspx?moduleId=pay" />
<add key="FinEmpPath" value="/net/crothall/chimes/fin/emp/act/provider.aspx?moduleId=emp" />
<add key="FinRevPath" value="/net/crothall/chimes/fin/rev/act/provider.aspx?moduleId=rev" />
<add key="FinHcmPath" value="/net/crothall/chimes/fin/hcm/act/provider.aspx?moduleId=hcm" />

--ALTER TABLE [TeamFinV2].[dbo].[FscAccounts] DROP COLUMN FscAccExcludeMOPUnitTotal
--ALTER TABLE [TeamFinV2].[dbo].[FscAccounts] ADD FscMOPTotalType INT NULL
Update dbo.FscAccounts Set FscMOPTotalType = 1
INSERT INTO dbo.FscMOPTotalTypes (FscMOPttBrief, FscMOPttTitle, FscMOPttDescription, FscMOPttDisplayOrder, FscMOPttActive, FscMOPttModBy, FscMOPttModAt)
VALUES ('UT', 'Unit Total', 'Unit Total', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO dbo.FscMOPTotalTypes (FscMOPttBrief, FscMOPttTitle, FscMOPttDescription, FscMOPttDisplayOrder, FscMOPttActive, FscMOPttModBy, FscMOPttModAt)
VALUES ('EU', 'Exclude Unit Total', 'Exclude Unit Total', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO dbo.FscMOPTotalTypes (FscMOPttBrief, FscMOPttTitle, FscMOPttDescription, FscMOPttDisplayOrder, FscMOPttActive, FscMOPttModBy, FscMOPttModAt)
VALUES ('ET', 'Exclude Total', 'Exclude Total', 3, 1, 'Compass-Usa\Data Conversion', GetDate())

--ALTER TABLE [TeamFinV2].[dbo].[EmpPTODays] ADD EmpPtodHours DECIMAL(10, 2) NULL
--EXEC sp_rename 'EmpPTOAssignments.EmpPTOEmployee', 'EmpEmployeeGeneral', 'COLUMN'
--EXEC sp_rename 'EmpPTODays.EmpPTOEmployee', 'EmpEmployeeGeneral', 'COLUMN'

-- Purchasing --> PO Requisition Sequence Number Insert [Begin]
CREATE SEQUENCE PORequisitionNumber AS INT
START WITH 500043 -- This is the Number you want to start the Sequence with
INCREMENT BY 1 -- This is how you want 

Select * from PurPOCapitalRequisitions
Select * from PurPORequisitions

;With cte As
(Select PurPORequisition, PurPorRequisitionNumber, 
  Row_Number() Over (Order By PurPORequisition) As rn
From PurPORequisitions)
Update cte Set PurPorRequisitionNumber = 500000 + rn

;With cte As
(Select PurPOCapitalRequisition, PurPocrRequisitionNumber, 
  Row_Number() Over (Order By PurPOCapitalRequisition) As rn
From PurPOCapitalRequisitions)
Update cte Set PurPocrRequisitionNumber= 500030 + rn
-- Purchasing --> PO Requisition Sequence Number Insert [End]

-- Setup --> Workflow Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 818
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Workflow' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/app/workflow/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\workflow%'
-- Setup --> Workflow Menu Insert [End] 

INSERT INTO dbo.AppWorkflowSteps(AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(Null, 'Step 1', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 1, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(Null, 'Step 2', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 2, 1, 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 3rd December 2014 11PM EST
*/

-- Add the following keys in pay-->act web.config file
<add key="LogFilePath" value="D:\Users\Chandru\Dropbox (i3)\repos\js\crothall\js-crothall-chimes-fin\logs\" />

-- Add the following keys in srv-->act web.config file
<add key="CommandTimeout" value="90" />

--ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucMealPlan INT NULL
--ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpEmpgMealPlan INT NULL
--ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpEmpgMealPlanChangeDate DATETIME NULL
--ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpEmpgMealPlanChangeStatus BIT NULL
--ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpEmpgMealPlanPayrollDeduction BIT NULL

--ALTER TABLE HcmHouseCodes ALTER COLUMN HcmHoucMealPlan INT
--ALTER TABLE EmpEmployeeGenerals ALTER COLUMN EmpEmpgMealPlan INT
--EXEC sp_rename 'EmpEmployeeGenerals.EmpEmpgMealPlanOption', 'EmpEmpgMealPlanPayrollDeduction', 'COLUMN'

-- Reports --> SSRS Reports Update [Begin]
Declare @RptReport int
select @RptReport = RptReport from RptReports where RptRepTitle = 'Detailed Profit and Loss'
Update rptreportparameters Set RptReppReferenceTableName = 'Overhead' Where RptReppName = 'ExcludeOverheadAccounts' And RptReport = @RptReport

select @RptReport = RptReport from RptReports where RptRepTitle = 'Period Forecasts'
Update rptreportparameters Set RptReppReferenceTableName = 'Overhead' Where RptReppName = 'ExcludeOverheadAccounts' And RptReport = @RptReport

select @RptReport = RptReport from RptReports where RptRepTitle = 'Summary'
Update rptreportparameters Set RptReppReferenceTableName = 'Overhead' Where RptReppName = 'ExcludeOverheadAccounts' And RptReport = @RptReport
-- Reports --> SSRS Reports Update [End]

-- Add security nodes for action menu items in Payroll --> Process Payroll UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ExportedBatch', 'Exported Batches', 'Exported Batches', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Payroll\ProcessPayroll\ExportedBatch', 'crothall', 'chimes', 'fin', 'Payroll', 'ProcessPayroll', 'ExportedBatch', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Payroll\ProcessPayroll%'
-- Add security nodes for action menu items in Payroll --> Process Payroll UI [End]

/*
CT updated on 23rd December 2014 11PM EST
*/

Update RptReportParameters Set RptReppDefaultValue = 'None' Where RptReppName = 'ExcludeHierarchyLevel'

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Lost Client Listing'
Update RptReportParameters Set RptReppTitle = 'From Closed Date', RptReppName = 'ClosedDate' Where RptReppName = 'StartDate' And RptReport = @RptReport

Declare @Count INT
select @RptReport = RptReport from RptReports where RptRepTitle = 'League Standings'
select @Count = count(*) from RptReportParameters where RptReppTitle = 'Exclude Overhead Accounts' And RptReport = @RptReport
IF (@Count = 0)
Begin
    Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
    Values (@RptReport, 'Exclude Overhead Accounts', 'ExcludeOverheadAccounts', 'Integer', 'DropDown', '3', 1, 'Compass-USA\Data Conversion', GetDate(), 'Overhead', 4, 100)
End

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'MOP Summary'
Update RptReportParameters Set RptReppReferenceTableName = 'Overhead' Where RptReppName = 'ExcludeOverheadAccounts' and RptReport = @RptReport

-- Setup --> Employee PAF Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 819
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Employee PAF' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/emp/employeePAF/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\EmployeePAF%'
-- Setup --> Employee PAF Menu Insert [End] 

Update RptReportParameters Set RptReppReferenceTableName = 'PayCodes', RptReppName = 'PayCode' Where RptReppName = 'PayCodes'
Update RptReportParameters Set RptReppReferenceTableName = 'EmpStatusTypes', RptReppName = 'EmployeeStatus' Where RptReppName = 'EmployeeStatus'
Update RptReportParameters Set RptReppReferenceTableName = 'EmpWorkShifts' Where RptReppName = 'Shift'
Update RptReportParameters Set RptReppReferenceTableName = 'FscAccountCategories', RptReppName = 'FscAccount' Where RptReppName = 'GLAccounts'
Update RptReportParameters Set RptReppReferenceTableName = 'RptStatusTypes', RptReppName = 'StatusType' Where RptReppName = 'InvoiceStatus'
Update RptReportParameters Set RptReppReferenceTableName = 'WoStatus', RptReppName = 'StatusType' Where RptReppName = 'WOStatus'
Update RptReportParameters Set RptReppReferenceTableName = 'AppStateTypes', RptReppName = 'States' Where RptReppName = 'State'
Update RptReportParameters Set RptReppReferenceTableName = 'HcmServiceTypes' Where RptReppName = 'PrimaryService'
Update RptReportParameters Set RptReppReferenceTableName = 'HcmServiceLines' Where RptReppName = 'ServiceLine'
Update RptReportParameters Set RptReppReferenceTableName = 'HcmServiceLines' Where RptReppName = 'FinancialEntity'
Update RptReportParameters Set RptReppReferenceTableName = 'HcmContractTypes' Where RptReppName = 'ContractType'
Update RptReportParameters Set RptReppName = 'Exclude' Where RptReppReferenceTableName = 'Exclude'
Update RptReportParameters Set RptReppName = 'ExcludeHouseCode' Where RptReppReferenceTableName = 'ExcludeHouseCode'
Update RptReportParameters Set RptReppReferenceTableName = 'ExcludeHouseCodes' Where RptReppTitle = 'Exclude House Codes'
Update RptReportParameters Set RptReppReferenceTableName = 'HouseCodes' Where RptReppName = 'HouseCode'
Update RptReportParameters Set RptReppReferenceTableName = 'FscYears', RptReppName = 'FscYear' Where RptReppName = 'FiscalYear'
Update RptReportParameters Set RptReppReferenceTableName = 'FscPeriods', RptReppName = 'FscPeriod' Where RptReppName = 'FiscalPeriod'
Update RptReportParameters Set RptReppReferenceTableName = 'FscPeriods', RptReppName = 'YearPeriods' Where RptReppName = 'ThruFiscalPeriod'
Update RptReportParameters Set RptReppReferenceTableName = 'FscPeriods', RptReppName = 'FscPeriodFrom' Where RptReppName = 'FiscalPeriodFrom'
Update RptReportParameters Set RptReppReferenceTableName = 'FscPeriods', RptReppName = 'FscPeriodTo' Where RptReppName = 'FiscalPeriodTo'
Update RptReportParameters Set RptReppReferenceTableName = 'PayPayrollCompanies' Where RptReppName = 'PayrollCompany'
Update RptReportParameters Set RptReppReferenceTableName = 'RevInvoiceBatches' Where RptReppName = 'BatchNumber'
Update RptReportParameters Set RptReppReferenceTableName = 'WeekPeriods', RptReppName = 'WkPeriod' Where RptReppName = 'Week'
Update RptReportParameters Set RptReppReferenceTableName = 'WeekPeriods', RptReppName = 'WkPeriod' Where RptReppName = 'FiscalWeek'
Update RptReportParameters Set RptReppReferenceTableName = 'PayPeriodEndingDates', RptReppName = 'PayPeriod' Where RptReppName = 'PayPeriodEndingDate'
Update RptReportParameters Set RptReppReferenceTableName = 'ExLevels', RptReppName = 'ExLevel' Where RptReppName = 'ExcludeHierarchyLevel'
Update RptReportParameters Set RptReppReferenceTableName = 'BudgetTypes', RptReppName = 'Report' Where RptReppName = 'Budget'
Update RptReportParameters Set RptReppReferenceTableName = 'ReportTypes' Where RptReppName = 'ReportType'
Update RptReportParameters Set RptReppReferenceTableName = 'CrothallEmployees' Where RptReppName = 'CrothallEmployee'
Update RptReportParameters Set RptReppReferenceTableName = 'CurrentWeeks', RptReppName = 'Week' Where RptReppName = 'CurrentWeek'
Update RptReportParameters Set RptReppReferenceTableName = 'Unions' Where RptReppName = 'UnionNonUnion'
Update RptReportParameters Set RptReppReferenceTableName = 'EntryMethods' Where RptReppName = 'EntryMethod'
Update RptReportParameters Set RptReppReferenceTableName = 'Hour40Exceptions' Where RptReppName = 'Hour40Exception'
Update RptReportParameters Set RptReppReferenceTableName = 'CountHours' Where RptReppName = 'ShowCntHrs'
Update RptReportParameters Set RptReppReferenceTableName = 'Exceptions', RptReppName = 'Exception' Where RptReppName = 'Exceptions'
Update RptReportParameters Set RptReppReferenceTableName = 'GroupLevels' Where RptReppName = 'GroupLevel'
Update RptReportParameters Set RptReppReferenceTableName = 'Customers', RptReppName = 'Customer' Where RptReppName = 'Customers'
Update RptReportParameters Set RptReppReferenceTableName = 'ExcludeOverheadAccounts', RptReppName = 'OverHead'  Where RptReppName = 'ExcludeOverheadAccounts'

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Payroll Register'
Update RptReportParameters Set RptReppReferenceTableName = 'PayrollReportTypes', RptReppName = 'Report' Where RptReppName = 'ReportType'  and RptReport = @RptReport

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Period Projections'
Update RptReportParameters Set RptReppName = 'YearPeriods' Where RptReppTitle = 'Fiscal Period'  and RptReport = @RptReport

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'MOP Summary'
Update RptReportParameters Set RptReppName = 'Overhead' Where RptReppTitle = 'Exclude Overhead Accounts'  and RptReport = @RptReport

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Period Forecasts'
Update RptReportParameters Set RptReppName = 'Overhead' Where RptReppTitle = 'Exclude Overhead Accounts'  and RptReport = @RptReport

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Detailed Profit and Loss'
Update RptReportParameters Set RptReppName = 'Overhead' Where RptReppTitle = 'Exclude Overhead Accounts'  and RptReport = @RptReport

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'League Standings'
Update RptReportParameters Set RptReppName = 'Overhead' Where RptReppTitle = 'Exclude Overhead Accounts'  and RptReport = @RptReport

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'EPay Act vs Bud'
Update RptReportParameters Set RptReppName = 'DateRange' Where RptReppName = 'WkPeriod'  and RptReport = @RptReport

Update RptReportParameters Set RptReppReferenceTableName = 'ExcludeNames', RptReppName = 'ExName' Where RptReppName = 'ExcludeNames'

Select @RptReport = RptReport From RptReports Where RptRepTitle = 'MOP Summary' 
Update RptReportParameters Set RptReppReferenceTableName = 'SummeryReportTypes' Where RptReppName = 'ReportType'  and RptReport = @RptReport

/*
CT updated on 13th January 2015 11PM EST
*/

Copy the following files manually
net folder
../pur/act/bin/crothall.chimes.fin.pur.act.dll
../pur/act/bin/crothall.chimes.fin.pur.dom.dll
../pur/act/bin/crothall.chimes.fin.pur.srv.dll
../pur/act/bin/crothall.chimes.fin.cmn.rep.dll

js folder
../pur/capitalRequisition/usr/main.js
../pur/requisition/usr/main.js
../pay/payCheck/usr/main.js
../pay/processPayroll/usr/main.js


/*
Last production release version 2.04.014 on 28th January 2015 11PM EST
*/
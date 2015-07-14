/*
Last production release version 2.04.015 on 22nd April 2015 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.016', M_ENV_ENV_Database_Version = '2.04.016' 
Where M_ENV_ENVIRONMENT = 4

-- If required add security nodes for action menu items in Emp Request UI [Begin]
-- NOTES:  Verify whether the nodes are exists or not before executing the script
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
-- NOTES: Pending only in production
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

-- Setup --> Workflow Menu Insert [Begin]
-- NOTES: Pending only in production
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

Update ESMV2.dbo.HirNodes Set HirNodTitle = 'Employee PAF' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePAF'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePAF'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\EmployeePAF\Read', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePAF', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\EmployeePAF\Write', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePAF', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\EmployeePAF%'
-- Setup --> Workflow Menu Insert [End] 

-- Sample Data Insert [Begin]
-- NOTES: Pending only in production
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(1, Null, 'Step 1', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 1, 1, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(1, Null, 'Step 2', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 2, 2, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(1, Null, 'Step 3', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 3, 3, 1, 'Compass-USA\Data Conversion', GetDate())
-- Sample Data Insert [End]

-- Setup --> Employee PAF Menu Insert [Begin]
-- NOTES: Pending only in production
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

/* Updated DEV, CT and Production
Select * From EsmV2.dbo.AppMenuItems
Update EsmV2.dbo.AppMenuItems set AppMeniDisplayOrder = 710 Where AppMeniActionData = '/fin/app/laundry/usr/markup.htm'

Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\LaundryMetrics'

Declare @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'
Update ESMV2.dbo.HirNodes Set HirNodeParent = @HirNodeParent, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\LaundryMetrics', HirNodLevel4 = 'HouseCodeSetup'
Where HirNodFullPath = '\crothall\chimes\fin\Setup\LaundryMetrics'

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\LaundryMetrics'
*/

-- ALTER TABLE [TeamFinV2].[dbo].[EmpPTODays] ADD PayEmployeeWeeklyPayroll INT
-- ALTER TABLE [TeamFinV2].[dbo].[AppWorkflowSteps] ADD AppWorkflowModule INT
-- ALTER TABLE [TeamFinV2].[dbo].[AppWorkflowSteps] ADD AppWfsStepNumber INT
-- ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucPTOStartDate DATETIME
-- ALTER TABLE [dbo].EmpPTOEmployeeBalanceHours ADD EmpPTOYear Int NULL

INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('hcr', 'House Code Request', 'House Code Request', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('paf', 'Employee PAF', 'Employee PAF', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('pocr', 'PO Capital Requisition', 'PO Capital Requisition', 2, 1, 'Compass-USA\Data Conversion', GetDate())

-- Modify the House Code Request menu title [Begin]
Select * From EsmV2.dbo.AppMenuItems

Update EsmV2.dbo.AppMenuItems Set AppMeniBrief = 'HC Requests', AppMeniTitle = 'House Code Requests', AppMeniID = 'hcRequest'
, AppMeniActionData = '/fin/hcm/houseCodeRequest/usr/markup.htm'
Where AppMeniActionData = '/fin/hcm/houseCodeWorkflow/usr/markup.htm'

Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWorkflow'

Update ESMV2.dbo.HirNodes Set HirNodBrief = 'HouseCodeRequest', HirNodTitle = 'HouseCodeRequest', HirNodDescription = 'House Code Request', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeRequest', HirNodLevel5 = 'HouseCodeRequest'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWorkflow'

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeRequest'
-- Modify the House Code Request menu title [End]

-- Add security nodes for Approve in Payroll Check Request UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll\CheckRequest'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CheckRequest', 'Check Request', 'Check Request', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Payroll\CheckRequest\CheckRequest', 'crothall', 'chimes', 'fin', 'Payroll', 'CheckRequest', 'CheckRequest', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll\CheckRequest'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ApproveInProcess', 'Approve - In Process Status', 'Approve - In Process Status', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Payroll\CheckRequest\ApproveInProcess', 'crothall', 'chimes', 'fin', 'Payroll', 'CheckRequest', 'ApproveInProcess', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Payroll\CheckRequest%'
-- Add security nodes for Approve in Payroll Check Request UI [End]

-- Payroll --> Check Request Sequence Number Insert [Begin]
CREATE SEQUENCE CheckRequestNumber AS INT
START WITH 100095 -- This is the Number you want to start the Sequence with
INCREMENT BY 1 -- This is how you want 

Select * from PayPayCheckRequests

;With cte As
(Select PayPayCheckRequest, PayPaycrCheckRequestNumber, 
  Row_Number() Over (Order By PayPayCheckRequest) As rn
From PayPayCheckRequests)
Update cte Set PayPaycrCheckRequestNumber = 100000 + rn
-- Payroll --> Check Request Sequence Number Insert [End]

-- SSRS Reports --> Parameters Update [Begin]
Declare @RptReport INT

select @RptReport = RptReport from RptReports where RptRepTitle = 'Annual Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Budget vs Actual'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Year Periods Label', 'YearPeriodsLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Detail Rollup'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Period Projections'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Year Period Label', 'YearPeriodsLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Budget Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Annual Status'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Labor Calculations'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Contract Billing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Adjustments'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Capital Expenses'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Management Labor Increase'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Detail Pivot'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Hourly Labor Increase'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Detailed Profit and Loss'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Period Label', 'FscPeriodLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Job Cost Analysis'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Period Label', 'FscPeriodLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Transaction Details'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Period From Label', 'FscPeriodFromLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Transaction Details'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Period To Label', 'FscPeriodToLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

select @RptReport = RptReport from RptReports where RptRepTitle = 'Period Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Period Label', 'FscPeriodLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4, Null)

-- SSRS Reports --> Parameters Update [End]

/*
CT updated on 3rd June 2015 11PM EST
*/

-- Add security nodes for action menu items in PO Requisition UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PORequisition'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ApproveInProcess', 'Approve - In Process Status', 'Approve - In Process Status', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PORequisition\ApproveInProcess', 'crothall', 'chimes', 'fin', 'Purchasing', 'PORequisition', 'ApproveInProcess', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing\PORequisition%'
-- Add security nodes for action menu items in PO Requisition UI [End]

-- Add security nodes for action menu items in PO Capital Requisition UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\CapitalRequisition'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ApproveInProcess', 'Approve - In Process Status', 'Approve - In Process Status', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\CapitalRequisition\ApproveInProcess', 'crothall', 'chimes', 'fin', 'Purchasing', 'CapitalRequisition', 'ApproveInProcess', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing\CapitalRequisition%'
-- Add security nodes for action menu items in PO Capital Requisition UI [End]

-- ALTER TABLE [TeamFinV2].[dbo].[EmpPTOPlans] ADD EmpPtopAccrural BIT 

Declare @RptReport INT
select @RptReport = RptReport from RptReports where RptRepTitle = 'Capital Expenses'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Cap Expenditure Type', 'CapExpenditureType', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'CapExpenditureTypes', 6, 200)

-- Add LogFilePath in appropriate modules web.config file

/*
CT updated on 17th June 2015 11PM EST
*/

/*
Update RptReports Set RptRepBrief = 'Payroll Summary', RptRepTitle = 'Payroll Summary', RptRepDescription = 'Payroll Summary' Where RptRepTitle = 'Payroll Summmary'

Select * From RptReports Where RptRepTitle = 'Meal Break Detail'
Select * From RptReportParameters Where rptreport = 68
Update RptReportParameters Set RptReppTitle = 'Exception', RptReppReferenceTableName = 'Exceptions' Where RptReportParameter = 269
Update RptReportParameters Set RptReppWidth = 150 Where RptReportParameter = 216

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Laundry Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Week', 'WkPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'WeekPeriods', 1, 200)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Laundry Detail Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Week', 'WkPeriod', 'Integer', 'DropDown', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'WeekPeriods', 1, 200)

Select * From RptReports Where RptRepTitle = 'Hourly Labor Increase'
Select * From RptReportParameters Where RptReport = 9
Delete From RptReportParameters Where RptReportParameter In (169, 170, 171, 172, 173)
Update RptReportParameters Set RptReppDefaultValue = '(Select All)' Where RptReportParameter = 167

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Detail Pivot'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Hidden FscAccount', 'Hidden_FscAccount', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Hidden FscAccount', 'Hidden_FscAccount', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

*/

/*
Last production release version 2.04.016 on 24th June 2015 11PM EST
*/
/*
Last production release version 2.04.016 on 24th June 2015 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.017', M_ENV_ENV_Database_Version = '2.04.017' 
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

-- Setup --> Workflow Menu Insert [End] 

-- Sample Data Insert [Begin]
-- NOTES: Pending only in production

INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('hcr', 'House Code Request', 'House Code Request', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('paf', 'Employee PAF', 'Employee PAF', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('pocr', 'PO Capital Requisition', 'PO Capital Requisition', 2, 1, 'Compass-USA\Data Conversion', GetDate())

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

-- Setup --> Employee PAF Menu Insert [End] 

--ALTER TABLE [dbo].HcmHouseCodes ADD HcmHoucValidateEmployeeAge BIT NULL

Update HcmHouseCodes Set HcmHoucValidateEmployeeAge = 1
Update EmpPTOPlans Set EmpPTOPlanType = 1

Declare @HcmHouseCode Int
	, @Count Int = 0
Declare curHouseCode Cursor For
	Select HcmHouseCode From dbo.HcmHouseCodes With (NoLock) 

Open curHouseCode

While 1=1
Begin
	Fetch Next From curHouseCode Into @HcmHouseCode
	If @@Fetch_Status <> 0 Break

	If Not Exists (Select HcmHouseCodeJob From dbo.HcmHouseCodeJobs HCJ
		Inner Join HcmJobs HJ On HCJ.HcmJob = HJ.HcmJob
	Where HcmHouseCode = @HcmHouseCode And HcmJobType In (1, 2) And HCJ.HcmJob != 1)
	Begin
		Set @Count = @Count + 1
		Print 'Does not Exists: ' + Cast(@HcmHouseCode As Varchar(50))
	End
End
Print Cast(@Count As Varchar(50))
Close curHouseCode 
Deallocate curHouseCode

Select * From dbo.HcmHouseCodeJobs Where HcmHouseCode = 21855

-- ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeParentHierarchies] ADD HcmHouseCode INT
-- ALTER TABLE [TeamFinV2].[dbo].[EmpPTOPlans] ADD EmpPTOPlanType INT

INSERT INTO dbo.EmpPTOPlanTypes(EmpPtoptBrief, EmpPtoptTitle, EmpPtoptDescription, EmpPtoptMinHours, EmpPtoptMaxHours, EmpPtoptDisplayOrder, EmpPtoptActive, EmpPtoptModBy, EmpPtoptModAt)
VALUES('FT40', 'Full Time – 40 Hours', 'Full Time – 40 Hours', 40, 40, 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpPTOPlanTypes(EmpPtoptBrief, EmpPtoptTitle, EmpPtoptDescription, EmpPtoptMinHours, EmpPtoptMaxHours, EmpPtoptDisplayOrder, EmpPtoptActive, EmpPtoptModBy, EmpPtoptModAt)
VALUES('FT35-39', 'Full Time – 35-39 Hours', 'Full Time – 35-39 Hours', 35, 39, 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpPTOPlanTypes(EmpPtoptBrief, EmpPtoptTitle, EmpPtoptDescription, EmpPtoptMinHours, EmpPtoptMaxHours, EmpPtoptDisplayOrder, EmpPtoptActive, EmpPtoptModBy, EmpPtoptModAt)
VALUES('FT30-39', 'Full Time – 30-34 Hours', 'Full Time – 30-34 Hours', 30, 34, 3, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpPTOPlanTypes(EmpPtoptBrief, EmpPtoptTitle, EmpPtoptDescription, EmpPtoptMinHours, EmpPtoptMaxHours, EmpPtoptDisplayOrder, EmpPtoptActive, EmpPtoptModBy, EmpPtoptModAt)
VALUES('PT', 'Part Time', 'Part Time', 20, 29, 4, 1, 'Compass-USA\Data Conversion', GetDate())

-- House Codes --> PT Metrics Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 711
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Exec EsmV2.dbo.AppMenuItemUpdate
	'PT Metrics' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/hcm/ptMetric/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\HouseCodeSetup%'
-- House Codes --> PT Metrics Menu Insert [End] 

-- Add the following key in hcm-->act web.config file
<add key="HCRequestTemplateFilePath" value="E:\Sites\Dev\TeamFin\js\crothall\chimes\fin\hcm\houseCodeRequest\usr\" />


INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Paid Labor Actual', 'Total Paid Labor Actual', 'Decimal', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Paid Labor Budget', 'Total Paid Labor Budget', 'Decimal', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Comments', 'Comments', 'Text', 3, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Control', '', 'Budgeted AWR', 'Current Wage Rate Analysis - Budgeted AWR', 'Decimal', 4, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Control', '', 'Experienced AWR', 'Current Wage Rate Analysis - Experienced AWR', 'Decimal', 5, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Control', '', '% of Discharges triggered by PT', 'Percentage of Discharges triggered by PT', 'Decimal', 6, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Control', '', 'Total Throughput Performance - Minutes', 'Total Throughput Performance - Minutes (PT Arrival, EVS Arrival, EVS Clean)', 'Integer', 7, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - PT Press Ganey', '', 'Target', 'Third Party Satisfaction - PT Press Ganey - Target', 'Text', 8, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - PT Press Ganey', '', 'Current', 'Third Party Satisfaction - PT Press Ganey - Current', 'Decimal', 9, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - PT Press Ganey', '', 'YTD', 'Third Party Satisfaction - PT Press Ganey - YTD', 'Decimal', 10, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - PT Press Ganey', '', 'Percentile Rank', 'Third Party Satisfaction - PT Press Ganey - Percentile Rank', 'Text', 11, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'Target', 'Third Party Satisfaction - EVS HCAHPS - Target', 'Text', 12, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'Current', 'Third Party Satisfaction - EVS HCAHPS - Current', 'Decimal', 13, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'YTD', 'Third Party Satisfaction - EVS HCAHPS - YTD', 'Decimal', 14, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'Percentile Rank', 'Third Party Satisfaction - EVS HCAHPS - Percentile Rank', 'Text', 15, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Partnership', '', 'Budgeted', 'Quality Partnership - Budgeted', 'Decimal', 16, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Quality Partnership', '', 'Actual', 'Quality Partnership - Actual', 'Decimal', 17, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Audit Scores', '', 'Program Integrity', 'Audit Scores - Program Integrity', 'Decimal', 18, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Audit Scores', '', 'Standardization', 'Audit Scores - Standardization', 'Decimal', 19, 1, 'Compass-Usa\Data Conversion', GetDate())

/*
Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Budget vs Actual'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Adjustments'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Annual Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Capital Expenses'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 8, Null)

Update RptReportParameters Set RptReppControlType = 'MultiSelect' Where RptReppName = 'CapExpenditureType'

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Budget Detail Pivot'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fsc Account Count', 'FscAccountCount', 'Integer', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 8, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fsc Account Label', 'FscAccountLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 9, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 10, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 11, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Detail Rollup'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 8, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Budget Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fsc Account Count', 'FscAccountCount', 'Integer', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 8, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fsc Account Label', 'FscAccountLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 9, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 10, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 11, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Labor Calculations'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Period Projections'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Year Periods Count', 'YearPeriodsCount', 'Integer', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 8, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Annual Status'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Budget Summary'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 8, Null)

Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'Contract Billing'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 7, Null)

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\AR Aging')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'AR Aging', 'AR Aging', 'AR Aging', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\AR Reports\AR Aging'
INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
VALUES('AR Aging', 'AR Aging', 'AR Aging', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamfin_AR%2fArAging&rs:Command=Render', @HirNode, 1)


Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'AR Aging'

Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Customers', 'Customer', 'Integer', 'MultiSelect', '(Select All)', 1, 'Compass-USA\Data Conversion', GetDate(), 'Customers', 1, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Exclude House Codes', 'ExcludeHouseCode', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'ExcludeHouseCodes', 2, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'As of Date', 'AsofDate', 'Date', 'Date', 'Today', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 3, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Count', 'NameCount', 'Integer', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Name Label', 'NameLabel', 'String', 'Hidden', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)


Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\YTD Benefit Eligibility')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'YTD Benefit Eligibility', 'YTD Benef Elig', 'YTD Benefit Eligibility', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\YTD Benefit Eligibility'
INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
VALUES('YTD Benef Elig', 'YTD Benefit Eligibility', 'YTD Benefit Eligibility', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fManagersEmployeeYTDBenefitEligiblity&rs:Command=Render', @HirNode, 1)


Declare @RptReport INT
Select @RptReport = RptReport From RptReports Where RptRepTitle = 'YTD Benefit Eligibility'

Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'As of Date', 'AsOfDate', 'Date', 'Date', 'Today', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 1, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Benefit Status', 'BenefitStatus', 'Integer', 'DropDown', 'Both', 1, 'Compass-USA\Data Conversion', GetDate(), 'BenefitStatuses', 2, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Measurement Status', 'MeasurementStatus', 'Integer', 'MultiSelect', '(Select All)', 1, 'Compass-USA\Data Conversion', GetDate(), 'MeasurementStatuses', 3, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Has Benefits', 'HasBenefits', 'Integer', 'DropDown', 'Both', 1, 'Compass-USA\Data Conversion', GetDate(), 'Benefits', 4, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Union or Non Union', 'UnionNonUnion', 'Integer', 'DropDown', 'B', 1, 'Compass-USA\Data Conversion', GetDate(), 'Unions', 5, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Full or Part', 'FullPart', 'Integer', 'DropDown', 'B', 1, 'Compass-USA\Data Conversion', GetDate(), 'FullParts', 6, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'PSID', 'PSID', 'Integer', 'MultiSelect', '', 1, 'Compass-USA\Data Conversion', GetDate(), 'SmartPSIDs', 7, 200)


--------------------------------------------
Check and update on CT and Production

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Budget Hierarchy'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Budget Detail Pivot'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Fiscal Year Label', 'FscYearLabel', 'String', 'Label', '', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
---------------------------------------------

Select * From RptReports Where RptRepTitle = 'Period Projections'
Select * From RptReportParameters Where RptReport = 30
Update RptReportParameters Set RptReppControlType = 'MultiSelect' Where RptReportParameter = 37 and RptReppName = 'YearPeriods'

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'By Org and Time'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'By', 'BY', 'String', 'Hidden', 'OT', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4, 100)

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'By PO Number'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'By', 'BY', 'String', 'Hidden', 'PO', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 4, 100)


Select * From RptReports Where RptRepTitle = 'AR Aging'
Select * From RptReportParameters Where RptReport = 77
Update RptReportParameters Set RptReppName = 'Exclude' Where RptReportParameter = 1331 And RptReppName = 'ExcludeHouseCode'

Select * From RptReports Where RptRepTitle = 'Detail rollup'
Select * From RptReportParameters Where RptReport = 38
Update RptReportParameters Set RptReppActive = 0 Where RptReportParameter = 316 And RptReppName = 'NameLabel'

Select * From RptReports Where RptRepTitle = 'Capital Expenses'
Select * From RptReportParameters Where RptReport = 44
Update RptReportParameters Set RptReppActive = 0 Where RptReportParameter = 310 And RptReppName = 'NameLabel'

Select * From RptReports Where RptRepTitle = 'Budget Detail Pivot'
Select * From RptReportParameters Where RptReport = 8
Update RptReportParameters Set RptReppActive = 0 Where RptReportParameter = 314 And RptReppName = 'NameLabel'

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'By Org and Time'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Start PO Number', 'StartPONumber', 'String', 'Hidden', '0', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'End PO Number', 'EndPONumber', 'String', 'Hidden', '0', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'By PO Number'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Start PO Date', 'StartPODate', 'String', 'Hidden', '01/01/2015', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'End PO Date', 'EndPODate', 'String', 'Hidden', '01/01/2015', 1, 'Compass-USA\Data Conversion', GetDate(), Null, 6, Null)
*/

/*
CT updated on 27th August 2015 11PM EST
*/
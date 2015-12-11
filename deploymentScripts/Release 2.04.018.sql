/*
Last production release version 2.04.017 on 23rd September 2015 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.018', M_ENV_ENV_Database_Version = '2.04.018' 
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
VALUES('pocr', 'PO Capital Requisition', 'PO Capital Requisition', 3, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(1, Null, 'Step 1', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 1, 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(1, Null, 'Step 2', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 2, 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(1, Null, 'Step 3', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 3, 3, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(2, Null, 'Step 1 (LOA)', 'Send an email notification to SUS-LeaveofAbsence@compass-usa.com for apprrove or unapprove the employee personnel action form.', 1, 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(2, Null, 'Step 2 (HR Manager)', 'Send an email notification to Human Resource Manager for apprrove or unapprove the employee personnel action form.', 2, 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(2, Null, 'Step 3 (Regional Manager)', 'Send an email notification to Regional Manager for apprrove or unapprove the employee personnel action form.', 3, 3, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(2, Null, 'Step 4 (HR Director)', 'Send an email notification to HR Director for apprrove or unapprove the employee personnel action form.', 4, 4, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(2, Null, 'Step 5 (Process HR)', 'Send an email notification to SUS-ProcessHR@compass-usa.com for apprrove or unapprove the employee personnel action form.', 5, 5, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(3, Null, 'Step 1 (Regional Manager)', 'Send an email notification ro Regional Manager for apprrove or unapprove the PO capital requisition.', 1, 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(3, Null, 'Step 2 (Division President)', 'Send an email notification to Division President for apprrove or unapprove the PO capital requisition.', 2, 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(3, Null, 'Step 3 (Finance Director)', 'Send an email notification to Finance Director for apprrove or unapprove the PO capital requisition.', 3, 3, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(3, Null, 'Step 4 (CFO)', 'Send an email notification to Chief Financial Officer for apprrove or unapprove the PO capital requisition.', 4, 4, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(3, Null, 'Step 5 (CEO)', 'Send an email notification to Chief Executive Officer for apprrove or unapprove the PO capital requisition.', 5, 5, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 1, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 2, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 3, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 4, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 5, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 6, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 7, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 8, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(2, 9, 4, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(3, 1, 2, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowJDECompanies(AppWorkflowModule, FscJDECompany, AppWfJDEcStepNumber, AppWfJDEcName, AppWfJDEcTitle, AppWfJDEcEmail, AppWfJDEcActive, AppWfJDEcModBy, AppWfJDEcModAt)
VALUES(3, 1, 3, 'Chandru Balekkala', Null, 'chandru.balekkala@iicorporate.com', 1, 'Compass-USA\Data Conversion', GetDate())
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
-- Setup --> Employee PAF Menu Insert [End] 

-- Add security nodes for action menu items in Employee PAF UI [Begin]
-- (Before executing the script verify that security nodes are already added or not)
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePAF'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\EmployeePAF\Read', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePAF', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\EmployeePAF\Write', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePAF', 'Write', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'WriteInProcess', 'Write - In Process Status', 'Write - In Process Status', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Setup\EmployeePAF\WriteInProcess', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePAF', 'WriteInProcess', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ApproveInProcess', 'Approve - In Process Status', 'Approve - In Process Status', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Setup\EmployeePAF\ApproveInProcess', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePAF', 'ApproveInProcess', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\EmployeePAF%'
-- Add security nodes for action menu items in Employee PAF UI [End]

-- Add the following key in hcm-->act web.config file
<add key="HCRequestTemplateFilePath" value="E:\Sites\Dev\TeamFin\js\crothall\chimes\fin\hcm\houseCodeRequest\usr\" />

-- Employee PAF --> Employee PAF Number Insert [Begin]
CREATE SEQUENCE EmployeePAFNumber AS INT
START WITH 100000 -- This is the Number you want to start the Sequence with
INCREMENT BY 1 -- This is how you want 

Select * from EmpEmployeePersonnelActions

;With cte As
(Select EmpEmployeePersonnelAction, EmpEpaNumber, 
  Row_Number() Over (Order By EmpEmployeePersonnelAction) As rn
From EmpEmployeePersonnelActions)
Update cte Set EmpEpaNumber = 100000 + rn
-- Employee PAF --> Employee PAF Number Insert [End]


-- Add the following key in emp-->act web.config file and app-->act web.config file
<add key="PAFApprovalPath" value="https://findev.crothall.com/net/crothall/chimes/fin/app/act/Approve.aspx" />

-- Add the following key in app-->act web.config file
<add key="ConnectionString" value="Data Source=SSI-X64-WS05;Initial Catalog=TeamFinv2;User ID=Esm;Password=Esm" />

-- Add the following key in pur-->act web.config file
<add key="FinAppPath" value="/net/crothall/chimes/fin/app/act/provider.aspx?moduleId=app" />

-- Add the following key in emp-->act-->Config spring-persistence.xml file
<value>crothall.chimes.fin.app.dom, Version=1.0.0.0, Culture=neutral, PublicKeyToken=null</value>


-- ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrDivisionPresidentName VARCHAR(256) NULL
-- ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrDivisionPresidentEmail VARCHAR(256) NULL
-- ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrFinanceDirectorName VARCHAR(256) NULL
-- ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrFinanceDirectorEmail VARCHAR(256) NULL
-- ALTER TABLE dbo.AppWorkflowJDECompanies ADD AppWfJDEcTitle VARCHAR(50) NULL


-- SSRS Report Parameters Updates [Begin]

/fin/rpt/ceridianReport/usr/markup.htm?reportId=Audit&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_Audit_Report&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Epay Timesheet Budget&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEpayBudgetTimesheetCustomer&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Labor Dashboard&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fTeamFin_Labor_Dashboard&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Ceridian ChargeTo&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_ChargeTo&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Employee Active Not Paid&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeActiveNotPaid&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Employee Master Listing&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeMasterListing&rs%3aCommand=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=PTD Register Employee Detail&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianPTDRegisterEmployeeDetail&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=YTD Register Employee Detail&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianYTDRegisterEmployeeDetail&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll IDR&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_IDR_Report&rs%3aCommand=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll Register&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll Salary Register&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register_Salary&rs:Command=Render

SELECT * FROM [Esmv2].[dbo].[AppMenuItems]

SELECT * From [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Audit Report'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'EPay Act vs Bud'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Labor Dashboard'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'ChargeTo'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Employee Active '
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Employee Master '
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'PTD Register Emp'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'YTD Register Emp'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Payroll IDR'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Payroll Register'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Payroll Reg Sal'

Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Audit Report' Where AppMeniBrief = 'Audit Report'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=EPay Act vs Bud' Where AppMeniBrief = 'EPay Act vs Bud'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Labor Dashboard' Where AppMeniBrief = 'Labor Dashboard'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=ChargeTo' Where AppMeniBrief = 'ChargeTo'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Employee Active' Where AppMeniBrief = 'Employee Active '
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Employee Master' Where AppMeniBrief = 'Employee Master '
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=PTD Register Emp' Where AppMeniBrief = 'PTD Register Emp'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=YTD Register Emp' Where AppMeniBrief = 'YTD Register Emp'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Payroll IDR' Where AppMeniBrief = 'Payroll IDR'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=PayrollRegister' Where AppMeniBrief = 'Payroll Register'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Payroll Reg Sal' Where AppMeniBrief = 'Payroll Reg Sal'

-------------------------------------------------------------

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Audit Report')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Audit Report', 'Audit Report', 'Audit Report', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Audit Report')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Audit Report'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Audit Report', 'Audit Report', 'Audit Report', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_Audit_Report&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\EPay Act vs Bud')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'EPay Act vs Bud', 'EPay Act vs Bud', 'EPay Act vs Bud', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'EPay Act vs Bud')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\EPay Act vs Bud'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('EPay Act vs Bud', 'EPay Act vs Bud', 'EPay Act vs Bud', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEpayBudgetTimesheetCustomer&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Labor Dashboard')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Labor Dashboard', 'Labor Dashboard', 'Labor Dashboard', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Labor Dashboard')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Labor Dashboard'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Labor Dashboard', 'Labor Dashboard', 'Labor Dashboard', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fTeamFin_Labor_Dashboard&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\ChargeTo')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'ChargeTo', 'ChargeTo', 'ChargeTo', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'ChargeTo')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\ChargeTo'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('ChargeTo', 'ChargeTo', 'ChargeTo', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_ChargeTo&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\PTD Register Emp')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'PTD Register Emp', 'PTD Register Emp', 'PTD Register Emp', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'PTD Register Emp')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\PTD Register Emp'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('PTD Register Emp', 'PTD Register Emp', 'PTD Register Emp', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianPTDRegisterEmployeeDetail&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\YTD Register Emp')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'YTD Register Emp', 'YTD Register Emp', 'YTD Register Emp', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'YTD Register Emp')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\YTD Register Emp'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('YTD Register Emp', 'YTD Register Emp', 'YTD Register Emp', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianYTDRegisterEmployeeDetail&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Employee Active')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Employee Active', 'Employee Active', 'Employee Active', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Employee Active')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Employee Active'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Employee Active', 'Employee Active', 'Employee Active', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeActiveNotPaid&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Employee Master')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Employee Master', 'Employee Master', 'Employee Master', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Employee Master')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Employee Master'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Employee Master', 'Employee Master', 'Employee Master', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeMasterListing&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Payroll IDR')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll IDR', 'Payroll IDR', 'Payroll IDR', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Payroll IDR')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Payroll IDR'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Payroll IDR', 'Payroll IDR', 'Payroll IDR', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_IDR_Report&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Payroll Register')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Register', 'Payroll Register', 'Payroll Register', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Payroll Register')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Payroll Register'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Payroll Register', 'Payroll Register', 'Payroll Register', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register&rs:Command=Render', @HirNode, 1)
End

Declare @HirNode Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Payroll Reg Sal')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'Payroll Reg Sal', 'Payroll Reg Sal', 'Payroll Reg Sal', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select RptReport From RptReports Where RptRepTitle = 'Payroll Reg Sal')
Begin
    Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Ceridian Reports\Payroll Reg Sal'
	INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
	VALUES('Payroll Reg Sal', 'Payroll Reg Sal', 'Payroll Reg Sal', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://ctreports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register_Salary&rs:Command=Render', @HirNode, 1)
End


Select * From RptReports Where RptRepTitle = 'Audit Report'
Select * From RptReportParameters Where RptReport = 53

Select * From RptReports Where RptRepTitle = 'Epay Act vs Bud'
Select * From RptReportParameters Where RptReport = 54

Select * From RptReports Where RptRepTitle = 'Labor Dashboard'
Select * From RptReportParameters Where RptReport = 55

Select * From RptReports Where RptRepTitle = 'ChargeTo'
Select * From RptReportParameters Where RptReport = 2075
Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'ChargeTo'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Check Date', 'CheckDate', 'String', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'CheckDates', 1, 200)


Select * From RptReports Where RptRepTitle = 'PTD Register Emp'
Select * From RptReportParameters Where RptReport = 2076
Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'PTD Register Emp'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodes', 1, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'Integer', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodDates', 2, 250)


Select * From RptReports Where RptRepTitle = 'YTD Register Emp'
Select * From RptReportParameters Where RptReport = 2077
Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'YTD Register Emp'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodes', 1, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'Integer', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodDates', 2, 250)


Select * From RptReports Where RptRepTitle = 'Employee Active'
Select * From RptReportParameters Where RptReport = 2081
Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Employee Active'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodes', 1, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'Integer', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodDates', 2, 250)


Select * From RptReports Where RptRepTitle = 'Employee Master'
Select * From RptReportParameters Where RptReport = 2078
Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Employee Master'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Site', 'HouseCode', 'Integer', 'MultiSelect', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'HouseCodes', 1, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'Integer', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodDates', 2, 250)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'MultiSelect', '(Select All)', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmpStatusTypes', 3, 200)


Select * From RptReports Where RptRepTitle = 'Payroll IDR'
Select * From RptReportParameters Where RptReport = 2079
Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Payroll IDR'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'Integer', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodEndingDates', 1, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Payroll Company', 'PayrollCompany', 'Integer', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPayrollCompanies', 2, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'DedCode', 'DedCode', 'Integer', 'MultiSelect', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'DeductionCodes', 3, 200)

Select * From RptReports Where RptRepTitle = 'Payroll Register'
Select * From RptReportParameters Where RptReport = 2082

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Payroll Register'
Select @RptReport = 2082
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'String', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodEndingDates', 1, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Payroll Type', 'HourlySalary', 'String', 'DropDown', 'H', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayrollTypes', 2, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Payroll Company', 'PayrollCompany', 'String', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPayrollCompanies', 3, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'DropDown', 'All', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatusTypes', 4, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'HeaderPPLabel', 'HeaderPPLabel', 'String', 'Hidden', Null, 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)


Select * From RptReports Where RptRepTitle = 'Payroll Reg Sal'
Select * From RptReportParameters Where RptReport = 2080

Declare @RptReport Int
Select @RptReport = RptReport from RptReports where RptRepTitle = 'Payroll Reg Sal'
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Pay Period', 'PayPeriod', 'String', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPeriodEndingDates', 1, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Payroll Type', 'HourlySalary', 'String', 'Hidden', 'S', 1, 'Compass-USA\Data Conversion', GetDate(), 'PayrollTypes', 2, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Payroll Company', 'PayrollCompany', 'String', 'DropDown', Null, 1, 'Compass-USA\Data Conversion', GetDate(), 'PayPayrollCompanies', 3, 400)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'Employee Status', 'EmployeeStatus', 'Integer', 'DropDown', 'All', 1, 'Compass-USA\Data Conversion', GetDate(), 'EmployeeStatusTypes', 4, 200)
Insert Into dbo.RptReportParameters(RptReport, RptReppTitle, RptReppName, RptReppDataType, RptReppControlType, RptReppDefaultValue, RptReppActive ,RptReppModBy, RptReppModAt, RptReppReferenceTableName, RptReppDisplayOrder, RptReppWidth)
Values (@RptReport, 'HeaderPPLabel', 'HeaderPPLabel', 'String', 'Hidden', Null, 1, 'Compass-USA\Data Conversion', GetDate(), Null, 5, Null)


select * from RptReports
select * from esmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Reports\SSRS Reports\Payroll%'
select * from esmV2.dbo.HirNodes Where HirNodFullPath Like '%Ceridian Reports%'
Select * from RptReportParameters where RptReppReferenceTableName ='FscPeriods'
Select * from RptReportParameters where RptReppReferenceTableName like '%PayrollCompanies%'
Select * From RptReports Where RptReport  = 39
Select * From RptReports Where RptReport In (Select RptReport from RptReportParameters where RptReppReferenceTableName like '%FscPeriods%' )
--Update RptReportParameters Set RptReppReferenceTableName = 'PayPayrollCompanies' where RptReportParameter In (4296, 4300, 4305)

--Select * From RptReports Where RptRepTitle = 'Payroll Reg Sal'
--Update RptReports Set RptRepBrief = 'PayrollSalary' Where RptReport = 2080
Select * From RptReports Where RptRepTitle = 'Payroll Register'
Update RptReports Set RptRepBrief = 'PayrollRegister' Where RptReport = 2082

Select * From RptReports Where RptRepTitle = '40 Hour Detail'
Select * From RptReportParameters Where RptReport = 63
Update RptReportParameters Set RptReppControlType = 'MultiSelect', RptReppDefaultValue = '' Where RptReppName = 'EntryMethod' And RptReportParameter = 246

select RptRepBrief from RptReports group By RptRepBrief Having Count(RptRepBrief) > 1

-- SSRS Report Parameters Updates [End]

/*
CT updated on 18th November 2015 11PM EST
*/
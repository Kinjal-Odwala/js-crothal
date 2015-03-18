/*
Last production release version 2.04.014 on 28th January 2015 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.015', M_ENV_ENV_Database_Version = '2.04.015' 
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
-- Setup --> Workflow Menu Insert [End] 

-- Sample Data Insert [Begin]
-- NOTES: Pending only in production
INSERT INTO dbo.AppWorkflowSteps(AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(Null, 'Step 1', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 1, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowSteps(AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsDisplayOrder, AppWfsActive, AppWfsModBy, AppWfsModAt)
VALUES(Null, 'Step 2', 'Selected users will receive an email with a link when sending the house code request. When the link is clicked it will redirect to the House Code workflow screen with edit option.<br>
The user will have the ability to change any data on the form and at the end will have buttons to Approve/ Save and Approve, Cancel and Exit the screen.', 2, 1, 'Compass-USA\Data Conversion', GetDate())
-- Sample Data Insert [End]

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


Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Supervisor', 'Supervisor', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Assistant Director', 'Assistant Director', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Unit Director', 'Unit Director', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Res Reg Manager', 'Res Reg Manager', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Regional Manager', 'Regional Manager', 5, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Regional Vice President', 'Regional Vice President', 6, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Plan', '', 'Plan A NH', 'Plan A NH', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Plan', '', 'Plan A Existing', 'Plan A Existing', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Plan', '', 'Plan B NH', 'Plan B NH', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Plan', '', 'Plan B Existing', 'Plan B Existing', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Plan', '', 'Plan C', 'Plan C', 5, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Merit', 'Merit', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Annual', 'Annual', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Promotion', 'Promotion', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Demotion', 'Demotion', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Hourly Promotion', 'Hourly Promotion', 5, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Increase in Responsibilities', 'Increase in Responsibilities', 6, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Decrease in Responsibilities', 'Decrease in Responsibilities', 7, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Reason4Change', '', 'Other', 'Other', 8, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Layoff', '7600', 'Reduction in force', 'Reduction in force', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Layoff', '7610', 'End of temporary employment', 'End of temporary employment', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Layoff', '7620', 'Job eliminated', 'Job eliminated', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Layoff', '7640', 'Account closed', 'Account closed', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Layoff', '7660', 'Client requested removal', 'Client requested removal', 5, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '3100', 'Reported under influence alcohol', 'Reported under influence alcohol', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '3700', 'Tardiness-frequent', 'Tardiness-frequent', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '3900', 'Leaving work station', 'Leaving work station', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4000', 'Absenteeism-excessive absences', 'Absenteeism-excessive absences', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4100', 'Absenteeism-unreported', 'Absenteeism-unreported', 5, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4300', 'Fighting on company property', 'Fighting on company property', 6, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4400', 'Quantity of work', 'Quantity of work', 7, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4600', 'Destruction of co. property', 'Destruction of co. property', 8, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4800', 'Violation of co. rules/policies', 'Violation of co. rules/policies', 9, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4860', 'Reported under influence drugs', 'Reported under influence drugs', 10, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '4900', 'Insubordination', 'Insubordination', 11, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '5110', 'Misconduct', 'Misconduct', 12, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '5120', 'Quality of work', 'Quality of work', 13, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '5400', 'Violation of safety rules', 'Violation of safety rules', 14, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '5500', 'Dishonesty-monetary theft', 'Dishonesty-monetary theft', 15, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '5800', 'Falsification of records', 'Falsification of records', 16, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Termination', '9700', 'Probationary-not qualified for job', 'Probationary-not qualified for job', 17, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '0100', 'Abandoned job', 'Abandoned job', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '0300', 'Reason unknown', 'Reason unknown', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '0400', 'In lieu of discharge ', 'In lieu of discharge ', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '0800', 'Did not return from leave', 'Did not return from leave', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1000', 'Retirement', 'Retirement', 5, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1400', 'Accept another job', 'Accept another job', 6, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1410', 'Go into own business', 'Go into own business', 7, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1420', 'Military', 'Military', 8, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1500', 'Relocate', 'Relocate', 9, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1600', 'Personal-not job related', 'Personal-not job related', 10, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1610', 'Marriage', 'Marriage', 11, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1620', 'Family obligations', 'Family obligations', 12, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1700', 'Transportation', 'Transportation', 13, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '1900', 'Illness', 'Illness', 14, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2000', 'Maternity', 'Maternity', 15, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2110', 'Dissatisfaction-work hours', 'Dissatisfaction-work hours', 16, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2120', 'Dissatisfaction-salary', 'Dissatisfaction-salary', 17, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2130', 'Dissatisfaction-working conditions', 'Dissatisfaction-working conditions', 18, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2140', 'Dissatisfaction-performance review', 'Dissatisfaction-performance review', 19, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2170', 'Dissatisfaction-company policies', 'Dissatisfaction-company policies', 20, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2190', 'Dissatisfaction-supervisor', 'Dissatisfaction-supervisor', 21, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2200', 'Walked off job', 'Walked off job', 22, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '2500', 'School', 'School', 23, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('Resignation', '8500', 'Death', 'Death', 24, 1, 'Compass-USA\Data Conversion', GetDate())

-- ALTER TABLE [TeamFinV2].[dbo].[PayPayCheckRequestPayCodes] ADD HcmHouseCode INT
-- ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucEmployeeNumber INT

INSERT INTO dbo.AppLaundryMetricTypes(AppLaumtBrief, AppLaumtTitle, AppLaumtDescription, AppLaumtDisplayOrder, AppLaumtActive, AppLaumtModBy, AppLaumtModAt)
VALUES('Gas', 'Gas (Therms)', 'Therms/Pound', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppLaundryMetricTypes(AppLaumtBrief, AppLaumtTitle, AppLaumtDescription, AppLaumtDisplayOrder, AppLaumtActive, AppLaumtModBy, AppLaumtModAt)
VALUES('Water', 'Water (Gallons)', 'Gallons/Pound', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppLaundryMetricTypes(AppLaumtBrief, AppLaumtTitle, AppLaumtDescription, AppLaumtDisplayOrder, AppLaumtActive, AppLaumtModBy, AppLaumtModAt)
VALUES('Electric', 'Electric (KWH)', 'KWH/Pound', 3, 1, 'Compass-USA\Data Conversion', GetDate())

-- Setup --> Laundry Metrics Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 820
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Laundry Metrics' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/app/laundry/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\laundryMetric%'
-- Setup --> Laundry Metrics Menu Insert [End] 

-- Add security nodes for action menu items in PO Requisition UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PORequisition'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'WriteInProcess', 'Write - In Process Status', 'Write - In Process Status', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PORequisition\WriteInProcess', 'crothall', 'chimes', 'fin', 'Purchasing', 'PORequisition', 'WriteInProcess', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing\PORequisition%'
-- Add security nodes for action menu items in PO Requisition UI [End]

-- Add security nodes for action menu items in PO Capital Requisition UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\CapitalRequisition'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'POCapRequisition', 'PO Capital Requisition', 'PO Capital Requisition', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\CapitalRequisition\POCapRequisition', 'crothall', 'chimes', 'fin', 'Purchasing', 'CapitalRequisition', 'POCapRequisition', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'RequisitionToPO', 'Convert PO Capital Requisition to Purchase Order', 'Convert PO Capital Requisition to Purchase Order', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Purchasing\CapitalRequisition\ConvertPOCapRequisitionToPO', 'crothall', 'chimes', 'fin', 'Purchasing', 'CapitalRequisition', 'ConvertPOCapRequisitionToPO', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'WriteInProcess', 'Write - In Process Status', 'Write - In Process Status', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Purchasing\CapitalRequisition\WriteInProcess', 'crothall', 'chimes', 'fin', 'Purchasing', 'CapitalRequisition', 'WriteInProcess', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing\CapitalRequisition%'
-- Add security nodes for action menu items in PO Capital Requisition UI [End]

Select * From RptReports
Update RptReports Set RptRepName = 'Mop_Subscript', RptRepSubscriptionAvailable = 1 Where RptReport = 13

--ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucEmployeeNumber
--ALTER TABLE  [dbo].[HcmHouseCodes] ADD [HcmHoucManagerId] [Int] NULL
--ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpEmpgDisability INT NULL
--ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD EmpEmpgWOTCCode VARCHAR(16) NULL
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumSunday Decimal(10, 3)
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumMonday Decimal(10, 3)
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumTuesday Decimal(10, 3)
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumWednesday Decimal(10, 3)
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumThursday Decimal(10, 3)
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumFriday Decimal(10, 3)
--ALTER TABLE AppLaundryMetrics ALTER COLUMN AppLaumSaturday Decimal(10, 3)
--EXEC sp_rename 'RevUnappliedCashes.HcmHouseCodeJob', 'HcmJobBrief', 'COLUMN'
--ALTER TABLE RevUnappliedCashes ALTER COLUMN HcmJobBrief VARCHAR(8)

/*
CT updated on 16th March 2015 11PM EST
*/
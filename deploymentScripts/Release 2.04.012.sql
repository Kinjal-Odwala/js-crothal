/*
Last production release version 2.04.011 on 4th December 2013 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.012', M_ENV_ENV_Database_Version = '2.04.012' 
Where M_ENV_ENVIRONMENT = 4

/*
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucEPayHours BIT NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeHierarchies] ADD EmpEmphMiddleName VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeHierarchies] ADD EmpEmphEmployeeNumber INT NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeParentHierarchies] ADD EmpEmpphMiddleName VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeParentHierarchies] ADD EmpEmpphEmployeeNumber INT NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModules] ADD AppModDataCollector BIT NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeHierarchies] ADD EmpEmphManagerId Int NULL
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeHierarchies] ADD EmpEmphModAt DateTime NULL
*/

-- Employee PTO type table data [Begin]

Insert Into dbo.EmpPTOTypes(EmpPtotBrief, EmpPtotTitle, EmpPtotDescription, EmpPtotAccrueTime, EmpPtotDisplayOrder, EmpPtotActive, EmpPtotModBy, EmpPtotModAt)
Values ('Vacation', 'Vacation', 'Vacation', 1, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPTOTypes(EmpPtotBrief, EmpPtotTitle, EmpPtotDescription, EmpPtotAccrueTime, EmpPtotDisplayOrder, EmpPtotActive, EmpPtotModBy, EmpPtotModAt)
Values ('Sick', 'Sick', 'Sick', 0, 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPTOTypes(EmpPtotBrief, EmpPtotTitle, EmpPtotDescription, EmpPtotAccrueTime, EmpPtotDisplayOrder, EmpPtotActive, EmpPtotModBy, EmpPtotModAt)
Values ('PTO', 'PTO', 'PTO', 0, 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPTOTypes(EmpPtotBrief, EmpPtotTitle, EmpPtotDescription, EmpPtotAccrueTime, EmpPtotDisplayOrder, EmpPtotActive, EmpPtotModBy, EmpPtotModAt)
Values ('Personal', 'Personal', 'Personal', 0, 3, 1, 'Compass-USA\Data Conversion', GetDate())

-- Employee PTO type table data [End]

-- Insert the PTO Employees [Begin]
Declare @EbFlxID Varchar(10)
	, @FirstName Varchar(100)
	, @MiddleName Varchar(100)
	, @LastName Varchar(100)
	, @JobTitle Varchar(100)
	, @HirNode Varchar(10)
	, @Status Varchar(10)

Declare curTimeZone Cursor For
	Select EbFlxID, PTOEmpFirstName, PTOEmpMiddleName, PTOEmpLastName, PTOEmpJobTitle, HirNode, PTOEmpStatus From CMDB.dbo.PTOEmployees With (NoLock)

Open curTimeZone

While 1=1
Begin
	Fetch Next From curTimeZone Into @EbFlxID, @FirstName, @MiddleName, @LastName, @JobTitle, @HirNode, @Status
	Set @FirstName = Replace(@FirstName, '''', '''''')
	Set @MiddleName = Replace(@MiddleName, '''', '''''')
	Set @LastName = Replace(@LastName, '''', '''''')
	If @@Fetch_Status <> 0 Break
	
	Print 'Insert Into PTOEmployees(EbFlxID, PTOEmpFirstName, PTOEmpMiddleName, PTOEmpLastName, PTOEmpJobTitle, HirNode, PTOEmpStatus) Values (' + @EbFlxID + ',''' + @FirstName + ''', ''' + @MiddleName + ''', ''' + @LastName + ''', ''' + @JobTitle + ''',  ' + @HirNode + ',''' + @Status + ''')'
End

Close curTimeZone
Deallocate curTimeZone
-- Insert the PTO Employees [End]

/****** Script for SelectTopNRows command from SSMS  ******/
INSERT INTO [dbo].[EmpPTOEmployees]
	( HcmHouseCode
	, EmpPtoeEbFlxId
	, EmpPtoeFirstName
	, EmpPtoeMiddleName
	, EmpPtoeLastName
	, EmpPtoeJobTitle
	, EmpPtoeStatus
	, EmpPtoeModBy
	, EmpPtoeModAt)
SELECT HcmHouseCode
	, EbFlxID
	, PTOEmpFirstName
	, PTOEmpMiddleName
	, PTOEmpLastName
	, PTOEmpJobTitle
	, PTOEmpStatus
	, 'Compass-USA\Data Conversion'
	, GetDate()
FROM [CMDB].[dbo].[PTOEmployees] PT
	Inner Join TeamFinV2.dbo.HcmHouseCodes Hc On Hc.HirNode = PT.HirNode
/****** Script for SelectTopNRows command from SSMS  ******/

-- Setup --> Employee PTO Menu Insert [Begin] 

Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 815
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Employee PTO' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/emp/employeePTOSetup/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like'\crothall\chimes\fin\Setup\EmployeePTO%'

-- Setup --> Employee PTO Menu Insert [End]

-----------------------------------------------------------------------------
Declare @HirNode As Int
Declare @DisplayOrder Int
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employee PTO'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'EmployeePTO', HirNodTitle = 'Employee PTO', HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO', HirNodLevel5 = 'EmployeePTO'
Where HirNode = @HirNode
-----------------------------------------------------------------------------

-- Add security nodes for action menu items in Employee PTO UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PTOYears', 'PTO Years', 'PTO Years', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\EmployeePTO\PTOYears', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePTO', 'PTOYears', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PTOTypes', 'PTO Types', 'PTO Types', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Setup\EmployeePTO\PTOTypes', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePTO', 'PTOTypes', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PTOPlans', 'PTO Plans', 'PTO Plans', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\EmployeePTO\PTOPlans', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePTO', 'PTOPlans', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PTOAssignments', 'PTO Assignments', 'PTO Assignments', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Setup\EmployeePTO\PTOAssignments', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePTO', 'PTOAssignments', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PTODays', 'PTO Days', 'PTO Days', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Setup\EmployeePTO\PTODays', 'crothall', 'chimes', 'fin', 'Setup', 'EmployeePTO', 'PTODays', 'Compass-USA\Data Conversion', GetDate())

Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like'\crothall\chimes\fin\Setup\EmployeePTO%'
-- Add security nodes for action menu items in Employee PTO UI [End]

-- Add Read/Write security nodes for HcmHoucClosedDate, HcmHoucClosedReason and EPayHours fields in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ClosedDate', 'ClosedDate', 'ClosedDate', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedDate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabHouseCode', 'SectionHouseCode', 'ClosedDate', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedDate'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedDate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabHouseCode', 'SectionHouseCode', 'ClosedDate', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedDate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabHouseCode', 'SectionHouseCode', 'ClosedDate', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ClosedReason', 'ClosedReason', 'ClosedReason', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedReason', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabHouseCode', 'SectionHouseCode', 'ClosedReason', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedReason'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedReason\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabHouseCode', 'SectionHouseCode', 'ClosedReason', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabHouseCode\SectionHouseCode\ClosedReason\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabHouseCode', 'SectionHouseCode', 'ClosedReason', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'EPayHours', 'EPayHours', 'EPayHours', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll\EPayHours', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabPayroll', 'EPayHours', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll\EPayHours'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll\EPayHours\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabPayroll', 'EPayHours', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabPayroll\EPayHours\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabPayroll', 'EPayHours', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for HcmHoucClosedDate, HcmHoucClosedReason and EPayHours fields in House Code [End]

-- Add Read/Write security nodes for HcmHoucClosedDate, HcmHoucClosedReason and EPayHours fields in House Code Wizard [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ClosedDate', 'ClosedDate', 'ClosedDate', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedDate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabHouseCode', 'SectionHouseCode', 'ClosedDate', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedDate'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedDate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabHouseCode', 'SectionHouseCode', 'ClosedDate', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedDate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabHouseCode', 'SectionHouseCode', 'ClosedDate', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ClosedReason', 'ClosedReason', 'ClosedReason', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedReason', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabHouseCode', 'SectionHouseCode', 'ClosedReason', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedReason'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedReason\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabHouseCode', 'SectionHouseCode', 'ClosedReason', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabHouseCode\SectionHouseCode\ClosedReason\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabHouseCode', 'SectionHouseCode', 'ClosedReason', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'EPayHours', 'EPayHours', 'EPayHours', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll\EPayHours', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabPayroll', 'EPayHours', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll\EPayHours'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll\EPayHours\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabPayroll', 'EPayHours', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabPayroll\EPayHours\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabPayroll', 'EPayHours', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for HcmHoucClosedDate, HcmHoucClosedReason and EPayHours fields in House Code Wizard [End]

Update dbo.AppModules Set AppModDataCollector = 0
Update dbo.AppModules Set AppModDataCollector = 1 Where AppModule = 1
Select * From dbo.AppModules

-- Setup --> Employee Date Approve Menu Insert [Begin] 

Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 816
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Emp Date Approve' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/emp/employeeDateApprove/usr/markup.htm'
	, @HirNodeParent

Update EsmV2.dbo.AppMenuItems Set AppMeniTitle = 'Employee Date Approve' Where AppMeniActionData = '/fin/emp/employeeDateApprove/usr/markup.htm'

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like'\crothall\chimes\fin\Setup\EmpDateApprove%'

-- Setup --> Employee Date Approve Menu Insert [End]

Insert Into dbo.HcmBudgetTemplates(HcmBudtBrief, HcmBudtTitle, HcmBudtDescription, HcmBudtDisplayOrder, HcmBudtActive, HcmBudtModBy, HcmBudtModAt)
Values ('Education', 'Education', 'Education', 5, 1, 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 12th February 2014 11PM EST
*/

Update AppModuleColumns Set AppModcAdHocActive = 1, AppModcLength = 50 where AppModule = 3 And AppModcTitle = 'RevInvCrtdBy'
Update AppModuleColumns Set AppModcReferenceTableName = 'HcmServiceTypes' Where AppModule = 1 And AppModcTitle = 'HcmServiceType'  
Update AppModuleColumns Set AppModcReferenceTableName = 'HcmRemitToLocations' Where AppModule = 1 And AppModcTitle = 'HcmRemitToLocation'
Update AppModuleAssociations Set AppModaActive = 0 Where AppModule = 11 And AppModuleAssociate = 3
Update AppModuleColumns set AppModcEditable = 0 , AppModcDescription = 'Created By' Where AppModule = 3 And AppModcTitle = 'RevInvCrtdBy'
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (11, 'RevInviCrtdBy', 'Created By', 11, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, 0, Null, 200, 0, Null)

--Add the following system variables
BudgetAdminEmailId [Joe.Eckert@compass-usa.com]
HRDepartmentEmailId

-- Add the following key in emp-->act web.config file
<add key="FinSMTPServer" value="relay.compass-usa.com" />
<add key="FinSenderEmail" value="teamfinpostoffice@crothall.com" />

-- Add the following key in hcm-->act web.config file
<add key="FinSMTPServer" value="relay.compass-usa.com" />
<add key="FinSenderEmail" value="teamfinpostoffice@crothall.com" />
<add key="EPayEmailId" value="EPAY@eurestservices.us" />

-- Add the following key in bud-->act web.config file
<add key="FinSMTPServer" value="relay.compass-usa.com" />
<add key="FinSenderEmail" value="teamfinpostoffice@crothall.com" />
<add key="ExportTimeout" value="1200" />
<httpRuntime executionTimeout="1200" /> 

/* No need to execute the following scripts
Insert Into dbo.HcmRoundingTimePeriods(HcmRtpBrief, HcmRtpTitle, HcmRtpDescription, HcmRtpDisplayOrder, HcmRtpActive, HcmRtpModBy, HcmRtpModAt)
Values ('NoRounding', 'No Rounding', 'No Rounding', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmRoundingTimePeriods(HcmRtpBrief, HcmRtpTitle, HcmRtpDescription, HcmRtpDisplayOrder, HcmRtpActive, HcmRtpModBy, HcmRtpModAt)
Values ('TenthHourRound', 'Tenth Hour Rounding', 'Tenth Hour Rounding', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmRoundingTimePeriods(HcmRtpBrief, HcmRtpTitle, HcmRtpDescription, HcmRtpDisplayOrder, HcmRtpActive, HcmRtpModBy, HcmRtpModAt)
Values ('QuarterHourRound', 'Quarter Hour Rounding', 'Quarter Hour Rounding', 3, 1, 'Compass-USA\Data Conversion', GetDate())

Update HcmEPaySiteSurveys Set HcmRoundingTimePeriod = Case HcmRoundingTimePeriod When 6 Then 2 When 15 Then 3 Else 1 End
*/

-- Add security nodes for action menu items in Epay Site Survey UI [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SurveySummary', 'Site Survey Summary', 'Site Survey Summary', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey\Site Survey Summary', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'EPay Site Survey', 'Site Survey Summary', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey%'

Update EsmV2.dbo.HirNodes 
Set HirNodBrief = 'PaySiteSurvey'
	, HirNodLevel5 = 'PaySiteSurvey'
	, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey' 
Where HirNode = 20410

Update EsmV2.dbo.HirNodes 
Set HirNodDescription = 'Clock Management'
	, HirNodLevel5 = 'PaySiteSurvey'
	, HirNodLevel6 = 'ClockManagement'
	, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey\ClockManagement' 
Where HirNode = 20413

Update EsmV2.dbo.HirNodes 
Set HirNodDescription = 'Manage Device Type'
	, HirNodLevel5 = 'PaySiteSurvey'
	, HirNodLevel6 = 'ManageDeviceType'
	, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey\ManageDeviceType' 
Where HirNode = 20414

Update EsmV2.dbo.HirNodes 
Set HirNodDescription = 'Site Methodology'
	, HirNodLevel5 = 'PaySiteSurvey'
	, HirNodLevel6 = 'SiteMethodology'
	, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey\SiteMethodology' 
Where HirNode = 20412

Update EsmV2.dbo.HirNodes 
Set HirNodDescription = 'Site Survey'
	, HirNodLevel5 = 'PaySiteSurvey'
	, HirNodLevel6 = 'SiteSurvey'
	, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey\SiteSurvey' 
Where HirNode = 20411

Update EsmV2.dbo.HirNodes 
Set HirNodLevel5 = 'PaySiteSurvey'
	, HirNodLevel6 = 'SurveySummary'
	, HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PaySiteSurvey\SurveySummary' 
Where HirNode = 20497
-- Add security nodes for action menu items in Epay Site Survey UI [End]

Select * From [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Emp Date Approve'

Update [Esmv2].[dbo].[AppMenuItems] 
Set AppMeniBrief = 'Emp Request'
	, AppMeniTitle = 'Employee Change Request'
	, AppMeniID = 'Emp Request'
	, AppMeniActionData = '/fin/emp/employeeRequest/usr/markup.htm'
Where AppMeniBrief = 'Emp Date Approve'

Select * From [Esmv2].[dbo].[HirNodes] Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmpDateApprove'

Update [Esmv2].[dbo].[HirNodes]
Set HirNodBrief = 'EmpRequest'
	, HirNodTitle = 'Empoloyee Request'
	, HirNodDescription = 'Empoloyee Request'
	, HirNodFullPath = '\crothall\chimes\fin\Setup\EmpRequest'
	, HirNodLevel5 = 'EmpRequest'
Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmpDateApprove'

/* No need to execute the following scripts
INSERT INTO dbo.EmpSocialSecurityNumbers(EmpSsnSSN, EmpSsnActive, EmpSsnModBy, EmpSsnModAt)
VALUES ('567891234', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpSocialSecurityNumbers(EmpSsnSSN, EmpSsnActive, EmpSsnModBy, EmpSsnModAt)
VALUES ('567891235', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpSocialSecurityNumbers(EmpSsnSSN, EmpSsnActive, EmpSsnModBy, EmpSsnModAt)
VALUES ('567891236', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpSocialSecurityNumbers(EmpSsnSSN, EmpSsnActive, EmpSsnModBy, EmpSsnModAt)
VALUES ('567891237', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpSocialSecurityNumbers(EmpSsnSSN, EmpSsnActive, EmpSsnModBy, EmpSsnModAt)
VALUES ('567891238', 1, 'Compass-USA\Data Conversion', GetDate())
*/

/*
CT updated on 5th March 2014 11PM EST
*/

-- Add the following key in pay-->act web.config file
<add key="TempFilePath" value="E:\Sites\TeamFin\js\crothall\chimes\fin\temp\" />

/*
CT updated on 18th March 2014 11PM EST
*/

/*
Last production release version 2.04.012 on 19th March 2014 11PM EST
*/
/*
Last production release version 2.04.009 on 27th March 2013 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.010', M_ENV_ENV_Database_Version = '2.04.010' 
Where M_ENV_ENVIRONMENT = 4

-- Add the following system variable name and values
FiscalPeriodCloseDays - 7
ShowFeedbackLink - Yes

/*
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceItems] ADD RevTaxableService Int NULL
*/

/* 
--Not required to execute the following script, this is a test script for R & D
Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModAssociateModule)
Values ('State', 'AppStateTypes', 1, 1, 'compass-usa\data conversion', GetDate(), 1)

Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (1, 9, 1, 'compass-usa\data conversion', GetDate())

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive
, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate, AppModcReferenceTableName)
Values (9, 'AppStatMinimumWage', 'Minimum Wage', 1, 1, 'compass-usa\data conversion', GetDate()
, 'Varchar', 1, Null, 1, 1, Null)
*/

-- Payroll --> Pay Check Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 304
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Check Request' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/pay/payCheck/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Payroll%'

-- Payroll --> Pay Check Menu Insert [End] 

-- Receivables --> Taxable Services Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 505
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Taxable Services' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/rev/taxableService/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\AccountsReceivable%'

-- Receivables --> Taxable Services Menu Insert [End] 

-- Receivables --> Batch Process Menu Insert [Begin] [Not Required]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 506
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Batch Process' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/rev/batchProcess/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\AccountsReceivable%'

-- Receivables --> Batch Process Menu Insert [End] 

-- Ad-Hoc Report: Job - House Code association (Note: Verify that the association doesn't exists)
Select * From AppModuleAssociations Where AppModule = 9
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (9, 1, 1, 'compass-usa\data conversion', GetDate())

-- Add the records to RevTaxableServices table
Insert Into dbo.RevTaxableServices (RevTaxsBrief, RevTaxsTitle, RevTaxsDescription, RevTaxsActive, RevTaxsDisplayOrder, RevTaxsModBy, RevTaxsModAt)
Values ('LS', 'Landscaping Services', 'Landscaping Services', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevTaxableServices (RevTaxsBrief, RevTaxsTitle, RevTaxsDescription, RevTaxsActive, RevTaxsDisplayOrder, RevTaxsModBy, RevTaxsModAt)
Values ('BM', 'Building Maintenance', 'Building Maintenance', 1, 2, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevTaxableServices (RevTaxsBrief, RevTaxsTitle, RevTaxsDescription, RevTaxsActive, RevTaxsDisplayOrder, RevTaxsModBy, RevTaxsModAt)
Values ('JSVS', 'Janitorial Services', 'Janitorial Services', 1, 3, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevTaxableServices (RevTaxsBrief, RevTaxsTitle, RevTaxsDescription, RevTaxsActive, RevTaxsDisplayOrder, RevTaxsModBy, RevTaxsModAt)
Values ('JSPS', 'Janitorial Supplies', 'Janitorial Supplies', 1, 4, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevTaxableServices (RevTaxsBrief, RevTaxsTitle, RevTaxsDescription, RevTaxsActive, RevTaxsDisplayOrder, RevTaxsModBy, RevTaxsModAt)
Values ('CL', 'Cleaning and Laundry', 'Cleaning and Laundry', 1, 5, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevTaxableServices (RevTaxsBrief, RevTaxsTitle, RevTaxsDescription, RevTaxsActive, RevTaxsDisplayOrder, RevTaxsModBy, RevTaxsModAt)
Values ('OS', 'Office Services', 'Office Services', 1, 6, 'Compass-USA\Data Conversion', GetDate())

-- Setup --> Employee Hierarchy Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 814
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Employee Hierarchy' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/emp/employeeHierarchy/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like'\crothall\chimes\fin\Setup\EmpHierarchy%'
-- Setup --> Employee Hierarchy Menu Insert [End]

-- Ad Hoc Report - Payroll [Begin]
Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModEditable, AppModHouseCodeAssociated)
Values ('Payroll', 'WeeklyPayroll', 1, 1, 'compass-usa\data conversion', GetDate(), 1, 1)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'EmpEmpgEmployeeNumber', 'Employee Number', 0, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 1, Null, Null, Null, 100, 0, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PplPeoLastName', 'Last Name', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 150, 0, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PplPeoFirstName', 'First Name', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 150, 0, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PayEmpwpExpenseDate', 'Expense Date', 0, 1, 'compass-usa\data conversion', GetDate(), 'DateTime', 0, 'DateTime', 1, Null, Null, Null, 100, 0, 8)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'AppUniBrief', 'Charge To HouseCode', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, 0, 16)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'HcmJobBrief +'' - ''+ HcmJobTitle', 'Job', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 150, 0, 8)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'WomwoWorkOrderNumber', 'Work Order Number', 0, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, Null, Null, Null, 100, 0, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PayPaycBrief +'' - ''+ PayPaycTitle', 'Pay Code', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, 0, 16)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'EmpWorsTitle', 'Work Shift', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, 0, 64)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'EmpJobctTitle', 'Job Code', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 200, 0, 64)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'AppTrastTitle', 'Status', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, 0, 64)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PayEmpwpHours', 'Hours', 0, 1, 'compass-usa\data conversion', GetDate(), 'Decimal', 0, 'Decimal', 1, Null, Null, Null, 50, 0, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PayEmpwpFixedAmount', 'Fixed Amount', 0, 1, 'compass-usa\data conversion', GetDate(), 'Decimal', 0, 'Decimal', 1, Null, Null, Null, 100, 0, 16)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PayEmpwpCurrentPayRate', 'Current Pay Rate', 0, 1, 'compass-usa\data conversion', GetDate(), 'Decimal', 0, 'Decimal', 1, Null, Null, Null, 100, 0, 16)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'PayEmpwpAlternatePayRate', 'Alternate Pay Rate', 0, 1, 'compass-usa\data conversion', GetDate(), 'Decimal', 0, 'Decimal', 1, Null, Null, Null, 100, 0, 16)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'FscPerTitle', 'Fiscal Period', 0, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, Null, Null, Null, 100, 0, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (10, 'FscYeaTitle', 'Fiscal Year', 0, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, 0, 64)
-- Ad Hoc Report - Payroll [End]

/*
CT updated on 5th June 2013 11PM EST
*/

/*
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucBuildingPopulation DECIMAL(18, 2) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucMaintainableAcres VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucScientists VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucManagedRooms VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmSiteType INT NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucIntegrator BIT NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucIntegratorName VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucAuditScore VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucStandardizationScore VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucIncidentFrequencyRate VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucTRIR VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucLostDays VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucReportedClaims VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucNearMisses VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucOSHARecordable VARCHAR(50) NULL
*/

Insert Into dbo.HcmSiteTypes(HcmSittBrief, HcmSittTitle, HcmSittDescription, HcmSittDisplayOrder, HcmSittActive, HcmSittModBy, HcmSittModAt)
Values('R&D', 'R&D', 'R&D', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmSiteTypes(HcmSittBrief, HcmSittTitle, HcmSittDescription, HcmSittDisplayOrder, HcmSittActive, HcmSittModBy, HcmSittModAt)
Values('Manufacturing', 'Manufacturing', 'Manufacturing', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmSiteTypes(HcmSittBrief, HcmSittTitle, HcmSittDescription, HcmSittDisplayOrder, HcmSittActive, HcmSittModBy, HcmSittModAt)
Values('Plant', 'Plant', 'Plant', 3, 1, 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for newly added fields in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BuildingPopulati', 'BuildingPopulation', 'BuildingPopulation', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\BuildingPopulation', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'BuildingPopulation', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\BuildingPopulation'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\BuildingPopulation\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'BuildingPopulation', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\BuildingPopulation\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'BuildingPopulation', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'MaintainableAcre', 'MaintainableAcres', 'MaintainableAcres', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MaintainableAcres', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'MaintainableAcres', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MaintainableAcres'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MaintainableAcres\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'MaintainableAcres', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MaintainableAcres\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'MaintainableAcres', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Scientists', 'Scientists', 'Scientists', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Scientists', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'Scientists', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Scientists'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Scientists\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'Scientists', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Scientists\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'Scientists', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ManagedRooms', 'ManagedRooms', 'ManagedRooms', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\ManagedRooms', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'ManagedRooms', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\ManagedRooms'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\ManagedRooms\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'ManagedRooms', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\ManagedRooms\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'ManagedRooms', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SiteType', 'SiteType', 'SiteType', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\SiteType', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'SiteType', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\SiteType'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\SiteType\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'SiteType', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\SiteType\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'SiteType', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Integrator', 'Integrator', 'Integrator', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Integrator', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'Integrator', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Integrator'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Integrator\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'Integrator', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\Integrator\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'Integrator', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'IntegratorName', 'IntegratorName', 'IntegratorName', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\IntegratorName', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'IntegratorName', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\IntegratorName'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\IntegratorName\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'IntegratorName', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\IntegratorName\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'IntegratorName', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'AuditScore', 'AuditScore', 'AuditScore', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\AuditScore', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'AuditScore', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\AuditScore'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\AuditScore\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'AuditScore', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\AuditScore\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'AuditScore', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Standardization', 'StandardizationScore', 'StandardizationScore', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\StandardizationScore', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'StandardizationScore', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\StandardizationScore'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\StandardizationScore\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'StandardizationScore', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\StandardizationScore\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabStatistics', 'StandardizationScore', 'Write', 'Compass-USA\Data Conversion', GetDate())

-------------------------------------------------------------------------------------
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BuildingPopulati', 'BuildingPopulation', 'BuildingPopulation', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\BuildingPopulation', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'BuildingPopulation', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\BuildingPopulation'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\BuildingPopulation\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'BuildingPopulation', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\BuildingPopulation\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'BuildingPopulation', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'MaintainableAcre', 'MaintainableAcres', 'MaintainableAcres', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MaintainableAcres', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'MaintainableAcres', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MaintainableAcres'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MaintainableAcres\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'MaintainableAcres', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\MaintainableAcres\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'MaintainableAcres', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Scientists', 'Scientists', 'Scientists', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Scientists', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'Scientists', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Scientists'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Scientists\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'Scientists', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Scientists\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'Scientists', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ManagedRooms', 'ManagedRooms', 'ManagedRooms', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\ManagedRooms', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'ManagedRooms', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\ManagedRooms'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\ManagedRooms\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'ManagedRooms', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\ManagedRooms\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'ManagedRooms', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SiteType', 'SiteType', 'SiteType', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\SiteType', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'SiteType', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\SiteType'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\SiteType\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'SiteType', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\SiteType\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'SiteType', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Integrator', 'Integrator', 'Integrator', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Integrator', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'Integrator', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Integrator'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Integrator\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'Integrator', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\Integrator\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'Integrator', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'IntegratorName', 'IntegratorName', 'IntegratorName', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\IntegratorName', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'IntegratorName', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\IntegratorName'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\IntegratorName\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'IntegratorName', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\IntegratorName\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'IntegratorName', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'AuditScore', 'AuditScore', 'AuditScore', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\AuditScore', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'AuditScore', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\AuditScore'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\AuditScore\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'AuditScore', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\AuditScore\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'AuditScore', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Standardization', 'StandardizationScore', 'StandardizationScore', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\StandardizationScore', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'StandardizationScore', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\StandardizationScore'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\StandardizationScore\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'StandardizationScore', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabStatistics\StandardizationScore\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabStatistics', 'StandardizationScore', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for newly added fields in House Code [End]

-- Add Read/Write security nodes for tab Safety and its fields in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'TabSafety', 'TabSafety', 'TabSafety', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'Write', 'Compass-USA\Data Conversion', GetDate())
-----------------------------------------------------------------
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'IncidentFreqRate', 'IncidentFrequencyRate', 'IncidentFrequencyRate', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\IncidentFrequencyRate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'IncidentFrequencyRate', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\IncidentFrequencyRate'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\IncidentFrequencyRate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'IncidentFrequencyRate', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\IncidentFrequencyRate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'IncidentFrequencyRate', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'TRIR', 'TRIR', 'TRIR', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\TRIR', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'TRIR', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\TRIR'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\TRIR\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'TRIR', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\TRIR\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'TRIR', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'LostDays', 'LostDays', 'LostDays', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\LostDays', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'LostDays', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\LostDays'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\LostDays\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'LostDays', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\LostDays\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'LostDays', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ReportedClaims', 'ReportedClaims', 'ReportedClaims', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\ReportedClaims', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'ReportedClaims', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\ReportedClaims'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\ReportedClaims\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'ReportedClaims', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\ReportedClaims\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'ReportedClaims', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'NearMisses', 'NearMisses', 'NearMisses', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\NearMisses', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'NearMisses', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\NearMisses'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\NearMisses\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'NearMisses', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\NearMisses\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'NearMisses', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'OSHARecordable', 'OSHARecordable', 'OSHARecordable', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\OSHARecordable', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'OSHARecordable', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\OSHARecordable'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\OSHARecordable\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'OSHARecordable', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabSafety\OSHARecordable\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabSafety', 'OSHARecordable', 'Write', 'Compass-USA\Data Conversion', GetDate())
-----------------------------------------------------------------------

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'TabSafety', 'TabSafety', 'TabSafety', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'Write', 'Compass-USA\Data Conversion', GetDate())
------------------------------------------------------------------------

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'IncidentFreqRate', 'IncidentFrequencyRate', 'IncidentFrequencyRate', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\IncidentFrequencyRate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'IncidentFrequencyRate', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\IncidentFrequencyRate'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\IncidentFrequencyRate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'IncidentFrequencyRate', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\IncidentFrequencyRate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'IncidentFrequencyRate', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'TRIR', 'TRIR', 'TRIR', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\TRIR', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'TRIR', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\TRIR'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\TRIR\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'TRIR', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\TRIR\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'TRIR', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'LostDays', 'LostDays', 'LostDays', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\LostDays', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'LostDays', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\LostDays'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\LostDays\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'LostDays', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\LostDays\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'LostDays', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ReportedClaims', 'ReportedClaims', 'ReportedClaims', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\ReportedClaims', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'ReportedClaims', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\ReportedClaims'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\ReportedClaims\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'ReportedClaims', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\ReportedClaims\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'ReportedClaims', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'NearMisses', 'NearMisses', 'NearMisses', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\NearMisses', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'NearMisses', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\NearMisses'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\NearMisses\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'NearMisses', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\NearMisses\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'NearMisses', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'OSHARecordable', 'OSHARecordable', 'OSHARecordable', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\OSHARecordable', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'OSHARecordable', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\OSHARecordable'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\OSHARecordable\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'OSHARecordable', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabSafety\OSHARecordable\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabSafety', 'OSHARecordable', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for tab Safety and its fields in House Code [End]

/*
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationBrief Varchar(8) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocation Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationContact Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationAddress1 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationAddress2 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationCity Varchar(100) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationState Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvServiceLocationPostalCode Varchar(12) NULL
*/

-- Employee Wizard - Reverse Termination Security Node [Begin]

Declare @HirNodeParent As Int
Declare @DisplayOrder Int

Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard'
Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes

EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'ReverseTermination', 'ReverseTerminati', 'ReverseTermination', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard\ReverseTermination'
Insert into ESMV2.dbo.HirGroupNodes Values (@HirNodeParent, 1, 'Compass-USA\Data Conversion', GetDate())

-- Employee Wizard - Reverse Termination Security Node [End]

/*
CT updated on 26th June 2013 11PM EST
*/

/*
Last production release version 2.04.010 on 10th July 2013 11PM EST
*/
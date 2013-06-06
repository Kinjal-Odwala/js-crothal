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
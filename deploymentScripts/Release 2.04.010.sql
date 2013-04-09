/*
Last production release version 2.04.009 on 27th March 2013 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.010', M_ENV_ENV_Database_Version = '2.04.010' 
Where M_ENV_ENVIRONMENT = 4

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

-- Receivables --> Batch Process Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 505
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
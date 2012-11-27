--last production update version 2.03.000
--16th June 2011

select * from m_env_environments
update m_env_environments
	set M_ENV_ENV_APPLICATION_VERSION = '2.04.000'
		,M_ENV_ENV_DATABASE_VERSION = '2.04.000'
        --,M_ENV_ENV_SESSION_WARNING_MSEC = ''
		--,M_ENV_ENV_SESSION_TIMEOUT_MSEC = ''
where m_env_environment = 4

--next CT update version 2.03.001

--Budget security not required for coming production
--Security nodes for Budget module **start ONLY TOBE EXECUTED ON CT. PRODUCTION WE HAVE A CONSOLIDATED SCRIPT
Use Esmv2
Go

      Select * from hirnodes where hirnodfullpath like '\crothall\chimes\fin\budgeting%'
	  order by hirnoddisplayorder 
	  --delete hirnodes where hirnode = 18972
      Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = '\crothall\chimes\fin\budgeting'

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            42 -- hirNode
            , 1 -- hirHierarchy
            , 41 -- hirNodeParent
            , 33 -- hirLevel
            , 'AnnualizedBudget' -- Title
            , 'Annualized' --Brief
            , 'Annualized Budget' -- Description
            , 40 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            43 -- hirNode
            , 1 -- hirHierarchy
            , 41 -- hirNodeParent
            , 33 -- hirLevel
            , 'BudgetSummary' -- Title
            , 'Budget Summary' --Brief
            , 'Budget Summary' -- Description
            , 41 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            44 -- hirNode
            , 1 -- hirHierarchy
            , 41 -- hirNodeParent
            , 33 -- hirLevel
            , 'AnnualProjections' -- Title
            , 'Anl Projection' --Brief
            , 'Annual Projections' -- Description
            , 42 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            1213 -- hirNode
            , 1 -- hirHierarchy
            , 41 -- hirNodeParent
            , 33 -- hirLevel
            , 'BudgetAdministration' -- Title
            , 'Administration' --Brief
            , 'Budget Administration' -- Description
            , 43 -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy


Use Esmv2
Go
Drop table HirNodeSecuritySetupSources

Create table HirNodeSecuritySetupSources
(
      HirNodeSecuritySetupSource Int Not Null 
            Constraint Id_HirNodeSecuritySetupSource Identity(-1,-1),
      HirNodsssBrief Varchar(16) Not Null,
      HirNodsssTitle Varchar(64) Not Null,
      HirNodsssDescription Varchar(256) Not Null,
      HirHierarchy Int Not Null,
      HirLevel Int Not Null,
      HirNodeParentFullPath Varchar(250),
      HirNodsssDisplayOrder Int Not Null
      Constraint Pk_HirNodeSecuritySetupSource Primary Key (HirNodeSecuritySetupSource)
)

/*
Select max(hirnode) from Hirnodes order by hirnode desc
Truncate table HirNodeSecuritySetupSources 
*/

Truncate table HirNodeSecuritySetupSources 

Declare @HirNodeIdentity Int
Select @HirNodeIdentity = Max(HirNode) From Esmv2.dbo.HirNodes
Set @HirNodeIdentity = @HirNodeIdentity + 1
Print @HirNodeIdentity

--Delete From HirNodes Where HirNode > 15039  And HirLevel = 9 And HirHierarchy = 1
--select top 500 * From HirNodes Where HirNode > 15039  And HirLevel = 9 And HirHierarchy = 1 order by hirNodDisplayOrder desc --Where HirNode > 14393

--Budgeting\AnnualizedBudget
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualizedBudget', @HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualizedBudget', (-@@Identity)+@HirNodeIdentity)

--Budgeting\BudgetSummary
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetSummary', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetSummary', (-@@Identity)+@HirNodeIdentity)

--Budgeting\AnnualProjections\ByPeriod
      Insert Into HirNodeSecuritySetupSources
      values('byPeriod', 'ByPeriod', 'byPeriod', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\ByPeriod', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\ByPeriod', (-@@Identity)+@HirNodeIdentity)
--Budgeting\AnnualProjections\WORForecast
      Insert Into HirNodeSecuritySetupSources
      values('worForecast', 'WORForecast', 'worForecast', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\WORForecast', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\WORForecast', (-@@Identity)+@HirNodeIdentity)

--Budgeting\BudgetAdministration\AnnualInformation
      Insert Into HirNodeSecuritySetupSources
      values('annualInfo', 'AnnualInformation', 'annualInformation', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\AnnualInformation', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\AnnualInformation', (-@@Identity)+@HirNodeIdentity)
--Budgeting\BudgetAdministration\ApproveBudget
      Insert Into HirNodeSecuritySetupSources
      values('approveBudget', 'ApproveBudget', 'approveBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('approve', 'Approve', 'approve', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('reject', 'Reject', 'reject', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
--Budgeting\BudgetAdministration\DeleteBudget
      Insert Into HirNodeSecuritySetupSources
      values('deleteBudget', 'DeleteBudget', 'deleteBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\DeleteBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\DeleteBudget', (-@@Identity)+@HirNodeIdentity)
--Budgeting\BudgetAdministration\ExportBudget
      Insert Into HirNodeSecuritySetupSources
      values('exportBudget', 'ExportBudget', 'exportBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ExportBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ExportBudget', (-@@Identity)+@HirNodeIdentity)

Declare 
      @Brief varchar(16), 
      @Title varchar(64), 
      @Desc varchar(256), 
      @ParentFullPath varchar(500), 
      @DispOrder Int, 
      @HirNodeParent Int

Declare curTemp Cursor For 
      Select HirNodsssBrief, HirNodsssTitle, HirNodsssDescription, HirNodeParentFullPath, HirNodsssDisplayOrder
      From Esmv2.dbo.HirNodeSecuritySetupSources
      Order By HirNodeSecuritySetupSource Desc

Open curTemp

While(1=1)
Begin
      Fetch Next From curTemp Into @Brief, @Title, @Desc, @ParentFullPath, @DispOrder
      If @@Fetch_Status <> 0 Break
      
      Print @Brief
      Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = @ParentFullPath

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , @HirNodeParent -- hirNodeParent
            , 9 -- hirLevel
            , @Title -- Title
            , @Brief --Brief
            , @Desc -- Description
            , @DispOrder -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy
      
End

close curTemp
deallocate curTemp
--Security nodes for Budget module **end


--**Tax Rate Menu
--
EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, 69 -- hirNodeParent
	, 33 -- hirLevel
	, 'TaxRates' -- Title
	, 'Tax Rates' -- Brief
	, 'Tax Rates' -- Description
	, 76 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup\datacollector'
go

INSERT INTO [Esmv2].[dbo].[AppMenuItems]
           ([AppMenuAction]
           ,[AppMenuState]
           ,[HirNode]
           ,[AppMeniBrief]
           ,[AppMeniTitle]
           ,[AppMeniActive]
           ,[AppMeniDisplayOrder]
           ,[AppMeniID]
           ,[AppMeniActionData]
           ,[AppMeniModBy]
           ,[AppMeniModAt]
           ,[AppMenuDisplayType])
     VALUES
           (2
           ,4
           ,@15757 -- Change
           ,'Tax Rates'
           ,'Tax Rates'
           ,1
           ,809
           ,'taxrate'
           ,'/fin/rev/taxRate/usr/markup.htm'
           ,'compass-usa\data conversion'
           ,getdate()
           ,1)
GO

--update Notification menu from the SP

Insert into hirgroupnodes values (@15757, 1, 'compass-usa\data conversion', getdate()) -- add new menu item to admin group
--** Tax Rate Menu -- End


--**Data Collector
--

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, 69 -- hirNodeParent
	, 33 -- hirLevel
	, 'DataCollector' -- Title
	, 'Data Collector' -- Brief
	, 'Data Collector' -- Description
	, 77 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup\datacollector'
go

INSERT INTO [Esmv2].[dbo].[AppMenuItems]
           ([AppMenuAction]
           ,[AppMenuState]
           ,[HirNode]
           ,[AppMeniBrief]
           ,[AppMeniTitle]
           ,[AppMeniActive]
           ,[AppMeniDisplayOrder]
           ,[AppMeniID]
           ,[AppMeniActionData]
           ,[AppMeniModBy]
           ,[AppMeniModAt]
           ,[AppMenuDisplayType])
     VALUES
           (2
           ,4
           , @15757 -- Change
           ,'Data Collector'
           ,'Data Collector'
           ,1
           ,810
           ,'dat'
           ,'/fin/app/dataCollector/usr/markup.htm'
           ,'compass-usa\data conversion'
           , getdate()
           ,1)
GO

Insert into hirgroupnodes values (@15757, 1, 'compass-usa\data conversion', getdate()) -- add new menu item to admin group

Copy a record to Teamfinv2.dbo.AppModules table
Copy all records from AppModuleColumns table

--** Data Collector Menu -- End

-- Sales Tax changes [Begin]

Add in app -> web.config file <system.web> section
	<httpRuntime maxRequestLength="11264" />

Add in rev -> web.config file
	<add key="FinAppPath" value="/net/crothall/chimes/fin/app/act/provider.aspx?moduleId=app" />
	<add key="TempFilePath" value="D:\Build\js\crothall\chimes\fin\temp\" />

Add in rev -> web.config file <system.web> section
	<httpRuntime executionTimeout="300" />

DROP TABLE [dbo].[RevMunicipalityTaxes]

ALTER TABLE [dbo].[WomWorkOrders] ALTER COLUMN [WomwoServiceLocation] VARCHAR(64) NULL
ALTER TABLE [dbo].[WomWorkOrders] ALTER COLUMN [WomwoCustomer] VARCHAR(64) NULL
ALTER TABLE [dbo].[RevInvoices] ALTER COLUMN [RevInvBillTo] VARCHAR(64) NULL
ALTER TABLE [dbo].[RevInvoices] ALTER COLUMN [RevInvCompany] VARCHAR(64) NULL
ALTER TABLE [EsmV2].[dbo].[AppSites] ADD AppSitGEOCode VARCHAR(2) NULL
 
Insert Into EsmV2.dbo.AppStateTypes Values('CN', 'Canada', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('IT', 'International', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('PR', 'Puerto Rico', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('VI', 'Virgin Islands', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('PI', 'Pacific Islands', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('GU', 'Guam', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('AS', 'American Samoa', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('PW', 'Reserved', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('AA', 'AA', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('AE', 'AE', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into EsmV2.dbo.AppStateTypes Values('AP', 'AP', '', 0, 1, 'Compass-USA\Data Conversion', GetDate())

-- Sales Tax changes [End]

-- Tax Rates Menu Insert [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'
/*
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Tax Rates', 'Tax Rates', 'Tax Rates', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\TaxRates', 'crothall', 'chimes', 'fin', 'Setup', 'TaxRates', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\TaxRates'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Tax Rates', 'Tax Rates', 1, 809, 'taxrt', '/fin/rev/taxRate/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)
*/
-- Add Read/Write security nodes for Tax Rates
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\TaxRates\Read', 'crothall', 'chimes', 'fin', 'Setup', 'TaxRates', 'Read', 'Persistech\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Setup\TaxRates\Write', 'crothall', 'chimes', 'fin', 'Setup', 'TaxRates', 'Write', 'Persistech\Data Conversion', GetDate())

-- Tax Rates Menu Insert [End]

-- Add Read/Write security nodes for GEO Code in Sites [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Sites\SectionSites'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'GEOCode', 'GEOCode', 'GEOCode', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\Sites\SectionSites\GEOCode', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Sites', 'SectionSites', 'GEOCode', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Sites\SectionSites\GEOCode'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\Sites\SectionSites\GEOCode\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Sites', 'SectionSites', 'GEOCode', 'Read', 'Persistech\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\Sites\SectionSites\GEOCode\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Sites', 'SectionSites', 'GEOCode', 'Write', 'Persistech\Data Conversion', GetDate())

-- Add Read/Write security nodes for GEO Code in Sites [End]

--** CT updated on 12th July version 2.3.001

-- Inventory Menu Insert [Begin]
--Create virtual directory for inv module
--copy over web.config file & spring-persistence.xml and setup accordingly
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Inventory', 'Inventory', 'Inventory', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Inventory', 'crothall', 'chimes', 'fin', 'Inventory', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Inventory'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(1, 4, @HirNode, 'Inventory', 'Inventory', 1, 420, 'invt', 'Persistech\Data Conversion', GetDate(), 1)

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Administration', 'Administration', 'Administration', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Inventory\Administration', 'crothall', 'chimes', 'fin', 'Inventory', 'Administration', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Inventory\Administration'

-- Add Read/Write security nodes for Inventory-->Administration
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Inventory\Administration\Read', 'crothall', 'chimes', 'fin', 'Inventory', 'Administration', 'Read', 'Persistech\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Inventory\Administration\Write', 'crothall', 'chimes', 'fin', 'Inventory', 'Administration', 'Write', 'Persistech\Data Conversion', GetDate())

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Administration', 'Administration', 1, 421, 'invta', '/fin/inv/administration/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Inventory'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Inventory Items', 'Inventory Items', 'Inventory Items', @DisplayOrder + 5, 1, '\crothall\chimes\fin\Inventory\InventoryItems', 'crothall', 'chimes', 'fin', 'Inventory', 'InventoryItems', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Inventory\InventoryItems'

-- Add Read/Write security nodes for Inventory-->InventoryItems
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 6, 1, '\crothall\chimes\fin\Inventory\InventoryItems\Read', 'crothall', 'chimes', 'fin', 'Inventory', 'InventoryItems', 'Read', 'Persistech\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 7, 1, '\crothall\chimes\fin\Inventory\InventoryItems\Write', 'crothall', 'chimes', 'fin', 'Inventory', 'InventoryItems', 'Write', 'Persistech\Data Conversion', GetDate())

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Inventory Items', 'Inventory Items', 1, 422, 'invti', '/fin/inv/inventoryItem/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Inventory Menu Insert [End]

Select * From dbo.FscAccounts Where FscAccInventory = 1
Update dbo.FscAccounts Set FscAccInventory = 1 Where FscAccCode In (6015, 6020, 6025, 6030, 6050, 6070, 6075, 6080, 6110, 6120)

--** CT updated on Aug 9, 2011
--** next CT update version 2.03.003

---------------- Kishor ----------------------


Use Esmv2
Go
Drop table HirNodeSecuritySetupSources
--select * from hirnodes where hirnodfullpath like '%read ssn%'
--delete from hirnodes where hirnodfullpath like '%read ssn%'

Create table HirNodeSecuritySetupSources
(
      HirNodeSecuritySetupSource Int Not Null 
            Constraint Id_HirNodeSecuritySetupSource Identity(-1,-1),
      HirNodsssBrief Varchar(16) Not Null,
      HirNodsssTitle Varchar(64) Not Null,
      HirNodsssDescription Varchar(256) Not Null,
      HirHierarchy Int Not Null,
      HirLevel Int Not Null,
      HirNodeParentFullPath Varchar(250),
      HirNodsssDisplayOrder Int Not Null
      Constraint Pk_HirNodeSecuritySetupSource Primary Key (HirNodeSecuritySetupSource)
)
/*
Select * from HirNodeSecuritySetupSources order by HirNodeSecuritySetupSource desc
Select top 270 * from Hirnodes order by hirnode desc
Select max(hirnode) from Hirnodes order by hirnode desc
Truncate table HirNodeSecuritySetupSources 
*/

Truncate table HirNodeSecuritySetupSources 

Declare @HirNodeIdentity Int
Select @HirNodeIdentity = Max(HirNode) From Esmv2.dbo.HirNodes
Set @HirNodeIdentity = @HirNodeIdentity + 1
Print @HirNodeIdentity

--Delete From HirNodes Where HirNode > 13212  And HirLevel = 9 And HirHierarchy = 1
--select top 500 * From HirNodes Where HirNode > 13212  And HirLevel = 9 And HirHierarchy = 1 order by hirNodDisplayOrder desc --Where HirNode > 14393



--FinancialEntity 
Insert Into HirNodeSecuritySetupSources
values('financialEntity', 'FinancialEntity', 'financialEntity', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', @HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\financialEntity', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\financialEntity', (-@@Identity)+@HirNodeIdentity)

--Employees\Search
Insert Into HirNodeSecuritySetupSources
values('wizard', 'Wizard', 'wizard', 1, 9, '\crothall\chimes\fin\Setup\Employees', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('edit', 'Edit', 'edit', 1, 9, '\crothall\chimes\fin\Setup\Employees\Wizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('HouseCodeTransfr', 'HouseCodeTransfer', 'HouseCodeTransfer', 1, 9, '\crothall\chimes\fin\Setup\Employees\Wizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('newHire', 'NewHire', 'newHire', 1, 9, '\crothall\chimes\fin\Setup\Employees\Wizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('reHire', 'ReHire', 'reHire', 1, 9, '\crothall\chimes\fin\Setup\Employees\Wizard', (-@@Identity)+@HirNodeIdentity)
Insert Into HirNodeSecuritySetupSources
values('termination', 'Termination', 'termination', 1, 9, '\crothall\chimes\fin\Setup\Employees\Wizard', (-@@Identity)+@HirNodeIdentity)

      
----------------------------------------
--Select * from HirNodeSecuritySetupSources order by HirNodeSecuritySetupSource desc

Declare 
      @Brief varchar(16), 
      @Title varchar(64), 
      @Desc varchar(256), 
      @ParentFullPath varchar(500), 
      @DispOrder Int, 
      @HirNodeParent Int

Declare curTemp Cursor For 
      Select HirNodsssBrief, HirNodsssTitle, HirNodsssDescription, HirNodeParentFullPath, HirNodsssDisplayOrder
      From Esmv2.dbo.HirNodeSecuritySetupSources
      Order By HirNodeSecuritySetupSource Desc

Open curTemp

While(1=1)
Begin
      Fetch Next From curTemp Into @Brief, @Title, @Desc, @ParentFullPath, @DispOrder
      If @@Fetch_Status <> 0 Break
      
      Print @Brief
      Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = @ParentFullPath

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , @HirNodeParent -- hirNodeParent
            , 9 -- hirLevel
            , @Title -- Title
            , @Brief --Brief
            , @Desc -- Description
            , @DispOrder -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy
      
End

close curTemp
deallocate curTemp



---------------- Kishor ---------------------

Select Max(IsNull(RevInvInvoiceNumber, 0)) From dbo.RevInvoices 
Add new system variable "NewInvoiceNumber" with the value maximum Invoice Number

Update the following 2 stored procedures and review the table InvInventoryItems

1. InvInventoryInsert
2. InvInventoryItemUpdate

Copy over datacollector .js files

--** Production updated on Aug 31, 2011

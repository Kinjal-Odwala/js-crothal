select * from m_env_environments

update m_env_environments
	set M_ENV_ENV_APPLICATION_VERSION = '2.02.005'
		,M_ENV_ENV_DATABASE_VERSION = '2.02.005'
        --,M_ENV_ENV_SESSION_WARNING_MSEC = ''
		--,M_ENV_ENV_SESSION_TIMEOUT_MSEC = ''
where m_env_environment = 1

--last production update 2.02.000
--24th March 2011

-- ** Next Release - 2.02.001

-- UI Security HirNode Updates - HouseCode 
Declare @HirNodeParent Int
--Select * from Esmv2.dbo.hirnodes where hirnodfullpath = '\crothall\chimes\fin\house code management'

EXEC Esmv2.dbo.[HirNodeUpdate] 
	65 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent --7 -- hirNodeParent
	, 33 -- hirLevel
	, 'HouseCodeSetup' -- Title
	, 'HouseCodeSetup' -- Brief
	, 'HouseCodeSetup' -- Description
	, 63 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

--Select * from Esmv2.dbo.hirnodes where hirnodfullpath = '\crothall\chimes\fin\HouseCodeSetup\House Codes'

EXEC Esmv2.dbo.[HirNodeUpdate] 
	68 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent --65 -- hirNodeParent
	, 33 -- hirLevel
	, 'HouseCodes' -- Title
	, 'HouseCodes' -- Brief
	, 'HouseCodes' -- Description
	, 66 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

-- UI Security HirNode Updates - HouseCode - End

-- Please change default value while updating PRODUCTION.
Insert into M_ENV_ENVIRONMENTS values(1, 'Local Development', '2.02.000', '2.02.000', 840000, 880000, 'http://localhost/fin/app/usr/closeBrowser.htm', 0 )
Insert into M_ENV_ENVIRONMENTS values(2, 'ii Test (iiT)', '2.02.000', '2.02.000', 840000, 880000, 'http://crothall2.persistech.com/fin/app/usr/closeBrowser.htm', 0 )
Insert into M_ENV_ENVIRONMENTS values(3, 'Crothall Test (CT)', '2.02.000', '2.02.000', 840000, 880000, 'https://finct.crothall.com/closeBrowser.htm', 1 )
Insert into M_ENV_ENVIRONMENTS values(4, 'Crothall Production', '2.02.000', '2.02.000', 840000, 880000, 'https://teamfin.crothall.com/closeBrowser.htm', 0 )

-- UI Security HirNode Updates - HouseCode - End
select * from M_ENV_ENVIRONMENTS
-- Please change default value while updating PRODUCTION.
Insert into M_ENV_ENVIRONMENTS values('2.02.000', '2.02.000', 0, 'http://localhost/fin/app/usr/closeBrowser.htm', 880000, 840000, 'Local Development', 1 )
Insert into M_ENV_ENVIRONMENTS values('2.02.000', '2.02.000', 0, 'http://crothall2.persistech.com/fin/app/usr/closeBrowser.htm', 880000, 840000, 'ii Test (iiT)',2 )
Insert into M_ENV_ENVIRONMENTS values('2.02.000', '2.02.000', 1, 'https://finct.crothall.com/closeBrowser.htm', 880000, 840000, 'Crothall Test (CT)', 3)
Insert into M_ENV_ENVIRONMENTS values('2.02.000', '2.02.000', 0, 'https://teamfin.crothall.com/closeBrowser.htm', 880000, 840000, 'Crothall Production', 4)


-- Import Employees Menu Insert Starts
Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Import Employees', 'Import Employees', 'Import Employees', 64, 1, '\crothall\chimes\fin\Setup\Import Employees', 'crothall', 'chimes', 'fin', 'Setup', 'Import Employees', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Import Employees'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Import Employees', 'Import Employees', 1, 808, 'impe', '/fin/emp/employeeImport/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Import Employees Menu Insert Ends

-- Import Housecodes Menu Insert Starts
Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Import HouseCode', 'Import House Codes', 'Import House Codes', 65, 1, '\crothall\chimes\fin\HouseCodeSetup\Import House Codes', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Import House Codes', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Import House Codes'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Import HouseCode', 'Import House Codes', 1, 705, 'imphc', '/fin/hcm/houseCodeImport/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Import Housecodes Menu Insert Ends

Add the following key in app-->act-->web.config file.
<add key="TempFilePath" value="D:\Build\js\crothall\chimes\fin\temp\" />

	<system.web>
		<compilation debug="true" />
		<authentication mode="Windows" />
		<authorization>
			<deny users="?"/>
		</authorization>
		<identity impersonate="true" />

		<httpModules>
			<add name="SpringModule" type="Spring.Context.Support.WebSupportModule, Spring.Web"/>
		</httpModules>
		<httpHandlers>
			<add verb="*" path="*.aspx" type="Spring.Web.Support.PageHandlerFactory, Spring.Web"/>
		</httpHandlers> 
	</system.web>
	
	<system.webServer>
		<validation validateIntegratedModeConfiguration="false"/>

		<modules>
			<add name="SpringModule" preCondition="integratedMode" type="Spring.Context.Support.WebSupportModule, Spring.Web"/>
		</modules>

		<handlers>
			<add name="SpringPageHandler" verb="*" path="*.aspx" preCondition="integratedMode" type="Spring.Web.Support.PageHandlerFactory, Spring.Web"/>
		</handlers>
	</system.webServer>

	<spring>
		<parsers>
			<parser type="Spring.Data.Config.DatabaseNamespaceParser, Spring.Data"/>
			<parser type="Spring.Transaction.Config.TxNamespaceParser, Spring.Data"/>
		</parsers>

		<context>
			<resource uri="config://spring/objects"/>
			<resource uri="~/config/spring-objects.xml"/>
			<resource uri="~/config/spring-persistence.xml"/>
		</context>

		<objects xmlns="http://www.springframework.net"/>
	</spring>

Add the following key in emp-->act-->web.config file.
<add key="FinAppPath" value="/net/crothall/chimes/fin/app/act/provider.aspx?moduleId=app" />
<add key="TempFilePath" value="D:\Build\js\crothall\chimes\fin\temp\" />

Add the following key in hcm-->act-->web.config file.
<add key="TempFilePath" value="D:\Build\js\crothall\chimes\fin\temp\" />
<add key="FinAppPath" value="/net/crothall/chimes/fin/app/act/provider.aspx?moduleId=app" />

ALTER TABLE [dbo].[RevInvoices] ADD RevInvNotes VARCHAR(1024) NULL

Add "WorkOrderBackDays" variable to AppSystemVariables table.

-- Update script to create Security Hirnodes posted by Kishor on 24 Apr 2011
****
Select * from hirnodes 
where hirnodfullpath like '%\gateway%' or hirnodfullpath like '%jde companies%'
order by hirnodfullpath

Delete hirnodes where hirnode in (14639,14640,14885)
Delete approlenodes where hirnode in (14639,14640,14885)
Delete hirgroupnodes where hirnode in (14639,14640,14885)

****
-- Last CT updated on May 5 2011
-- ** Next Release - 2.02.002


****
-- Last CT updated on May 24 2011
-- ** Next Release - 2.02.003

--Employees\Search
		Delete from hirgroupnodes where hirnode in (select hirnode from hirnodes where hirnodfullpath = '\crothall\chimes\fin\Setup\Employees\SalariedOnly')
		Delete from approlenodes where hirnode in (select hirnode from hirnodes where hirnodfullpath = '\crothall\chimes\fin\Setup\Employees\SalariedOnly')
		Delete from hirnodes where hirnodfullpath = '\crothall\chimes\fin\Setup\Employees\SalariedOnly'

		Insert Into HirNodeSecuritySetupSources
		values('search', 'Search', 'search', 1, 9, '\crothall\chimes\fin\Setup\Employees', @HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('hourly', 'Hourly', 'hourly', 1, 9, '\crothall\chimes\fin\Setup\Employees\Search', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('salaried', 'Salaried', 'salaried', 1, 9, '\crothall\chimes\fin\Setup\Employees\Search', (-@@Identity)+@HirNodeIdentity)


****
-- Last CT updated on June 8 2011
-- ** Next Release - 2.02.004


-- Add new default (home) menu
Exec AppMenuItemUpdate 
	 2 --@MenuAction Int
	, 3 --@MenuState Int
	,'/fin/app/usr/welcome.htm' --@MenuFilePath varchar(500)
	,0 -- @DisplayOrderMenu Int
	--,0 --@HirNode Int
	,'\crothall\chimes\fin\Home' --@HirNodeParentFullPath varchar(2000)
	,39 --@DisplayOrder Int
	,'Home' --@Brief varchar(16)
	,'Home' --@Title varchar(64) = ''
	,'Home' --@Description varchar(256) = ''


****
-- Last CT updated on June 14 2011
-- ** Next Release - 2.02.005

****
--Update this on production only.. 16-Jun-2011
UPDATE RevInvoiceItems
SET RevInviExportedDate = r.RevInvExportedDate
FROM 
RevInvoiceItems ri INNER JOIN 
RevInvoices r ON
ri.RevInvoice = r.RevInvoice
WHERE 
r.RevInvExported = 1

***

-- Budget security not required for coming production
--Security nodes for Budget module **start ONLY TOBE EXECUTED ON CT. PRODUCTION WE HAVE A CONSOLIDATED SCRIPT
Use esmv2
go

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

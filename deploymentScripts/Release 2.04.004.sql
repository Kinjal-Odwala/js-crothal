--last production update version 2.04.000
--31st August 2011
-- update app\usr\markup.htm for loader-image and application icon path 

select * from m_env_environments

update m_env_environments
	set M_ENV_ENV_APPLICATION_VERSION = '2.04.002'
		,M_ENV_ENV_DATABASE_VERSION = '2.04.002'
        --,M_ENV_ENV_SESSION_WARNING_MSEC = ''
		--,M_ENV_ENV_SESSION_TIMEOUT_MSEC = ''
		--, M_ENV_ENV_Default = 1
where m_env_environment in (1,2,3)

select * from m_env_environments

update m_env_environments
	set M_ENV_ENV_Default = 0
where m_env_environment in ( 2,3,4)

select * from m_env_environments

--next CT update version 2.03.001

--Budget security not required for coming production
--Security nodes for Budget module **check before execution if there preexist
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

--Budgeting\BudgetAdministration\ApproveBudget
      Insert Into HirNodeSecuritySetupSources
      values('approveBudget', 'ApproveBudget', 'approveBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('approve', 'Approve', 'approve', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('reject', 'Reject', 'reject', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)

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


--**Home>Notifications Menu .. Only for PRODUCTION
--
Declare @HirNodeParent Int 
Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\home'
Print @HirNodeParent

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @hirNodeParent
	, 33 -- hirLevel
	, 'Notifications' -- Title
	, 'Notifications' -- Brief
	, 'Notifications' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

Declare @HirNode Int 
Select @HirNode=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\home\notifications'
Print @HirNode

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
           ,3
           ,@HirNode -- Change
           ,'Notifications'
           ,'Notifications'
           ,1
           ,1
           ,'notification'
           ,'/fin/app/notification/usr/markup.htm'
           ,'compass-usa\data conversion'
           ,getdate()
           ,1)

-- add new menu item to admin group
Insert into hirgroupnodes values (@hirnode, 1, 'compass-usa\data conversion', getdate()) 
GO

-- New Menu Ceridian Reports -start

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, 7 -- hirNodeParent
	, 33 -- hirLevel
	, 'CeridianReports' -- Title
	, 'Ceridian Reports' -- Brief
	, 'Ceridian Reports' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go
Declare @HirNode Int
Select @HirNode=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\ceridianreports'
Print @HirNode

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
           (1
           ,4
           ,@HirNode
           ,'Ceridian Reports'
           ,'Ceridian Reports'
           ,1
           ,350
           ,'cerReports'
           ,''
           ,'compass-usa\data conversion'
           ,getdate()
           ,1)
GO


Declare @HirNodeParent Int
Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\ceridianreports'
Print @HirNodeParent

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'AuditReport' -- Title
	, 'Audit Report' -- Brief
	, 'Audit Report' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go
Declare @HirNode Int
Select @HirNode=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\ceridianreports\auditreport'
Print @HirNode

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
           ,@HirNode
           ,'Audit Report'
           ,'Audit Report'
           ,1
           ,351
           ,'audReport'
           ,'/fin/rpt/auditReport/usr/markup.htm?redirectURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_Audit_Report&rs:Command=Render'
           ,'compass-usa\data conversion'
           ,getdate()
           ,1)

Insert into hirgroupnodes (hirnode, hirgroup, hirgronmodby, hirgronmodat) values(@HirNode,1, 'compass-usa\data conversion', getdate())

Go


Declare @HirNodeParent Int
Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup'
Print @HirNodeParent

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'Ad-HocReport' -- Title
	, 'Ad-Hoc Report' -- Brief
	, 'Ad-Hoc Report' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy


Declare @HirNode Int
Select @HirNode=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup\ad-hocreport'
Print @HirNode

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
           ,@HirNode
           ,'Ad-Hoc Report'
           ,'Ad-Hoc Report'
           ,1
           ,811
           ,'adHocReport'
           ,'/fin/adh/usr/markup.htm'
           ,'compass-usa\data conversion'
           ,getdate()
           ,1)

Insert into hirgroupnodes (hirnode, hirgroup, hirgronmodby, hirgronmodat) values(@HirNode,1, 'compass-usa\data conversion', getdate())


Declare @HirNodeParent Int
Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\reports'
Print @HirNodeParent

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'Ad-Hoc' -- Title
	, 'Ad-Hoc' -- Brief
	, 'Ad-Hoc' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy


Declare @HirNode Int
Select @HirNode=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\reports\ad-hoc'
Print @HirNode

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
           ,@HirNode
           ,'Ad-Hoc'
           ,'Ad-Hoc'
           ,1
           ,752
           ,'adHoc'
           ,'/fin/adh/report/usr/markup.htm'
           ,'compass-usa\data conversion'
           ,getdate()
           ,1)

Insert into hirgroupnodes (hirnode, hirgroup, hirgronmodby, hirgronmodat) values(@HirNode,1, 'compass-usa\data conversion', getdate())

-- New Menu -end

-- Price Update Menu Insert [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Price Update', 'Price Update', 'Price Update', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PriceUpdate', 'crothall', 'chimes', 'fin', 'Purchasing', 'PriceUpdate', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PriceUpdate'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Price Update', 'Item Price Update', 1, 405, 'itpu', '/fin/pur/itemPriceUpdate/usr/markup.htm', 'Compass-USA\Data Conversion', GetDate(), 1)

-- Price Update Menu Insert [End]

Create "Item Price Update" Scheduled Job to update the catalog items price.

--CT deployed on 21st Sept 2011 Version 2.04.001

--Index update for production only
Drop Index PK_AppJDEGLTransactions On AppJDEGLTransactions 
Drop Index PK_EmpI9Types On EmpI9Types 
Drop Index PK_EmpJobEndReasonType  On EmpJobEndReasonTypes 
Drop Index PK_EmpJobStartReasonType  On EmpJobStartReasonTypes 
Drop Index PK_EmpLocalTaxAdjustmentState  On EmpLocalTaxAdjustmentStates 
Drop Index PK_EmpLocalTaxAdjustmentType  On EmpLocalTaxAdjustmentTypes 
Drop Index PK_EmpLocalTaxCodePayrollCompanyState  On EmpLocalTaxCodePayrollCompanyStates 
Drop Index PK_EmpMaritalStatusFederalTaxType  On EmpMaritalStatusFederalTaxTypes 
Drop Index PK_HcmInvoiceLogoType  On HcmInvoiceLogoTypes 
Drop Index PK_RevAccountReceivablePaidImport  On RevAccountReceivablePaidImports 
Drop Index PK_RevOtherRevenue  On RevOtherRevenues 
--Index update for production only

--Security nodes for Housecode>Statistics modules new field **start
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
Select max(hirnode) from Hirnodes --16088
Truncate table HirNodeSecuritySetupSources 
--Delete From HirNodes Where HirNode > 16088  And HirLevel = 9 And HirHierarchy = 1
--select top 500 * From HirNodes Where HirNode > 16090 And HirLevel = 9 And HirHierarchy = 1 order by hirNodDisplayOrder desc --Where HirNode > 14393
select top 500 * From HirNodes Where HirNodfullpath like '%fin\housec%'
*/

Truncate table HirNodeSecuritySetupSources 

Declare @HirNodeIdentity Int
Select @HirNodeIdentity = Max(HirNode) From Esmv2.dbo.HirNodes
Set @HirNodeIdentity = @HirNodeIdentity + 1
Print @HirNodeIdentity

--MgmtFeeTerminatedHourlyEmployees
      Insert Into HirNodeSecuritySetupSources
      values('MFTermHourlyEmp', 'MgmtFeeTerminatedHourlyEmployees', 'MgmtFeeTerminatedHourlyEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', @HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTerminatedHourlyEmployees', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTerminatedHourlyEmployees', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeActiveHourlyEmployees
      Insert Into HirNodeSecuritySetupSources
      values('MFActivHourlyEmp', 'MgmtFeeActiveHourlyEmployees', 'MgmtFeeActiveHourlyEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeActiveHourlyEmployees', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeActiveHourlyEmployees', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalProductiveLaborHoursWorked
      Insert Into HirNodeSecuritySetupSources
      values('MFTPrdLabHrsWked', 'MgmtFeeTotalProductiveLaborHoursWorked', 'MgmtFeeTotalProductiveLaborHoursWorked', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalProductiveLaborHoursWorked', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalProductiveLaborHoursWorked', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalNonProductiveLaborHours
      Insert Into HirNodeSecuritySetupSources
      values('MFeeTNPrdLabHrs', 'MgmtFeeTotalNonProductiveLaborHours', 'MgmtFeeTotalNonProductiveLaborHours', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalNonProductiveLaborHours', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalNonProductiveLaborHours', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalProductiveLaborDollarsPaid
      Insert Into HirNodeSecuritySetupSources
      values('MFTPrdLbrDolPd', 'MgmtFeeTotalProductiveLaborDollarsPaid', 'MgmtFeeTotalProductiveLaborDollarsPaid', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)

--MgmtFeeTotalNonProductiveLaborDollarsPaid
      Insert Into HirNodeSecuritySetupSources
      values('MFTNPrdLbrDolPd', 'MgmtFeeTotalNonProductiveLaborDollarsPaid', 'MgmtFeeTotalNonProductiveLaborDollarsPaid', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalNonProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\MgmtFeeTotalNonProductiveLaborDollarsPaid', (-@@Identity)+@HirNodeIdentity)

--HospitalPaidJanitorialPaperPlasticSupplyCost
      Insert Into HirNodeSecuritySetupSources
      values('HplPaidJanCost', 'HospitalPaidJanitorialPaperPlasticSupplyCost', 'HospitalPaidJanitorialPaperPlasticSupplyCost', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\HospitalPaidJanitorialPaperPlasticSupplyCost', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabStatistics\HospitalPaidJanitorialPaperPlasticSupplyCost', (-@@Identity)+@HirNodeIdentity)

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
--Security nodes for Housecode>Statistics module **end

-----Adh Report Web Config Update-------Start---localhost will change accourding to server --

		<add key="ESMAppPath" value="/net/ii/framework/esm/app/act/provider.aspx?moduleId=app" />
		<add key="ESMServer" value="http://localhost" />
		<add key="ESMAppPath" value="/net/ii/framework/esm/app/act/provider.aspx?moduleId=app" />
		<add key="ESMHirPath" value="/net/ii/framework/esm/hir/act/provider.aspx?moduleId=hir" />

		<add key="FinServer" value="http://localhost" />
		<add key="FinAppPath" value="/net/crothall/chimes/fin/app/act/provider.aspx?moduleId=app" />
		<add key="FinHcmPath" value="/net/crothall/chimes/fin/hcm/act/provider.aspx?moduleId=hcm" />

		<add key="TempFilePath" value="D:\Build\js\crothall\chimes\fin\temp\" />
		<add key="ExcelTemplateFilePath" value="D:\Build\js\crothall\chimes\fin\adh\report\usr\" />

-----Adh Report Web Config Update--------End----

--CT updated on 21st Oct

Update AppModuleColumns table with new House Code columns. Use script saved on documents.


-- 08 - 11 - 2011
-- Hiding the "None" value in EmpMaritalStatusStateTaxTypes and associate table
Update EmpMaritalStatusStateTaxTypes Set EmpMarssttActive = 0 Where EmpMaritalStatusStateTaxType =32


-- Security from Employee Wizard field - originalDate, seniorityDate


Use Esmv2
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


--Delete From HirNodes Where HirNode > 16589

--employees\wizard\edit
		Insert Into HirNodeSecuritySetupSources
		values('employee', 'Employee', 'employee', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit', (@HirNodeIdentity)
   
--wizard\edit\employee
		Insert Into HirNodeSecuritySetupSources
		values('originalDate', 'OriginalDate', 'originalDate', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\originalDate', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\originalDate', (-@@Identity)+@HirNodeIdentity)

--wizard\edit\employee
		Insert Into HirNodeSecuritySetupSources
		values('seniorityDate', 'SeniorityDate', 'seniorityDate', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\seniorityDate', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\seniorityDate', (-@@Identity)+@HirNodeIdentity)

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

--CT updated on 10th Nov

Update Esmv2..m_env_environments Set M_Env_Env_Session_Warning_Msec = 40000 Where M_Env_Env_Default = 1

-- setup IIS (production) to have application redirect html.

--CT updated on 21st Nov

Ad-Hoc Report, type table FK updated manually by Kishor. chk email.

-- Production Manual update [Begin]
-- Copy the following dll, js and css files from CT to Production

js/crothall/chimes/fin/config.js
js/crothall/chimes/fin/emp/employeeGeneral/usr/main.js
js/crothall/chimes/fin/emp/employeeSearch/usr/main.js
js/crothall/chimes/fin/emp/employeeSearch/usr/defs.js

js/crothall/chimes/fin/fsc/fiscalPattern/usr/style.css
js/crothall/chimes/fin/fsc/jdeCompany/usr/style.css

net/crothall/chimes/fin/emp/act/bin/crothall.chimes.fin.emp.act.dll
net/crothall/chimes/fin/emp/act/bin/crothall.chimes.fin.emp.dom.dll
net/crothall/chimes/fin/emp/act/bin/crothall.chimes.fin.emp.srv.dll
net/crothall/chimes/fin/emp/act/bin/crothall.chimes.fin.cmn.rep.dll

-- Stored Procedures
EmpEmpoyeeSearchSelect
PayEmployeeWeeklyPayrollCount
PayEmployeeWeeklyPayrollSelect

-- Production Manual update [End]






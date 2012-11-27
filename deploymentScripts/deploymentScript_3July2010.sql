last CT deployment - 26 June
last CT deployment - 2 july

esm\ppl\act\web.config

  <appSettings>
    <add key="ESMServer" value="" />
    <add key="ESMAppPath" value="/net/ii/framework/esm/app/act/provider.aspx?moduleId=app" />
    <add key="ESMHirPath" value="/net/ii/framework/esm/hir/act/provider.aspx?moduleId=hir" />
    <add key="ESMServerUserName" value="" />
    <add key="ESMServerPassword" value="" />
  </appSettings>


-- Kishor
get updates related to EmpStatusTypes, and EmpStatusCategoryTypes from deploymentScript_1Sept2009.sql

-- Update Person HouseCode (hirNode) using EmpEmployeeGeneral HcmHouseCode -- by Anis

Set NoCount On
Declare @HcmHouseCode Int, @PplPerson Int, @HirNode Int

Declare tmpCur Cursor For 
	Select HcmHouseCode, PplPerson From Teamfinv2.dbo.EmpEmployeeGenerals
		Where HcmHouseCode Is Not Null
Open tmpCur
While 1=1
Begin
	Fetch Next From tmpCUr Into @HcmHouseCode, @PplPerson
	If @@Fetch_Status <> 0 Break
	
	Select @HirNode = HirNode From Esmv2.dbo.AppUnits Where AppUnit =
		(Select AppUnit From TeamfinV2.dbo.HcmHouseCodes Where HcmHouseCode = @HcmHouseCode)

	--Print @HcmHouseCode
	--Print @PplPerson
	--Print @HirNode
	
	If @PplPerson > 0
		Update Esmv2.dbo.PplPeople Set HirNode = @HirNode Where PplPerson = @PplPerson
End

Close tmpCur
Deallocate tmpCur

-- HouseCode (hirNode)

Alter Table Esmv2.dbo.PplPeople Add PplPeoEmployeeHouseCodeUpdated Bit

--Management group type no more required on SEcurity
Update Esmv2.dbo.HirGroupTypes
Set hirGrotActive = 0 
Where HirGroupType = 2 And HirGrotTitle = 'Management'

Select * from Esmv2.dbo.HirGroups Where HirGroupType = 2
--Do we need to delete Management(GroupType) Groups which are already defined
--Delete * from Esmv2.dbo.HirGroups Where HirGroupType = 2


-- Remove additional Default or [None] HcmJobs
-- if there are more than one job for each housecode
Declare @HcmHouseCode Int, @Count Int

Declare tmpCur Cursor For Select HcmHouseCode from HcmHouseCodeJobs
Open tmpCur
While 1=1
Begin
	Fetch next from tmpCur into @HcmHouseCode
	If @@Fetch_Status <> 0 Break
	
	Select @Count = Count(*) From HcmHouseCodeJobs Where HcmHouseCode = @HcmHouseCode
	if(@Count > 1)
		--Select * From HcmHouseCodeJobs Where HcmHouseCode = @HcmHouseCode And HcmJob = (Select HcmJob From HcmJobs Where HcmJobTitle = '[None]')
		--Delete From HcmHouseCodeJobs Where HcmHouseCode = @HcmHouseCode And HcmJob = (Select HcmJob From HcmJobs Where HcmJobTitle = '[None]')
		Delete From HcmHouseCodeJobs Where HcmHouseCode = @HcmHouseCode And HcmJob = (Select HcmJob From HcmJobs Where HcmJobTitle = 'Default')
	
End
Close tmpCur
Deallocate tmpCur
-- Remove additional HcmJobs


-- add new menu Report under Setup.. this may change
--Select * from Esmv2.dbo.hirNodes where hirnodfullpath like '%setup%'
--Select * from [Esmv2].[dbo].[AppMenuItems] where AppMeniDisplayOrder >=800

EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, 2050, 33, 
	'Report', 'Report', 'Report', 0, 1, 'persistech\data conversion'

Go

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
           ,2190
           ,'Report'
           ,'Report'
           ,1
           ,804
           ,'rpt'
           ,'/fin/rpt/report/usr/markup.htm'
           ,'persistech\anis shikalgar'
           , getdate()
           ,1)
GO

-- Report menu

-- HcmJobTypes records
Insert Into HcmJobTypes	(HcmJobtBrief, HcmJobtTitle, HcmJobtDescription, HcmJobtDisplayOrder, HcmJobtActive, HcmJobtModBy, HcmJobtModAt)
Values ('Service Line', 'Service Line', 'Service Line', 1, 1, 'compass-usa\data conversion', GetDate())

Insert Into HcmJobTypes	(HcmJobtBrief, HcmJobtTitle, HcmJobtDescription, HcmJobtDisplayOrder, HcmJobtActive, HcmJobtModBy, HcmJobtModAt)
Values ('Service Location', 'Service Location', 'Service Location', 2, 1, 'compass-usa\data conversion', GetDate())

Insert Into HcmJobTypes	(HcmJobtBrief, HcmJobtTitle, HcmJobtDescription, HcmJobtDisplayOrder, HcmJobtActive, HcmJobtModBy, HcmJobtModAt)
Values ('Customer', 'Customer', 'Customer', 3, 1, 'compass-usa\data conversion', GetDate())

-- HcmJobTypes

-- Service Line column changes starts

ALTER TABLE [dbo].[PayPayrollCompanies]
DROP COLUMN PayServiceLine

DROP TABLE [dbo].[PayServiceLines]

-- Service Line column changes ends


-- Budgeting Administration Menu Insert Starts

Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Administration', 'Budget Administration', 'Budget Administration', Null, 1, '\crothall\chimes\fin\Budgeting\Budget Administration', 'crothall', 'chimes', 'fin', 'Budgeting', 'Budget Administration', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\Budget Administration'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Administration', 'Budget Administration', 1, 104, 'adm', '/fin/bud/administrationMaster/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Budgeting Administration Menu Insert Ends

-- Web.config file changes begins

Add "http://" to the ESMServer and FinServer key values.

FIN Modules - app, bud, emp, glm, hcm, pay, per, rev

	<add key="ESMServer" value="http://" />
	<add key="FinServer" value="http://" /> 

ESM Modules – app, ppl

	<add key="ESMServer" value="http://" />

-- Web.config file changes ends
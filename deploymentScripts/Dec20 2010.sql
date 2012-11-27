--last production update
--19th Dec 2010

/* Updates to security hierarchy .. nodes added Read, Write, etc.

Exec [HirNodeAuthorizationSelect] 'surisoft\anis', '\crothall\chimes\fin\setup\employees'
Select * from hirnodes where hirnodfullpath like '%\crothall\chimes\fin\fiscal\jde companies%'
Select * from hirnodes where hirnodfullpath like '%ssnreadonly%'
Select * from hirnodes where hirnodfullpath like '\crothall\chimes\fin\setup\employees%'
update hirnodes set hirlevel=9 where hirnode = 1212
*/

Declare @HirNodeParent Int
--Select * from Esmv2.dbo.hirnodes where hirnodfullpath = '\crothall\chimes\fin\fiscal\jde companies'
Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = '\crothall\chimes\fin\fiscal\jde companies'
Print @HirNodeParent

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 9 -- hirLevel
	, 'Read' -- Title
	, 'Read' -- Brief
	, 'Read' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 9 -- hirLevel
	, 'Write' -- Title
	, 'Write' -- Brief
	, 'Write' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

Declare @HirNodeParent Int
--Select * from Esmv2.dbo.hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup\employees'
Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup\employees'
Print @HirNodeParent

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 9 -- hirLevel
	, 'Read' -- Title
	, 'Read' -- Brief
	, 'Read' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 9 -- hirLevel
	, 'Read SSN' -- Title
	, 'Read SSN' -- Brief
	, 'Read SSN' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 9 -- hirLevel
	, 'Write' -- Title
	, 'Write' -- Brief
	, 'Write' -- Description
	, 0 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

--** also update the script to update hirNodes for Employee security.. IMMMMMMMMMMMPPPPPPPPPPPPPPPPPPPPP

------------

Declare @HirNodeParent Int
--Select * from Esmv2.dbo.hirnodes where hirnodfullpath like '\crothall\chimes\fin\Accounts Receivable'
--Select * from esmv2.dbo.appmenuitems where appmenidisplayorder between 500 and 505 order by appmenidisplayorder
--update esmv2.dbo.appmenuitems set appmenidisplayorder = 502 where appmenuitem = 51
--update esmv2.dbo.appmenuitems set appmenidisplayorder = 503 where appmenuitem = 75
--update esmv2.dbo.appmenuitems set appmenidisplayorder = 504 where appmenuitem = 73
Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath like '\crothall\chimes\fin\Accounts Receivable'

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'Invoice Search' -- Title
	, 'Invoice Search' -- Brief
	, 'Invoice Search' -- Description
	, 58 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

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
           , 13641 --@HirNodeParent -- Change
           ,'Invoice Search'
           ,'Invoice Search'
           ,1
           ,501
           ,'rpt'
           ,'/fin/rev/invoiceSearch/usr/markup.htm'
           ,'compass-usa\data conversion'
           , getdate()
           ,1)
GO


--delete from hirnodes where hirnode = 1212 -- remove SSN READONLY node
--delete from hirgroupnodes where hirnode = 1212


--- Update HirNode column in all Transaction Tables

Declare @TableName as varchar(50)
Declare @SqlQ As varchar(2000)

Declare TmpCur Cursor For

Select  Sys.Tables.[name] from Sys.Tables 
Inner Join  Sys.Columns on Sys.Tables.object_id = Sys.Columns.object_id 
Where Sys.Columns.[Name] = 'hcmHouseCode'-- And Sys.Tables.[name] like '%app%'
order By Sys.Tables.[name]

Open TmpCur
While(1=1)
Begin
	Fetch Next From TmpCur Into @TableName
	If @@Fetch_Status <> 0 Break
	
	Set @SqlQ = 'Alter Table ' + @TableName  + ' Add HirNode Int '
	Exec (@SqlQ)
	print @TableName

End
Close TmpCur
Deallocate TmpCur

--*** Update HirNode (Mass update because of addition of HIRNODE on all transaction tables)

Declare @TableName as varchar(50), @SqlQry1 as Varchar(200), @SqlQry2 as Varchar(200)
Declare @SqlQ As varchar(2000)
Declare @vendor_id Int, @MaxId Int, @HirNode varchar(20), @HcmHouseCode varchar(20)


Declare TmpCur Cursor For
	Select  Sys.Tables.[name]--,* 
	From Sys.Tables 
	Inner Join  Sys.Columns on Sys.Tables.object_id = Sys.Columns.object_id 
	Where Sys.Columns.[Name] = 'hcmHouseCode'-- And Sys.Tables.[name] like '%app%'
	order By Sys.Tables.[name]

Open TmpCur
While(1=1)
Begin
	Fetch Next From TmpCur Into @TableName
	If @@Fetch_Status <> 0 Break
	
	Set @SqlQry1 =  'Declare  TmpCurHcm CURSOR FOR 
			Select Distinct(HcmHouseCode) From '+@TableName	
	exec (@SqlQry1) 
	print @SqlQry1

	OPEN TmpCurHcm 			
		FETCH NEXT FROM TmpCurHcm INTO @HcmHouseCode
		WHILE @@FETCH_STATUS = 0 
		BEGIN 
			print 'hcmHousecode'
			Print @HcmHouseCode
			Select @HirNode = au.HirNode From EsmV2.dbo.AppUnits au
			Inner Join HcmHouseCodes hhc On au.AppUnit = hhc.AppUnit
			Where hhc.HcmHouseCode = @HcmHouseCode

			Set @SqlQry2 =  'Update ' + @TableName + ' Set HirNode = ' + @HirNode + ' Where HcmHouseCode = ' + @HcmHouseCode
			Exec(@SqlQry2)
			Print 'HirNode'
			Print  @HirNode
			FETCH NEXT FROM TmpCurHcm INTO @HcmHouseCode 			
		END 
	CLOSE TmpCurHcm 
	DEALLOCATE TmpCurHcm
print @TableName

End
Close TmpCur
Deallocate TmpCur
------------------------------ PayrollHirNode Update in PayEmployeeWeeklyPayrolls Table
Declare @PayrollHcmHouseCode as varchar(50), @SqlQry1 as Varchar(200)
Declare @HirNode varchar(20), @HcmHouseCode varchar(20)


Declare TmpCur Cursor For
      Select  PayrollHcmHouseCode
      From PayEmployeeWeeklyPayrolls      
      order By PayEmployeeWeeklyPayroll

Open TmpCur
While(1=1)
Begin
      Fetch Next From TmpCur Into @PayrollHcmHouseCode
      If @@Fetch_Status <> 0 Break
            
                  print 'PayrollHcmHouseCode'
                  Print @PayrollHcmHouseCode
                  Select @HirNode = au.HirNode From EsmV2.dbo.AppUnits au
                  Inner Join HcmHouseCodes hhc On au.AppUnit = hhc.AppUnit
                  Where hhc.HcmHouseCode = @PayrollHcmHouseCode

                  Set @SqlQry1 =  'Update PayEmployeeWeeklyPayrolls Set PayrollHirNode = ' + @HirNode + ' Where PayrollHcmHouseCode = ' + @PayrollHcmHouseCode
                  Exec(@SqlQry1)
                  Print 'HirNode'
                  Print  @HirNode
            
print @PayrollHcmHouseCode

End
Close TmpCur
Deallocate TmpCur

---**************************************************************************** CT Updated on 18Feb2011

-- Begin Remove the Weekly Menu Item
Select * From EsmV2.dbo.AppMenuItems Where AppMeniTitle = 'Weekly'
Select * From EsmV2.dbo.HirNodes Where HirNodTitle = 'Weekly'

Delete From EsmV2.dbo.AppMenuItems Where AppMeniTitle = 'Weekly'
Delete From EsmV2.dbo.HirNodes Where HirNodTitle = 'Weekly'
-- End Remove the Weekly Menu Item

-- Begin Rearrange the Dispaly Order of Payroll Menu Items
Select * From EsmV2.dbo.AppMenuItems Where AppMeniActionData = '/fin/pay/payCalendar/usr/markup.htm'
Select * From EsmV2.dbo.AppMenuItems Where AppMeniTitle = 'Ceridian Companies'
Select * From EsmV2.dbo.AppMenuItems Where AppMeniTitle = 'Payroll Processing'
Select * From EsmV2.dbo.AppMenuItems Where AppMeniTitle = 'Salary & Wages'

Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 301 Where AppMeniActionData = '/fin/pay/payCalendar/usr/markup.htm'
Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 302 Where AppMeniTitle = 'Ceridian Companies'
Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 303 Where AppMeniTitle = 'Payroll Processing'
Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 304 Where AppMeniTitle = 'Salary & Wages'
-- End Rearrange the Dispaly Order of Payroll Menu Items

---*********///////// CT Updated on 25Feb2011

Update Hirnodes table with Employee security nodes. -- IMP


-- Epay Scheduler Menu
use esmv2
go
Declare @HirNodeParent Int
--Select * from Esmv2.dbo.hirnodes where hirlevel=33 and hirnodfullpath like '\crothall\chimes\fin\setup%'
Select @HirNodeParent = HirNode from hirnodes where hirlevel=33 and hirnodfullpath like '\crothall\chimes\fin\setup'

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'Epay Scheduler' -- Title
	, 'Epay Scheduler' -- Brief
	, 'Epay Scheduler' -- Description
	, 74 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

--select * from [Esmv2].[dbo].[AppMenuItems] where hirnode in (Select hirnode from Esmv2.dbo.hirnodes where hirlevel=33 and hirnodfullpath like '\crothall\chimes\fin\setup%')
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
           , 13185--@HirNodeParent -- Change
           ,'Epay Scheduler'
           ,'Epay Scheduler'
           ,1
           ,807
           ,'epms'
           ,'/fin/epm/epayscheduler/usr/markup.htm'
           ,'compass-usa\data conversion'
           , getdate()
           ,1)
GO

-- Epay sch menu

-- Begin purchasing catalog changes
ALTER TABLE [dbo].[PurCatalogHouseCodes] ADD PurCathcActive BIT NULL
UPDATE dbo.PurCatalogHouseCodes SET PurCathcActive = 1

Add the following key in pur-->act-->web.config file.
<add key="TempFilePath" value="D:\Build\js\crothall\chimes\fin\temp\" />
<add key="ExcelTemplateFilePath" value="D:\Build\js\crothall\chimes\fin\pur\catalog\usr\" />
-- End purchasing catalog changes

---*********///////// CT Updated on 04Mar2011

Window Service app.Config..

<add key="JDEImportLogFile" value="C:/build/js/crothall/chimes/fin/Inbound/backup/"/>
<add key="JDENotificationEmail" value="alert@crothall.com,alert2@crothall.com"/>
<add key="JDEImportMaxLine" value="1000"/>
<add key="JDENotifySuccess" value="Y"/>

--** CT update on 21 March

select * from appmenuitems where appmeniactiondata = '/fin/pay/processing/usr/markup.htm' and appmenibrief = 'payroll process'
select * from hirnodes where hirnodfullpath = '\crothall\chimes\fin\Payroll\Payroll Processing' and hirnodbrief = 'payroll process'
delete from appmenuitems where appmeniactiondata = '/fin/pay/processing/usr/markup.htm' and appmenibrief = 'payroll process'
delete from hirnodes where hirnodfullpath = '\crothall\chimes\fin\Payroll\Payroll Processing' and hirnodbrief = 'payroll process'

--**

Add following key to bud > act > web.config RAYMOND

<add key="FinSMTPServer" value="NET-COLAB-AZ1.persistech.com" />
<add key="FinSenderEmail" value="anis.shikalgar@iicorporate.com" />
<add key="FinAccountsDepartmentEmail" value="anis.shikalgar@iicorporate.com" />

--** CT updated 23 March 2011

Add the following key in app-->act-->web.config file.
<add key="FinWomPath" value="/net/crothall/chimes/fin/wom/act/provider.aspx?moduleId=wom" />

Add the following key in rev-->act-->web.config file.
<add key="BulkImportFilePath" value="D:\Build\js\crothall\chimes\fin\bulkInvoiceImport\" />
<add key="ExcelTemplateFilePath" value="D:\Build\js\crothall\chimes\fin\rev\bulkInvoiceImport\usr\" />

Insert Into dbo.WomWorkOrderTasks(WomwotBrief, WomwotTitle, WomwotDescription, WomwotDisplayOrder, WomwotActive, WomwotModBy, WomwotModAt)
Values ('Budgeted Hours', 'Budgeted Hours', 'Budgeted Hours', 1, 1, 'Persistech\Data Conversion', GetDate())

Insert Into dbo.WomWorkOrderTasks(WomwotBrief, WomwotTitle, WomwotDescription, WomwotDisplayOrder, WomwotActive, WomwotModBy, WomwotModAt)
Values ('Flat Rate', 'Flat Rate', 'Flat Rate', 2, 1, 'Persistech\Data Conversion', GetDate())

Insert Into dbo.AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
Values (7, '6', 'Pending Approval', 'Pending Approval', 1, 1, 'Persistech\Data Conversion', GetDate())

Insert Into dbo.AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
Values (8, '7', 'Approved', 'Approved', 1, 1, 'Persistech\Data Conversion', GetDate())

Insert Into dbo.AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
Values (9, '8', 'Completed', 'Completed', 1, 1, 'Persistech\Data Conversion', GetDate())

--Starting Work Order

Insert Into AppSystemVariables (AppSysVariableName, AppSysVariableValue, AppSysModBy, AppSysModAt)
Values ('StartingWorkOrderNumber', '100000', 'compass-usa\data conversion', GetDate())

--Starting Work Order

Copy the HcmJobTypes table data

-- Employee Number Range 
update AppSystemVariables set AppSysVariableName = 'CrothallEmployeeNumberMin' where AppSystemVariable = 7
update AppSystemVariables set AppSysVariableName = 'CrothallEmployeeNumberMax' where AppSystemVariable = 8

/*Insert into AppSystemVariables(AppSysVariableName, AppSysVariableValue, AppSysActive, AppSysModBy, AppSysModAt) 
	Values('CrothallEmployeeNumberMin', 300001, 1, 'compass-usa\data conversion', getdate())

Insert into AppSystemVariables(AppSysVariableName, AppSysVariableValue, AppSysActive, AppSysModBy, AppSysModAt) 
	Values('CrothallEmployeeNumberMax', 599999, 1, 'compass-usa\data conversion', getdate())
*/

Insert into AppSystemVariables(AppSysVariableName, AppSysVariableValue, AppSysActive, AppSysModBy, AppSysModAt) 
	Values('NonCrothallEmployeeNumberMin', 100001, 1, 'compass-usa\data conversion', getdate())

Insert into AppSystemVariables(AppSysVariableName, AppSysVariableValue, AppSysActive, AppSysModBy, AppSysModAt) 
	Values('NonCrothallEmployeeNumberMax', 199999, 1, 'compass-usa\data conversion', getdate())

-- default houseCode Jobs

/*
Select * from [Teamfinv2].[dbo].HcmJobs
Select * from [Teamfinv2].[dbo].HcmHouseCodeJobs
--Truncate Table [Teamfinv2].[dbo].HcmJobs
--Truncate Table [Teamfinv2].[dbo].HcmHouseCodeJobs
*/

Use Teamfinv2
Go

Set NoCount ON

Declare @HcmHouseCode Int
, @HcmHouseCodeJob Int
, @HcmJob Int

/*If Exists(Select [HcmJobTitle] From [Teamfinv2].[dbo].[HcmJobs] Where [HcmJobTitle] = '[None]')
Begin
	Select 
		@HcmJob = [HcmJob] 
	From 
		[Teamfinv2].[dbo].[HcmJobs] 
	Where 
		[HcmJobTitle] = '[None]'
End
Else
Begin*/
	Insert Into 
		[Teamfinv2].[dbo].[HcmJobs]([FscJDEJobCode],[HcmJobBrief],[HcmJobTitle],[HcmJobDescription],[HcmJobDisplayOrder],[HcmJobActive],[HcmJobModBy],[HcmJobModAt],[HcmJobType])
	Values
		(0, '0000', '[None]', '[None]', 0,1, 'compass-usa\data conversion', GetDate(), 1)
		
	Set @HcmJob = @@Identity
--End

Declare tmpCur Cursor For 
	Select 
		HcmHouseCode 
	From 
		[Teamfinv2].[dbo].HcmHouseCodes 
	Order By 
		HcmHouseCode

Open tmpCur

While 1=1
Begin

	Fetch Next From tmpCur Into @HcmHouseCode
	If @@Fetch_Status <> 0 Break

	/*If Exists(Select HcmHouseCode From [Teamfinv2].[dbo].HcmHouseCodeJobs Where HcmHouseCode = @HcmHouseCode)
		Select @HcmHouseCodeJob = HcmHouseCodeJob From [Teamfinv2].[dbo].HcmHouseCodeJobs Where HcmHouseCode = @HcmHouseCode
	Else
	Begin*/
		Insert Into 
			[Teamfinv2].[dbo].HcmHouseCodeJobs(HcmHouseCode, HcmJob, HcmHoucjActive, HcmHoucjModBy, HcmHoucjModAt) 
		Values
			(@HcmHouseCode, @HcmJob, 1, 'compass-usa\data conversion',GetDate())
		
		Set @HcmHouseCodeJob = @@Identity
	--End
	
	--Update Employee -- we may need to consider other tables for similar default update of HcmHouseCodeJob.
	Update 
		[Teamfinv2].[dbo].EmpEmployeeGenerals 
	Set 
		HcmHouseCodeJob = @HcmHouseCodeJob
	Where 
		HcmHouseCode = @HcmHouseCode
End
Close tmpCur
Deallocate tmpCur

Go
-- default houseCode Jobs

-- Housecode Invoice Logo

Create Table HcmInvoiceLogoTypes(
	HcmInvoiceLogoType Int Not Null Primary key,
	HcmInvltBrief Varchar(16) Null,
	HcmInvltTitle Varchar(64) Not Null,
	HcmInvltDescription Varchar(256) Null,
	HcmInvltActive Bit Not Null,
	HcmInvltDisplayOrder Int Not Null,
	HcmInvltModBy Varchar(50) Not Null,
	HcmInvltModAt DateTime Not Null
)

Go

Insert Into HcmInvoiceLogoTypes(HcmInvoiceLogoType,HcmInvltTitle,HcmInvltDescription,HcmInvltActive,HcmInvltDisplayOrder,HcmInvltModBy,HcmInvltModAt)
Values(1, 'Crothall', 'Crothall.jpg', 1, 1, 'compass-usa\data conversion',getdate())
Insert Into HcmInvoiceLogoTypes(HcmInvoiceLogoType,HcmInvltTitle,HcmInvltDescription,HcmInvltActive,HcmInvltDisplayOrder,HcmInvltModBy,HcmInvltModAt)
Values(2, 'Eurest', 'Eurest.jpg', 1, 2, 'compass-usa\data conversion',getdate())
Insert Into HcmInvoiceLogoTypes(HcmInvoiceLogoType,HcmInvltTitle,HcmInvltDescription,HcmInvltActive,HcmInvltDisplayOrder,HcmInvltModBy,HcmInvltModAt)
Values(3, 'Thomp', 'Thomp.jpg', 1, 3, 'compass-usa\data conversion',getdate())

Go

Alter TAble HcmHouseCodes Add HcmInvoiceLogoType Int

Go

-- Housecode Invoice Logo -- End

-- EBR Reports
Declare @HirNodeParent Int
--Select * from Esmv2.dbo.hirnodes where hirnodfullpath like '\crothall\chimes\fin\setup%'
Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath like '\crothall\chimes\fin\setup'

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'Reports' -- Title
	, 'Reports' -- Brief
	, 'Reports' -- Description
	, 71 -- DisplayOrder
	, 1 -- Active
	, 'compass-usa\data conversion' -- modBy

Go

Select @HirNodeParent=HirNode from Esmv2.dbo.Hirnodes where hirnodfullpath = '\crothall\chimes\fin\setup\reports'
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
           , @HirNodeParent--10607 -- Change
           ,'Reports'
           ,'Reports'
           ,1
           ,805
           ,'rpt'
           ,'/fin/rpt/report/usr/markup.htm?redirectURL=http://aix.persistech.com/fingateway/app/usr/markup.htm'
           ,'compass-usa\data conversion'
           , getdate()
           ,1)
GO

-- Ebr Reports End


Add the following key in rev-->act-->web.config file.
<add key="FinWomPath" value="/net/crothall/chimes/fin/wom/act/provider.aspx?moduleId=wom" />

Add the following key in wom-->act-->web.config file.
<add key="FinSMTPServer" value="NET-COLAB-AZ1.persistech.com" />
<add key="FinSenderEmail" value="chandru.balekkala@iicorporate.com" />
<add key="WorkOrderApprovalPath" value="http://localhost/fin/wom/workOrder/usr/markup.htm" />
	
EXEC sp_rename 'HcmJobs.HcmJobAddress', 'HcmJobAddress1', 'COLUMN'
ALTER TABLE [dbo].[HcmJobs] ALTER COLUMN HcmJobAddress1 VARCHAR(50)
ALTER TABLE [dbo].[HcmJobs] ADD HcmJobAddress1 VARCHAR(50) NULL
ALTER TABLE [dbo].[HcmJobs] ADD HcmJobContact VARCHAR(50) NULL

EXEC sp_rename 'HcmJobTemplates.HcmJobtAddress', 'HcmJobtAddress1', 'COLUMN'
ALTER TABLE [dbo].[HcmJobTemplates] ALTER COLUMN HcmJobtAddress1 VARCHAR(50)
ALTER TABLE [dbo].[HcmJobTemplates] ADD HcmJobtAddress2 VARCHAR(50) NULL
ALTER TABLE [dbo].[HcmJobTemplates] ADD HcmJobtContact VARCHAR(50) NULL

ALTER TABLE [dbo].[WomWorkOrderTasks] ADD FscAccount INT NULL

DROP TABLE [dbo].[WomWorkOrderTaskAccounts]

ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoAreaManagerEmail VARCHAR(50) NULL
ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoRegionalManagerEmail VARCHAR(50) NULL

Update dbo.WomWorkOrderTasks Set FscAccount = 169 Where WomWorkOrderTask = 1
Update dbo.WomWorkOrderTasks Set FscAccount = 170 Where WomWorkOrderTask = 2

-- Convert Work Order to Invoice Menu Insert Starts
Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\accounts receivable'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'WO to Invoice', 'Convert WO to Invoice', 'Convert WO to Invoice', Null, 1, '\crothall\chimes\fin\Accounts Receivable\Convert WO to Invoice', 'crothall', 'chimes', 'fin', 'Accounts Receivable', 'Convert WO to Invoice', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Accounts Receivable\Convert WO to Invoice'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'WO to Invoice', 'Convert WO to Invoice', 1, 503, 'woti', '/fin/rev/workOrderToInvoice/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Convert Work Order to Invoice Menu Insert Ends

-- 8Nov2010
Update Esmv2.dbo.Appmenuitems Set Appmeniactiondata = '/fin/bud/budgetsummary/usr/markup.htm'
Where Appmenuitem = 35

-- Complete Work Orders Menu Insert Starts

Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Work Orders'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Complete WO', 'Complete Work Orders', 'Complete Work Orders', Null, 1, '\crothall\chimes\fin\Work Orders\Complete Work Orders', 'crothall', 'chimes', 'fin', 'Work Orders', 'Complete Work Orders', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Work Orders\Complete Work Orders'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Complete WO', 'Complete Work Orders', 1, 452, 'cwo', '/fin/wom/completeWorkOrder/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Complete Work Orders Menu Insert Ends
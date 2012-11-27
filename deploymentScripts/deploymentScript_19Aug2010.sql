--Update ii.framework.esm.ppl.act.dll on CT ESM SSL site.

--Use fully qualified names for servers in web.Config files
--example https://192.168.101.206 >> https://finct.crothall.com

-- New menu for Bulk Invoice Import
Declare @HirNodeParent Int
--Select * from hirnodes where hirnodfullpath like '\crothall\chimes\fin\accounts receivable'
Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath like '\crothall\chimes\fin\accounts receivable'

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 33 -- hirLevel
	, 'Bulk Invoice Import' -- Title
	, 'Bulk Import' -- Brief
	, 'Bulk Invoice Import' -- Description
	, 0 -- DisplayOrder
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
           ,HIRNODE --2199 -- Change
           ,'Bulk Import'
           ,'Bulk Invoice Import'
           ,1
           ,502
           ,'blk'
           ,'/fin/rev/bulkInvoiceImport/usr/markup.htm'
           ,'compass-usa\data conversion'
           , getdate()
           ,1)
GO
-- New menu for Bulk Invoice Import

-- Work Orders Menu Insert Starts
Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Work Orders', 'Work Orders', 'Work Orders', Null, 1, '\crothall\chimes\fin\Work Orders', 'crothall', 'chimes', 'fin', 'Work Orders', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Work Orders'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(1, 4, @HirNode, 'Work Orders', 'Work Orders', 1, 450, 'wom', Null, 'Persistech\Data Conversion', GetDate(), 1)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Work Orders'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Work Orders', 'Work Orders', 'Work Orders', Null, 1, '\crothall\chimes\fin\Work Orders\Work Orders', 'crothall', 'chimes', 'fin', 'Work Orders', 'Work Orders', 'Persistech\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Work Orders\Work Orders'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Work Orders', 'Work Orders', 1, 451, 'wrko', '/fin/wom/workOrder/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Work Orders Menu Insert Ends

/*
Add following line in bud-->act-->web.config file with correct key value.

<add key="ExportFilePath" value="" />
*/

-- JobStartChangeReasons Table Alter 17 Sept 2010 Fix item TK-08070 V1-Iteration 58 
--Select * from EmpJobStartReasonTypes
Alter Table EmpJobStartReasonTypes Add EmpJobsrtHouseCodeChange Bit Null
Alter Table EmpJobStartReasonTypes Add EmpJobsrtJobCodeChange Bit Null
Alter Table EmpJobStartReasonTypes Add EmpJobsrtHouseCodeJobCodeChange Bit Null

Update EmpJobStartReasonTypes Set EmpJobsrtHouseCodeChange = 0
Update EmpJobStartReasonTypes Set EmpJobsrtJobCodeChange = 0
Update EmpJobStartReasonTypes Set EmpJobsrtHouseCodeJobCodeChange = 0

Update EmpJobStartReasonTypes Set EmpJobsrtHouseCodeChange = 1 Where EmpJobStartReasonType In (7, 12)
Update EmpJobStartReasonTypes Set EmpJobsrtJobCodeChange = 1 Where EmpJobStartReasonType In (2, 3, 5, 7, 8, 9)
Update EmpJobStartReasonTypes Set EmpJobsrtHouseCodeJobCodeChange = 1 Where EmpJobStartReasonType In (4, 7, 10)
Update EmpJobStartReasonTypes Set EmpJobsrtBrief = left(EmpJobsrtTitle, 16)
--JobStartChangeReasons Table Alter

--EmpRateChangeReasonTypes Table Alter
--Select * from EmpRateChangeReasonTypes
Alter Table EmpRateChangeReasonTypes 
Add EmpRatcrtPayRateChange Bit ,
EmpRatcrtPayRateTypeChange Bit ,
EmpRatcrtPayFrequencyChange Bit ,
EmpRatcrtScheduledHoursIncrease Bit ,
EmpRatcrtScheduledHoursDecrease Bit 

Update EmpRateChangeReasonTypes Set EmpRatcrtPayRateChange = 0
Update EmpRateChangeReasonTypes Set EmpRatcrtPayRateTypeChange = 0
Update EmpRateChangeReasonTypes Set EmpRatcrtPayFrequencyChange = 0
Update EmpRateChangeReasonTypes Set EmpRatcrtScheduledHoursIncrease = 0
Update EmpRateChangeReasonTypes Set EmpRatcrtScheduledHoursDecrease = 0

Update EmpRateChangeReasonTypes Set EmpRatcrtPayRateChange = 1 Where EmpRateChangeReasonType In (5, 6, 7, 8, 10, 11)
Update EmpRateChangeReasonTypes Set EmpRatcrtPayRateTypeChange = 1 Where EmpRateChangeReasonType In (4, 5, 9)
Update EmpRateChangeReasonTypes Set EmpRatcrtPayFrequencyChange = 1 Where EmpRateChangeReasonType In (4, 9, 12)
Update EmpRateChangeReasonTypes Set EmpRatcrtScheduledHoursIncrease = 1 Where EmpRateChangeReasonType In (4, 5)
Update EmpRateChangeReasonTypes Set EmpRatcrtScheduledHoursDecrease = 1 Where EmpRateChangeReasonType In (3, 12)
--EmpRateChangeReasonTypes Table Alter

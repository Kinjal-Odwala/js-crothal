/*
Last production release version 3.02.000 on 28th March, 2018 - 11PM EST
*/
Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS

Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.03.000', M_ENV_ENV_Database_Version = '3.03.000'
Where M_ENV_ENVIRONMENT = 4

Select * From dbo.HcmJobSendMethodTypes
INSERT INTO dbo.HcmJobSendMethodTypes(HcmJobsmtBrief, HcmJobsmtTitle, HcmJobsmtDescription, HcmJobsmtDisplayOrder, HcmJobsmtActive, HcmJobsmtModBy, HcmJobsmtModAt)
VALUES('Mail', 'Mail', 'Mail', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmJobSendMethodTypes(HcmJobsmtBrief, HcmJobsmtTitle, HcmJobsmtDescription, HcmJobsmtDisplayOrder, HcmJobsmtActive, HcmJobsmtModBy, HcmJobsmtModAt)
VALUES('Email', 'Email', 'Email', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmJobSendMethodTypes(HcmJobsmtBrief, HcmJobsmtTitle, HcmJobsmtDescription, HcmJobsmtDisplayOrder, HcmJobsmtActive, HcmJobsmtModBy, HcmJobsmtModAt)
VALUES('Unit Director', 'Unit Director', 'Unit Director', 3, 1, 'Compass-USA\Data Conversion', GetDate())

--ALTER TABLE dbo.HcmJobs ADD HcmJobSendMethodType INT NULL

-- PTO Setup --> PTO Dashboard Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 773
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\PTOSetup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'PTO Dashboard' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/emp/employeePTODashboard/usr/markup.htm'
	, @HirNodeParent
	
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\PTOSetup%' Order By HirNode

Update EsmV2.dbo.HirNodes Set HirNodBrief = 'PTODashboard', HirNodTitle = 'PTO Dashboard' Where HirNodFullPath = '\crothall\chimes\fin\PTOSetup\PTODashboard'
-- PTO Setup --> PTO Dashboard Menu Insert [End] 

-- Add OpenPO security nodes in Purchasing - PurchaseOrders [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Purchasing\PurchaseOrders%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PurchaseOrders'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'OpenPO', 'Open PO', 'Open PO', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PurchaseOrders\OpenPO', 'crothall', 'chimes', 'fin', 'Purchasing', 'PurchaseOrders', 'OpenPO', 'Compass-USA\Data Conversion', GetDate())
-- Add OpenPO security nodes in Purchasing - PurchaseOrders [End]

-- SSRS Reports Updates [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULCD'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULED'

Update ESMV2.dbo.HirNodes Set HirNodActive = 0 Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULCD'
Update ESMV2.dbo.HirNodes Set HirNodActive = 0  Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULED'

Declare @HirNode Int
      , @HirNodeParent Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULED/ULCD')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'PT ULED/ULCD', 'PT ULED/ULCD', 'PT ULED/ULCD', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULED/ULCD'
INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
VALUES('PT ULED/ULCD', 'PT ULED/ULCD', 'PT ULED/ULCD', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/Reports/Pages/Report.aspx?ItemPath=%2fApplications%2fTeamFin_SAP%2fTeamFin_PT%2fTeamFin_ULED_ULCD', @HirNode, 0)

Select * From RptReports

Update RptReports Set RptRepActive = 0 Where RptReport = 93
Update RptReports Set RptRepActive = 0 Where RptReport = 94

Declare @HirNode Int
      , @HirNodeParent Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULED Rollup')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'PT ULED Rollup', 'PT ULED Rollup', 'PT ULED Rollup', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Operational Reports\PT ULED Rollup'
INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
VALUES('PT ULED Rollup', 'PT ULED Rollup', 'PT ULED Rollup', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'http://reports.crothall.com/Reports/Pages/Report.aspx?ItemPath=%2fApplications%2fTeamFin_SAP%2fTeamFin_PT%2fTeamFin_ULED_Rollup', @HirNode, 0)
-- SSRS Reports Updates [End]

--ALTER TABLE dbo.PayPayCheckRequests ADD PayPaycrExportedBatchID INT NULL

--ALTER TABLE dbo.PayPayCodes ADD PayPaycCheckRequest BIT NULL
--EXEC sp_rename 'PayPayCheckRequestWageTypes.PayWageType', 'PayPayCode', 'COLUMN'

-- PayPayCheckRequestWageTypes Updates [Begin]

Update dbo.PayPayCodes Set PayPaycCheckRequest = 0
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1 Where PayPaycBrief In (Select PayWagtBrief From dbo.PayWageTypes Where PayWagtActive = 1)

Declare @PayPayCheckRequestWageType Int
	, @PayPayCode Int
	, @NewPayPayCode Int
	, @Count Int = 0

Declare curCheckRequest Cursor For
	Select PayPayCheckRequestWageType, PayPayCode From dbo.PayPayCheckRequestWageTypes RI With (NoLock)

Open curCheckRequest

While 1=1
Begin
	Set @PayPayCheckRequestWageType = Null
	Set @PayPayCode = Null
	Set @NewPayPayCode = Null

	Fetch Next From curCheckRequest Into @PayPayCheckRequestWageType, @PayPayCode

	Select @NewPayPayCode = PayPayCode From dbo.PayPayCodes Where PayPaycBrief = (Select PayWagtBrief From dbo.PayWageTypes With (NoLock) Where PayWageType = @PayPayCode)
	If @NewPayPayCode Is Not Null
	Begin
		Update dbo.PayPayCheckRequestWageTypes
		Set PayPayCode = @NewPayPayCode
		Where PayPayCheckRequestWageType = @PayPayCheckRequestWageType
		Set @Count = @Count + 1
	End
	If @@Fetch_Status <> 0 Break
End

Close curCheckRequest
Deallocate curCheckRequest
Select @Count
-- PayPayCheckRequestWageTypes Updates [End]

-- Metrics Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 720
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin'

Exec EsmV2.dbo.AppMenuItemUpdate
	'Metrics' --@MenuTitle Varchar(64)
	, 1 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, Null
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics%'
--  Metrics Menu Insert [End] 

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\HouseCodeSetup\Laundry%'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

-- Menu Updates [Begin]
Declare @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

Update ESMV2.dbo.HirNodes 
Set HirNodeParent = @HirNodeParent, HirNodBrief = 'LaundryMetrics', HirNodTitle = 'Laundry Metrics', HirNodFullPath = '\crothall\chimes\fin\Metrics\LaundryMetrics', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\LaundryMetrics'

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics%'
Select * From EsmV2.dbo.AppMenuItems Where AppMeniBrief = 'Laundry Metrics'

Update ESMV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 721 Where AppMeniBrief = 'Laundry Metrics'

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\HouseCodeSetup\PT%'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

Declare @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

Update ESMV2.dbo.HirNodes 
Set HirNodeParent = @HirNodeParent, HirNodBrief = 'PTMetrics', HirNodTitle = 'PT Metrics', HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics'

Select * From EsmV2.dbo.AppMenuItems Where AppMeniBrief = 'PT Metrics'

Update ESMV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 722 Where AppMeniBrief = 'PT Metrics'

Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\Administrative', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\Administrative'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\AdminObjectives', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\AdminObjectives'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\HospitalContract', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\HospitalContract'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\LaborControl', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\LaborControl'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\PTStatistcs', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\PTStatistcs'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\QualityAssurance', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\QualityAssurance'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\QualityControl', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\QualityControl'
Update ESMV2.dbo.HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\StrategicInit', HirNodlevel4 = 'Metrics'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\StrategicInit'
-- Menu Updates [End]

-- House Codes --> EVS Metrics Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 723
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

Exec EsmV2.dbo.AppMenuItemUpdate
	'EVS Metrics' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/hcm/evsMetric/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics%'

Update EsmV2.dbo.HirNodes Set HirNodBrief = 'EVSMetrics', HirNodTitle = 'EVS Metrics' Where HirNodFullPath = '\crothall\chimes\fin\Metrics\EVSMetrics'
-- House Codes --> EVS Metrics Menu Insert [End] 

-- Add security nodes for Metrics - EVS Metrics UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics\EVSMetrics'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'HospitalContract', 'Hospital & Contract', 'Hospital & Contract', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\HospitalContract', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'HospitalContract', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'LaborControl', 'Labor Control', 'Labor Control', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\LaborControl', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'LaborControl', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'StrategicInit', 'Strategic Initiatives', 'Strategic Initiatives', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\StrategicInit', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'StrategicInit', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'QualityAssurance', 'Quality Assurance', 'Quality Assurance', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\QualityAssurance', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'QualityAssurance', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'AdminObjectives', 'Admin Objectives', 'Admin Objectives', @DisplayOrder + 5, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\AdminObjectives', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'AdminObjectives', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'EVSStatistcs', 'EVS Statistcs', 'EVS Statistcs', @DisplayOrder + 6, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\EVSStatistcs', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'EVSStatistcs', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Metrics\EVSMetrics%'
-- Add security nodes for Metrics - EVS Metrics UI [End]

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Productive Hours', 'Productive Hours', 'Decimal', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Productive Hours', 'Productive Hours', 'Decimal', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Overtime Hours', 'Overtime Hours', 'Decimal', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Overtime Hours', 'Overtime Hours', 'Decimal', 4, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Productive Dollars', 'Productive Dollars', 'Decimal', 5, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Productive Dollars', 'Productive Dollars', 'Decimal', 6, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Overtime Dollars', 'Overtime Dollars', 'Decimal', 7, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Overtime Dollars', 'Overtime Dollars', 'Decimal', 8, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Comments', 'Comments', 'Comments', 'Text', 9, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'Target', 'Third Party Satisfaction - EVS HCAHPS - Target', 'Decimal', 10, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'Current', 'Third Party Satisfaction - EVS HCAHPS - Current', 'Decimal', 11, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'YTD', 'Third Party Satisfaction - EVS HCAHPS - YTD', 'Decimal', 12, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance - EVS HCAHPS', '', 'Percentile Rank', 'Third Party Satisfaction - EVS HCAHPS - Percentile Rank', 'Decimal', 13, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Partnership', '', 'Budgeted', 'Quality Partnership - Budgeted', 'Decimal', 14, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Partnership', '', 'Actual', 'Quality Partnership - Actual', 'Decimal', 15, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Audit Scores', '', 'Program Integrity', 'Audit Scores - Program Integrity', 'Decimal', 16, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Audit Scores', '', 'Standardization', 'Audit Scores - Standardization', 'Decimal', 17, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Audit Scores', '', 'Overall Score', 'Audit Scores - Overall Score', 'Decimal', 18, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Competency Training', '', 'Actual', 'Competency Training - Actual', 'Decimal', 19, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Admin Objective', '', 'Objective 1', 'Objective 1', 'Integer', 20, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Admin Objective', '', 'Objective 2', 'Objective 2', 'Integer', 21, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Admin Objective', '', 'Objective 3', 'Objective 3', 'Integer', 22, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Patient Days', '# of Patient Days', 'Integer', 23, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Adjusted Patient Days', '# of Adjusted Patient Days', 'Integer', 24, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Average Daily Census', 'Average Daily Census', 'Integer', 25, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Licensed Beds', '# of Licensed Beds', 'Integer', 26, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Staffed Beds', '# of Staffed Beds', 'Integer', 27, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Hospital Discharges', '# of Hospital Discharges', 'Integer', 28, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Net Cleanable Square Feet', 'Net Cleanable Square Feet', 'Integer', 29, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of ER Visits', '# of ER Visits', 'Integer', 30, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Paid FTE Budgets', 'Paid FTE Budgets', 'Integer', 31, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Paid FTE Actuals', 'Paid FTE Actuals', 'Integer', 32, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Productive FTE Budgets', 'Productive FTE Budgets', 'Integer', 33, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Productive FTE Actuals', 'Productive FTE Actuals', 'Integer', 34, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Total FTE’s', 'Total FTE’s', 'Integer', 35, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Managers', 'Managers', 'Integer', 36, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Total Housekeeping Expense', 'Total Housekeeping Expense', 'Decimal', 37, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Budgeted AWR', 'Budgeted AWR', 'Decimal', 38, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Experienced AWR', 'Experienced AWR', 'Decimal', 39, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Hospital Financial Budget', 'Hospital Financial Budget', 'Decimal', 40, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Hospital Financial Actuals', 'Hospital Financial Actuals', 'Decimal', 41, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Average Response Time', 'Average Response Time', 'Decimal', 42, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Average Turnaround Time', 'Average Turnaround Time', 'Decimal', 43, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Employee Injury Frequency Rate', 'Employee Injury Frequency Rate', 'Integer', 44, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'HCAHPS', 'HCAHPS', 'Integer', 45, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Press Ganey', 'Press Ganey', 'Integer', 46, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('UV Manufacturer', '', 'Surfacide', 'Surfacide', 'Integer', 47, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('UV Manufacturer', '', 'Moonbeam', 'Moonbeam', 'Integer', 47, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Wanda', '', 'Vision State', 'Vision State', 'Integer', 48, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Micro Fiber', '', 'Medline', 'Medline', 'Integer', 49, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Micro Fiber', '', 'Rubbermaid', 'Rubbermaid', 'Integer', 50, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('MOP', '', 'Medline', 'Medline', 'Integer', 51, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('MOP', '', 'Rubbermaid', 'Rubbermaid', 'Integer', 52, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Cart Manufacturer', '', 'Royce Rolls', 'Royce Rolls', 'Integer', 53, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Cart Manufacturer', '', 'Rubbermaid', 'Rubbermaid', 'Integer', 54, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Cart Manufacturer', '', 'Geerpres', 'Geerpres', 'Integer', 55, 1, 'Compass-Usa\Data Conversion', GetDate())

Select * From dbo.HcmEVSMetricTypes

INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('CWYMV', 'Compatible with Your Mission/Values ', 'Compatible With Your Mission/Values ', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('OSMT', 'On-Site Management Team ', 'On-Site Management Team ', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('QPTS', 'Quality of Patient Transportation Staff ', 'Quality of Patient Transportation Staff ', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('ETS', 'Employee Training/Standardization', 'Employee Training/Standardization', 4, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('PVS', 'Price/Value of Service ', 'Price/Value of Service ', 5, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('CRS', 'Corporate and Regional Support ', 'Corporate and Regional Support ', 6, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('HSRPC', 'Health/Safety/Regulatory Performance/Compliance', 'Health/Safety/Regulatory Performance/Compliance', 7, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('TI', 'Technology/Innovation', 'Technology/Innovation', 8, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('CEUS', 'Customer/End User Satisfaction ', 'Customer/End User Satisfaction ', 9, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('ESE', 'Employee Satisfaction/Engagement', 'Employee Satisfaction/Engagement', 10, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('FPR', 'Financial Performance and Reporting', 'Financial Performance and Reporting', 11, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('BACR', 'Benchmarking/Analytic Capability and Reporting', 'Benchmarking/Analytic Capability and Reporting', 12, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('SCMPT', 'Support of Capacity Management/Patient Throughput', 'Support of Capacity Management/Patient Throughput', 13, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('SPS', 'Support of Patient Satisfaction/HCAHPS', 'Support of Patient Satisfaction/HCAHPS', 14, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('DKPIO', 'Departmental Key Performance Indicator Outcomes', 'Departmental Key Performance Indicator Outcomes', 15, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSAdministratorObjectives] (HcmEvsaoBrief, HcmEvsaoTitle, HcmEvsaoDescription, HcmEvsaoDisplayOrder, HcmEvsaoActive, HcmEvsaoModBy, HcmEvsaoModAt)
VALUES ('SCDL', 'Synergy/Collaboration with Departments/Leadership ', 'Synergy/Collaboration with Departments/Leadership', 16, 1, 'Compass-Usa\Data Conversion', GetDate())

Select * From dbo.HcmEVSAdministratorObjectives
 
--ALTER TABLE dbo.HcmPTMetrics ADD HcmPtmMetricStandard int null
--Alter table dbo.HcmPTMetrics Add HcmPtSupportedByNPC bit null
--EXEC sp_rename 'HcmPTMetrics.HcmPtSupportedByNPC', 'HcmPtmSupportedByNPC', 'COLUMN'
--ALTER TABLE HcmPTMetrics ALTER COLUMN HcmPtmSupportedByNPC INT
 
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Metric Standard', 'MatricStandard', 'RTA 10, DTC 20, RTC 30', 'RTA 10, DTC 20, RTC 30', 'Integer', 68 , 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Metric Standard', 'MatricStandard', 'RTA 15, DTC 20, RTC 35', 'RTA 15, DTC 20, RTC 35', 'Integer', 69 , 1, 'Compass-Usa\Data Conversion', GetDate())

  -- Setup --> Application Chargeback Rates Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 821
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate
	'Application Chargeback Rates' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/app/chargebackRate/usr/markup.htm'
	, @HirNodeParent

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Setup%'
Select * From EsmV2.dbo.AppMenuItems Where AppMeniTitle = 'Application Chargeback Rates'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\ApplicationChargebackRates'
Update EsmV2.dbo.AppMenuItems Set AppMeniBrief = 'Chargeback Rates' Where AppMeniTitle = 'Application Chargeback Rates'
Update EsmV2.dbo.HirNodes Set HirNodBrief = 'ChargebackRates', HirNodTitle = 'Application Chargeback Rates', HirNodFullPath = '\crothall\chimes\fin\Setup\ChargebackRates', HirNodLevel5 = 'ChargebackRates'
Where HirNodFullPath = '\crothall\chimes\fin\Setup\ApplicationChargebackRates'
-- Setup --> Application Chargeback Rates Menu Insert [End] 

--EXEC sp_rename 'GlmJournalEntries.HcmHousecode', 'HcmHouseCode', 'COLUMN'
--ALTER TABLE dbo.GlmJournalEntries ADD AppTransactionStatusType INT NULL
--ALTER TABLE dbo.GlmJournalEntries ADD FscAccountDebit INT NULL
--ALTER TABLE dbo.GlmJournalEntries ADD FscAccountCredit INT NULL
--ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueAmount Decimal(18, 2) NULL
--ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueJustification Varchar(64) NULL
--ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueAssignment Varchar(64) NULL


--ALTER TABLE dbo.FscAccounts ADD FscAccJournalEntry BIT NULL
Update dbo.FscAccounts Set FscAccJournalEntry = 0

-- Add CancelApproved security nodes in GeneralLedger - JournalEntry [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\GeneralLedger\JournalEntry%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\GeneralLedger\JournalEntry'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CancelApproved', 'Cancel - Approved Status', 'Cancel - Approved Status', @DisplayOrder + 1, 1, '\crothall\chimes\fin\GeneralLedger\JournalEntry\CancelApproved', 'crothall', 'chimes', 'fin', 'GeneralLedger', 'JournalEntry', 'CancelApproved', 'Compass-USA\Data Conversion', GetDate())
-- Add CancelApproved security nodes in GeneralLedger - JournalEntry [End]

Select * From EsmV2.dbo.AppMenuItems Where AppMeniBrief = 'Journal Entry'
Update EsmV2.dbo.AppMenuItems Set AppMeniActive = 1, AppMeniActionData = '/fin/glm/journalEntry/usr/markup.htm' Where AppMeniBrief = 'Journal Entry'

Select * From Esmv2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\GeneralLedger\JournalEntry%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 1 Where HirHierarchy = 1 And HirNodActive = 0 And HirNodFullPath Like '\crothall\chimes\fin\GeneralLedger\JournalEntry%' 
Update Esmv2.dbo.HirNodes Set HirNodActive = 1 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\GeneralLedger\JournalEntry\Read' 


--- Not required [Beegin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Reports\SSRS Reports\PTO Reports%'

Declare @HirNode Int
      , @HirNodeParent Int
      , @DisplayOrder Int

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\PTO Reports')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'PTO Reports', 'PTO Reports', 'PTO Reports', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End

If Not Exists(Select HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\PTO Reports\PTO Stub')
Begin
      Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
      Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\PTO Reports'
      EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'PTO Stub', 'PTO Stub', 'PTO Stub', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
End
--- Not required [End]

Select * From RptReports
INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
VALUES('PTO Stub', 'PTO Stub', 'PTO Stub', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin_SAP%2fPTOStub&rs:Command=Render', Null, 0)
INSERT INTO TeamFinV2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode, RptRepParameterAvailable)
VALUES('Balance Usage', 'Balance Usage', 'Balance Usage', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin_SAP%2fPTOBalanceUsageCC&rs:Command=Render', Null, 0)

/*
CT updated on 20th June, 2018 - 11PM EST
*/

-- Add ReExport security nodes in Payroll - CheckRequest [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Payroll\CheckRequest%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll\CheckRequest'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ReExport', 'Re-Export', 'Re-Export', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Payroll\CheckRequest\ReExport', 'crothall', 'chimes', 'fin', 'Payroll', 'CheckRequest', 'ReExport', 'Compass-USA\Data Conversion', GetDate())
-- Add ReExport security nodes in Payroll - CheckRequest [End]

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Healthstream', 'Healthstream', 'Integer', 56, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'JL Morgan', 'JL Morgan', 'Integer', 57, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'NRC Picker', 'NRC Picker', 'Integer', 58, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'PRC', 'PRC', 'Integer', 59, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Self-Administered', 'Self-Administered', 'Integer', 60, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Sullivan Group', 'Sullivan Group', 'Integer', 61, 1, 'Compass-Usa\Data Conversion', GetDate())

Select * From dbo.AppIECategories
Insert Into dbo.AppIECategories(AppIECategory, AppIEcBrief, AppIEcTitle, AppIEcDescription, AppIEcDisplayOrder, AppIEcActive, AppIEcModBy, AppIEcModAt)
Values (20, 'JournalEntryExport', 'Journal Entry Export', 'Journal Entry Export', 20, 1, 'Compass-USA\Data Conversion', GetDate())

ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueExportedDate DATETIME NULL
ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueExportedBatchID INT NULL
ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueBatchID VARCHAR(25) NULL

INSERT INTO dbo.AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
VALUES(12, '12', 'Voucher', 'Voucher', 1, 1, 'Compass-USA\Data Conversion' , GetDate())

Select * From dbo.AppTransactionStatusTypes

-- Add the following keys in TeamFin Service app.config file [Begin]
<add key="Environment" value="Production" />
<add key="JournalEntryExportAt" value="2:40 AM" />
<add key="JournalEntryExportFilePath" value="E:\Sites\CTTRANS\TeamFin\js\crothall\chimes\fin\exportToSAP\" />
<add key="JournalEntryExportFileName" value="JournalEntry_.txt" />
-- Add the following keys in TeamFin Service app.config file [End]

Select * From RptReports
Select * From EsmV2..HirNodes Where HirNode In (34825, 34826)
Update EsmV2..HirNodes Set HirNodActive = 0 Where HirNode In (34825, 34826)

INSERT INTO dbo.AppApplications (AppApplication, AppAppBrief, AppAppTitle, AppAppDescription, AppAppDisplayOrder, AppAppActive, AppAppModBy, AppAppModAt)
VALUES (1, 'TFTC', 'TeamFin and TeamCoach', 'TeamFin and TeamCoach', 1, 1, 'Compass-USA\Data Conversion', GetDate())
, (2, 'TC', 'TeamCoach Only', 'TeamCoach Only', 2, 1, 'Compass-USA\Data Conversion', GetDate())
, (3, 'TL', 'TeamLead', 'TeamLead', 3, 1, 'Compass-USA\Data Conversion', GetDate())
, (4, 'TT', 'TeamThroughput', 'TeamThroughput', 4, 1, 'Compass-USA\Data Conversion', GetDate())
, (5, 'TF', 'TeamFlow', 'TeamFlow', 5, 1, 'Compass-USA\Data Conversion', GetDate())

Select * From dbo.AppApplications

--ALTER TABLE dbo.FscAccounts ADD FscAccChargebackRate BIT NULL
Select * From dbo.FscAccounts Where FscAccCode In ('699999', '676700')

Update FscAccounts Set FscAccChargebackRate = 0
Update FscAccounts Set FscAccChargebackRate = 1 Where FscAccount In (Select FscAccount From dbo.FscAccounts Where FscAccCode In ('699999', '676700'))

/*
CT updated on 11th July, 2018 - 11PM EST
*/

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SectionChargebac', 'Section Chargebacks', 'Section Chargebacks', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionChargebacks', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionChargebacks', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionChargebacks'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionChargebacks\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionChargebacks', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionChargebacks\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionChargebacks', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionChargebacks%'

-- Metrics --> Setup Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 724
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

Exec EsmV2.dbo.AppMenuItemUpdate
	'Setup' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/hcm/metricSetup/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics%'
-- Metrics --> Setup Menu Insert [End] 

Select * From HcmPTMetricTypes
Select * From HcmEVSMetricTypes Where HcmEvsmtSubType = 'Labor Control'

Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Regular Productive Hours', HcmEvsmtDescription = 'Regular Productive Hours' Where HcmEVSMetricType = 1
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Regular Productive Hours', HcmEvsmtDescription = 'Regular Productive Hours' Where HcmEVSMetricType = 2
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Overtime Productive Hours', HcmEvsmtDescription = 'Overtime Productive Hours' Where HcmEVSMetricType = 3
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Overtime Productive Hours', HcmEvsmtDescription = 'Overtime Productive Hours' Where HcmEVSMetricType = 4
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Regular Productive Dollars', HcmEvsmtDescription = 'Regular Productive Dollars' Where HcmEVSMetricType = 5
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Regular Productive Dollars', HcmEvsmtDescription = 'Regular Productive Dollars' Where HcmEVSMetricType = 6
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Overtime Productive Dollars', HcmEvsmtDescription = 'Overtime Productive Dollars' Where HcmEVSMetricType = 7
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Overtime Productive Dollars', HcmEvsmtDescription = 'Overtime Productive Dollars' Where HcmEVSMetricType = 8

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Non-Productive Hours', 'Non-Productive Hours', 'Decimal', 62, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Non-Productive Hours', 'Non-Productive Hours', 'Decimal', 63, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Non-Productive Dollars', 'Non-Productive Dollars', 'Decimal', 64, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Non-Productive Dollars', 'Non-Productive Dollars', 'Decimal', 65, 1, 'Compass-Usa\Data Conversion', GetDate())

-- Add security nodes for Metrics - Setup UI [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics%'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics\EVSMetrics%'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics\PTMetrics%'
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics\Setup%'

Declare @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics\Setup'

Update ESMV2.dbo.HirNodes 
Set HirNodeParent = @HirNodeParent, HirNodBrief = 'PT', HirNodTitle = 'PT', HirNodDescription = 'PT', HirNodFullPath = '\crothall\chimes\fin\Metrics\Setup\PT', HirNodlevel5 = 'Setup', HirNodlevel6 = 'PT'
Where HirNodFullPath = '\crothall\chimes\fin\Metrics\PTMetrics\Administrative'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics\Setup'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'EVS', 'EVS', 'EVS', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Metrics\Setup\EVS', 'crothall', 'chimes', 'fin', 'Metrics', 'Setup', 'EVS', 'Compass-USA\Data Conversion', GetDate())
-- Add security nodes for Metrics - Setup UI [End]

truncate table HcmEVSMetricTypes

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'HCAHPS', 'HCAHPS', 'Integer', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Press Ganey', 'Press Ganey', 'Integer', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Healthstream', 'Healthstream', 'Integer', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'JL Morgan', 'JL Morgan', 'Integer', 4, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'NRC Picker', 'NRC Picker', 'Integer', 5, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'PRC', 'PRC', 'Integer', 6, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Self-Administered', 'Self-Administered', 'Integer', 7, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Third Party Satisfaction', '', 'Sullivan Group', 'Sullivan Group', 'Integer', 8, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('UV Manufacturer', '', 'Surfacide', 'Surfacide', 'Integer', 9, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('UV Manufacturer', '', 'Moonbeam', 'Moonbeam', 'Integer', 10, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Wanda', '', 'Vision State', 'Vision State', 'Integer', 11, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Micro Fiber', '', 'Medline', 'Medline', 'Integer', 12, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Micro Fiber', '', 'Rubbermaid', 'Rubbermaid', 'Integer', 13, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('MOP', '', 'Medline', 'Medline', 'Integer', 14, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('MOP', '', 'Rubbermaid', 'Rubbermaid', 'Integer', 15, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Cart Manufacturer', '', 'Royce Rolls', 'Royce Rolls', 'Integer', 16, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Cart Manufacturer', '', 'Rubbermaid', 'Rubbermaid', 'Integer', 17, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Cart Manufacturer', '', 'Geerpres', 'Geerpres', 'Integer', 18, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Regular Productive Hours', 'Regular Productive Hours', 'Decimal', 19, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Regular Productive Hours', 'Regular Productive Hours', 'Decimal', 20, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Overtime Productive Hours', 'Overtime Productive Hours', 'Decimal', 21, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Overtime Productive Hours', 'Overtime Productive Hours', 'Decimal', 22, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Non-Productive Hours', 'Non-Productive Hours', 'Decimal', 23, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Non-Productive Hours', 'Non-Productive Hours', 'Decimal', 24, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Regular Productive Dollars', 'Regular Productive Dollars', 'Decimal', 25, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Regular Productive Dollars', 'Regular Productive Dollars', 'Decimal', 26, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Overtime Productive Dollars', 'Overtime Productive Dollars', 'Decimal', 27, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Overtime Productive Dollars', 'Overtime Productive Dollars', 'Decimal', 28, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Budget', 'Non-Productive Dollars', 'Non-Productive Dollars', 'Decimal', 29, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Actual', 'Non-Productive Dollars', 'Non-Productive Dollars', 'Decimal', 30, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Labor Control', 'Comments', 'Comments', 'Comments', 'Text', 31, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance', '', 'Target', 'Third Party Satisfaction - Target', 'Decimal', 32, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance', '', 'Current', 'Third Party Satisfaction - Current', 'Decimal', 33, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance', '', 'YTD', 'Third Party Satisfaction - YTD', 'Decimal', 34, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Assurance', '', 'Percentile Rank', 'Third Party Satisfaction - Percentile Rank', 'Decimal', 35, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Partnership', '', 'Budgeted', 'Quality Partnership - Budgeted', 'Decimal', 36, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Partnership', '', 'Actual', 'Quality Partnership - Actual', 'Decimal', 37, 1, 'Compass-Usa\Data Conversion', GetDate())

--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('Audit Scores', '', 'Program Integrity', 'Audit Scores - Program Integrity', 'Decimal', 16, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Audit Scores', '', 'Standardization', 'Audit Scores - Standardization', 'Decimal', 38, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Audit Scores', '', 'Overall Score', 'Audit Scores - Overall Score', 'Decimal', 39, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Competency Training', '', 'Actual', 'Competency Training - Actual', 'Decimal', 40, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Admin Objective', '', 'Objective 1', 'Objective 1', 'Integer', 41, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Admin Objective', '', 'Objective 2', 'Objective 2', 'Integer', 42, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Admin Objective', '', 'Objective 3', 'Objective 3', 'Integer', 43, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Patient Days', '# of Patient Days', 'Integer', 44, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Adjusted Patient Days', '# of Adjusted Patient Days', 'Integer', 45, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Average Daily Census', 'Average Daily Census', 'Integer', 46, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Licensed Beds', '# of Licensed Beds', 'Integer', 47, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Staffed Beds', '# of Staffed Beds', 'Integer', 48, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of Hospital Discharges', '# of Hospital Discharges', 'Integer', 49, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Net Cleanable Square Feet', 'Net Cleanable Square Feet', 'Integer', 50, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', '# of ER Visits', '# of ER Visits', 'Integer', 51, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Paid FTE Budgets', 'Paid FTE Budgets', 'Integer', 31, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Paid FTE Actuals', 'Paid FTE Actuals', 'Integer', 32, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Productive FTE Budgets', 'Productive FTE Budgets', 'Integer', 33, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Productive FTE Actuals', 'Productive FTE Actuals', 'Integer', 34, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Total FTE’s', 'Total FTE’s', 'Integer', 35, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Managers', 'Managers', 'Integer', 36, 1, 'Compass-Usa\Data Conversion', GetDate())
--INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
--VALUES ('EVS Statistics', '', 'Total Housekeeping Expense', 'Total Housekeeping Expense', 'Decimal', 37, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Budgeted AWR', 'Budgeted AWR', 'Decimal', 52, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Experienced AWR', 'Experienced AWR', 'Decimal', 53, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Hospital Financial Budget', 'Hospital Financial Budget', 'Decimal', 54, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Hospital Financial Actuals', 'Hospital Financial Actuals', 'Decimal', 55, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Average Response Time', 'Average Response Time', 'Decimal', 56, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Average Turnaround Time', 'Average Turnaround Time', 'Decimal', 57, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Employee Injury Frequency Rate', 'Employee Injury Frequency Rate', 'Integer', 58, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'RRM', 'RRM', 'Integer', 59, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Unit Director', 'Unit Director', 'Integer', 60, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Assistant Unit Director', 'Assistant Unit Director', 'Integer', 61, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Ops Manager', 'Ops Manager', 'Integer', 62, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Patient Flow Coordinator', 'Patient Flow Coordinator', 'Integer', 63, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Patient Experience Manager', 'Patient Experience Manager', 'Integer', 64, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Office Manager', 'Office Manager', 'Integer', 65, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'HR', 'HR', 'Integer', 66, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Payroll', 'Payroll', 'Integer', 67, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Clerical', 'Clerical', 'Integer', 68, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Management Staff', '', 'Other', 'Other', 'Integer', 69, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Non-TeleTracking', 'EVS', 'Best In Class', 'Non-TeleTracking - EVS - Best In Class', 'Decimal', 70, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Non-TeleTracking', 'EVS', 'Target', 'Non-TeleTracking - EVS - Target', 'Decimal', 71, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('TeleTracking', 'EVS', 'Best In Class', 'TeleTracking - EVS - Best In Class', 'Decimal', 72, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmEVSMetricTypes] (HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('TeleTracking', 'EVS', 'Target', 'TeleTracking - EVS - Target', 'Decimal', 73, 1, 'Compass-Usa\Data Conversion', GetDate())

Select * From HcmEVSMetricTypes

--ALTER TABLE dbo.HcmEVSMetrics ADD HcmEvsmEmployeeProductiveHoursPerWeekStandard DECIMAL(18, 2) NULL
--ALTER TABLE dbo.HcmEVSMetricNumericDetails ADD HcmEvsmndStaffManagementRatio BIT NULL

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics\EVSMetrics%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics\EVSMetrics'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ManagementStaff', 'Management Staff', 'Management Staff', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Metrics\EVSMetrics\ManagementStaff', 'crothall', 'chimes', 'fin', 'Metrics', 'EVSMetrics', 'ManagementStaff', 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 25th July, 2018 - 11PM EST
*/

--Update FscAccounts Set FscAccJournalEntry = 1 Where FscAccCode In ('610701', '610703','610706','610707','610700')
--ALTER TABLE dbo.GlmJournalEntries ADD GlmJoueJournalEntryNumber INT NULL

-- Create JournalEntryNumber sequence number [Begin]
CREATE SEQUENCE JournalEntryNumber AS INT
START WITH 100001 -- This is the Number you want to start the Sequence 
INCREMENT BY 1
-- Create JournalEntryNumber sequence number [End]

--Miscallaneous updates [Begin]

Select * From PayPayCodes Where PayPayCode >= 131
1015, 1024, 1112, 1151, Earn
Select * From PayPayCheckRequestWageTypes Where PayPayCode In (Select PayPayCode From PayPayCodes Where PayPayCode >= 131)
--18973
Select * From PayPayCheckRequestWageTypes Where PayPayCode In (Select PayPayCode From PayPayCodes Where PayPayCode < 131)
Select * From PayPayCheckRequestWageTypes_temp
Select * from PayPayCheckRequestWageTypes_temp Where PayPayCode Not In (Select PayWageType From dbo.PayWageTypes)
Select * From dbo.PayWageTypes 
Select * From PayPayCodes Where PayPayCode >= 131
Select * From dbo.PayPayCodes Where PayPaycBrief In (Select PayWagtBrief From dbo.PayWageTypes)
Select * From dbo.PayWageTypes Where PayWagtBrief Not In (Select PayPaycBrief From dbo.PayPayCodes)
Select * From PayPayCheckRequestWageTypes Where PayPayCheckRequestWageType In (405)

declare @NewPayPayCode Int
set @NewPayPayCode = Null 
Select @NewPayPayCode = PayPayCode From dbo.PayPayCodes Where PayPaycBrief = '1112'
select @NewPayPayCode

Select * From PayPayCheckRequests Where PayPayCheckRequest In (Select PayPayCheckRequest From PayPayCheckRequestWageTypes Where PayPayCode In (6,9,12,16,22))

select * from AppTransactionstatustypes

Declare @PayPayCheckRequestWageType Int
	, @PayPayCode Int

Declare curCheckRequest Cursor For
	Select PayPayCheckRequestWageType
		, PayPayCode
	From dbo.PayPayCheckRequestWageTypes_Temp With (NoLock)

Open curCheckRequest

While 1=1
Begin
	Set @PayPayCheckRequestWageType = Null
	Set @PayPayCode = Null

	Fetch Next From curCheckRequest Into @PayPayCheckRequestWageType, @PayPayCode

	Update dbo.PayPayCheckRequestWageTypes
	Set PayPayCode = @PayPayCode
	Where PayPayCheckRequestWageType = @PayPayCheckRequestWageType

	If @@Fetch_Status <> 0 Break
End

Close curCheckRequest
Deallocate curCheckRequest

--Miscallaneous updates [Begin]

-- Add SendMethodType security nodes in HouseCodes - Jobs [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SendMethodType', 'Send Method Type', 'Send Method Type', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\SendMethodType', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'SendMethodType', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\SendMethodType'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\SendMethodType\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'SendMethodType', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\SendMethodType\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'SendMethodType', 'Write', 'Compass-USA\Data Conversion', GetDate())
-- Add SendMethodType security nodes in HouseCodes - Jobs [End]

/*
Last production release version 3.03.000 on 8th August, 2018 - 11PM EST
*/
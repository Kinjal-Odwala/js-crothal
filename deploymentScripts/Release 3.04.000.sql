/*
Last production release version 3.03.000 on 8th August, 2018 - 11PM EST
*/
Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS

Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.04.000', M_ENV_ENV_Database_Version = '3.04.000'
Where M_ENV_ENVIRONMENT = 4

--ALTER TABLE dbo.HcmJobPaymentTerms ADD HcmJobptDueDays INT NULL
--Update HcmJobPaymentTerms Set HcmJobptDueDays = 25

--ALTER TABLE dbo.PurVendors ADD PurVenCrtdBy VARCHAR(50) NULL
--ALTER TABLE dbo.PurVendors ADD PurVenCrtdAt DATETIME NULL
--ALTER TABLE dbo.PurVendors ADD PurVenActivatedDate DATETIME NULL
--ALTER TABLE dbo.PurVendors ADD PurVenDeactivatedDate DATETIME NULL
--ALTER TABLE dbo.PurVendors ADD PurVenReactivatedDate DATETIME NULL

-- Metrics --> Call Metrics Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 725
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Metrics'

Exec EsmV2.dbo.AppMenuItemUpdate
	'Call Metrics' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/hcm/callMetric/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Metrics\CallMetrics%'

Update EsmV2.dbo.HirNodes Set HirNodBrief = 'CallMetrics', HirNodTitle = 'Call Metrics' Where HirNodFullPath = '\crothall\chimes\fin\Metrics\CallMetrics'
-- Metrics --> Call Metrics Menu Insert [End]

INSERT INTO [dbo].[HcmCallMetricTypes] (HcmCallmtBrief, HcmCallmtTitle, HcmCallmtDescription, HcmCallmtDataType, HcmCallmtDisplayOrder, HcmCallmtActive, HcmCallmtModBy, HcmCallmtModAt)
VALUES ('PC', 'Processed Calls', 'Processed Calls', 'Decimal', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmCallMetricTypes] (HcmCallmtBrief, HcmCallmtTitle, HcmCallmtDescription, HcmCallmtDataType, HcmCallmtDisplayOrder, HcmCallmtActive, HcmCallmtModBy, HcmCallmtModAt)
VALUES ('ASA', 'Average Seconds to Answer', 'Average Seconds to Answer', 'Decimal', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmCallMetricTypes] (HcmCallmtBrief, HcmCallmtTitle, HcmCallmtDescription, HcmCallmtDataType, HcmCallmtDisplayOrder, HcmCallmtActive, HcmCallmtModBy, HcmCallmtModAt)
VALUES ('ACLS', 'Average Call Length in Seconds', 'Average Call Length in Seconds', 'Decimal', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmCallMetricTypes] (HcmCallmtBrief, HcmCallmtTitle, HcmCallmtDescription, HcmCallmtDataType, HcmCallmtDisplayOrder, HcmCallmtActive, HcmCallmtModBy, HcmCallmtModAt)
VALUES ('ACAH', 'Average Calls per Agent per Hour', 'Average Calls per Agent per Hour', 'Decimal', 4, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmCallMetricTypes] (HcmCallmtBrief, HcmCallmtTitle, HcmCallmtDescription, HcmCallmtDataType, HcmCallmtDisplayOrder, HcmCallmtActive, HcmCallmtModBy, HcmCallmtModAt)
VALUES ('AR', 'Abandon Rate %', 'Abandon Rate %', 'Decimal', 5, 1, 'Compass-Usa\Data Conversion', GetDate())

Select * From dbo.HcmCallMetricTypes

--ALTER TABLE dbo.PayPayCodes ADD PayPaycHourly BIT NULL
--ALTER TABLE dbo.PayPayCodes ADD PayPaycSalary BIT NULL
--ALTER TABLE dbo.PayPayCodes ADD PayPaycEarnings BIT NULL
--ALTER TABLE dbo.PayPayCheckRequests ADD EmpEmployeeGeneral INT NULL
--ALTER TABLE dbo.PayPayCheckRequestWageTypes ADD PayPaycrwtPayRate Decimal(10, 2) NULL

Select * From PayPayCodes Where PayPaycCheckRequest = 1 and PayPaycHourly = 1 and PayPaycActive = 1
Select * From PayPayCodes Where PayPaycCheckRequest = 1
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1001'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '1002'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1011'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '1014'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1017'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1021'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 1 Where PayPaycBrief = '1068'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1069'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '1101'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '1116'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1120'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1121'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1123'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '1150'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1155'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1160'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1161'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1162'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 0, PayPaycEarnings = 0 Where PayPaycBrief = '1163'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 1, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '1199'
Update dbo.PayPayCodes Set PayPaycCheckRequest = 1, PayPaycHourly = 0, PayPaycSalary = 1, PayPaycEarnings = 1 Where PayPaycBrief = '7003'

Select * From dbo.HcmEVSMetricTypes Where HcmEvsmtTitle = 'HCAHPS'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtActive = 0 Where HcmEvsmtTitle = 'HCAHPS'

--ALTER TABLE dbo.RevInvoices ADD RevInvWorkOrderId Varchar(50) NULL

-- Add the following key in revact-web.config file
<add key="ImportType" value="OpenXML"/>

-- Change the following key in bud act-web.config file
<add key="ExportFileName" value="BudgetDetail_.txt" />

-- Change the following key in service app.config file
 <add key="ForecastExportFileName" value="ForecastDetail_.txt" />
  
/*
CT updated on 23rd October, 2018 - 11PM EST
*/

Select * From dbo.PayPayCodes Where PayPaycCheckRequest = 1 Order By PayPaycBrief
Select * From dbo.PayPayCodes Where PayPayCode > 130 Order By PayPaycBrief 

Update dbo.PayPayCodes Set PayPaycDisplayOrder = 131 Where PayPaycBrief = '1001'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 132 Where PayPaycBrief = '1002'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 133 Where PayPaycBrief = '1007'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 134 Where PayPaycBrief = '1011'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 135 Where PayPaycBrief = '1014'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 136 Where PayPaycBrief = '1017'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 137 Where PayPaycBrief = '1021'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 138 Where PayPaycBrief = '1028'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 139 Where PayPaycBrief = '1068'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 140 Where PayPaycBrief = '1069'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 141 Where PayPaycBrief = '1101'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 142 Where PayPaycBrief = '1116'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 143 Where PayPaycBrief = '1120'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 144 Where PayPaycBrief = '1121'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 145 Where PayPaycBrief = '1123'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 146 Where PayPaycBrief = '1150'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 147 Where PayPaycBrief = '1155'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 148 Where PayPaycBrief = '1160'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 149 Where PayPaycBrief = '1161'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 150 Where PayPaycBrief = '1162'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 151 Where PayPaycBrief = '1163'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 152 Where PayPaycBrief = '1199'
Update dbo.PayPayCodes Set PayPaycDisplayOrder = 153 Where PayPaycBrief = '7003'

Select * From EsmV2.dbo.AppMenuItems

Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 724 Where AppMeniActionData = '/fin/hcm/callMetric/usr/markup.htm'
Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 725 Where AppMeniActionData = '/fin/hcm/metricSetup/usr/markup.htm'

/*
CT updated on 23rd October, 2018 - 11PM EST
*/

/*
Last production release version 3.04.000 on 24th October, 2018 - 11PM EST
*/
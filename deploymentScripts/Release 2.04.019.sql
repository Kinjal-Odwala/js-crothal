/*
Last production release version 2.04.018 on 27th January 2016 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.019', M_ENV_ENV_Database_Version = '2.04.019' 
Where M_ENV_ENVIRONMENT = 4

-- Ceridian Reports: SSRS Report Parameters Updates [Begin]
-- NOTES: Pending only in production

/fin/rpt/ceridianReport/usr/markup.htm?reportId=Audit&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_Audit_Report&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Epay Timesheet Budget&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEpayBudgetTimesheetCustomer&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Labor Dashboard&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fTeamFin_Labor_Dashboard&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Ceridian ChargeTo&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_ChargeTo&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Employee Active Not Paid&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeActiveNotPaid&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Employee Master Listing&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fEmployeeMasterListing&rs%3aCommand=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=PTD Register Employee Detail&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianPTDRegisterEmployeeDetail&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=YTD Register Employee Detail&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridianYTDRegisterEmployeeDetail&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll IDR&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fPayroll_IDR_Report&rs%3aCommand=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll Register&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register&rs:Command=Render
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll Salary Register&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register_Salary&rs:Command=Render

SELECT * FROM [Esmv2].[dbo].[AppMenuItems]

SELECT * From [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Audit Report'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'EPay Act vs Bud'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Labor Dashboard'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'ChargeTo'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Employee Active '
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Employee Master '
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'PTD Register Emp'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'YTD Register Emp'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Payroll IDR'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Payroll Register'
SELECT * From  [Esmv2].[dbo].[AppMenuItems] Where AppMeniBrief = 'Payroll Reg Sal'

Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Audit Report' Where AppMeniBrief = 'Audit Report'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=EPay Act vs Bud' Where AppMeniBrief = 'EPay Act vs Bud'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Labor Dashboard' Where AppMeniBrief = 'Labor Dashboard'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=ChargeTo' Where AppMeniBrief = 'ChargeTo'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Employee Active' Where AppMeniBrief = 'Employee Active '
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Employee Master' Where AppMeniBrief = 'Employee Master '
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=PTD Register Emp' Where AppMeniBrief = 'PTD Register Emp'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=YTD Register Emp' Where AppMeniBrief = 'YTD Register Emp'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Payroll IDR' Where AppMeniBrief = 'Payroll IDR'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=PayrollRegister' Where AppMeniBrief = 'Payroll Register'
Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=Payroll Reg Sal' Where AppMeniBrief = 'Payroll Reg Sal'

Update [Esmv2].[dbo].[AppMenuItems] Set AppMeniActionData = '/fin/rpt/ssrsReport/usr/markup.htm?reportId=ChargeTo' Where AppMeniBrief = 'ChargeTo'
/fin/rpt/ceridianReport/usr/markup.htm?reportId=Ceridian ChargeTo&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_ChargeTo&rs:Command=Render
-- Ceridian Reports: SSRS Report Parameters Updates [End]

-- ALTER TABLE dbo.FscAccounts ADD FscAccPOCapitalRequisition Bit NULL
-- ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaAdministratorEmail Varchar(50) NULL
-- ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaRegionalManagerNumber Varchar(50) NULL

INSERT INTO dbo.HcmUnionDeductionTypes([HcmUdtTypeName], HcmUdtBrief, HcmudtTitle, HcmUdtDescription, HcmUdtDisplayOrder, HcmUdtActive, HcmUdtModBy, HcmUdtModAt)
VALUES ('Parameter', '@HoursWorked', 'Actual Hours Worked', 'Actual Hours Worked', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmUnionDeductionTypes([HcmUdtTypeName], HcmUdtBrief, HcmudtTitle, HcmUdtDescription, HcmUdtDisplayOrder, HcmUdtActive, HcmUdtModBy, HcmUdtModAt)
VALUES ('Parameter', '@HourlyRate', 'Hourly Rate', 'Hourly Rate', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmUnionDeductionTypes([HcmUdtTypeName], HcmUdtBrief, HcmudtTitle, HcmUdtDescription, HcmUdtDisplayOrder, HcmUdtActive, HcmUdtModBy, HcmUdtModAt)
VALUES ('Parameter', '@BaseRate', 'Base Rate', 'Base Rate', 3, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('0', 'Deduction every pay period', 'Take the deduction every pay period', 1, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.HcmUnionDeductionParameters(HcmUdpBrief, HcmudpTitle, HcmUdpDescription, HcmUdpDisplayOrder, HcmUdpActive, HcmUdpModBy, HcmUdpModAt)
VALUES ('@HoursWorked', 'Actual Hours Worked', 'Actual Hours Worked', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmUnionDeductionParameters(HcmUdpBrief, HcmUdpTitle, HcmUdpDescription, HcmUdpDisplayOrder, HcmUdpActive, HcmUdpModBy, HcmUdpModAt)
VALUES ('@HourlyRate', 'Hourly Rate', 'Hourly Rate', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmUnionDeductionParameters(HcmUdpBrief, HcmUdpTitle, HcmUdpDescription, HcmUdpDisplayOrder, HcmUdpActive, HcmUdpModBy, HcmUdpModAt)
VALUES ('@BaseRate', 'Base Rate', 'Base Rate', 3, 1, 'Compass-USA\Data Conversion', GetDate())

-- Add security nodes for HouseCodes - Union Setup UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'TabUnionSetup', 'TabUnionSetup', 'TabUnionSetup', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabUnionSetup', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabUnionSetup', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabUnionSetup'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabUnionSetup\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabUnionSetup', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabUnionSetup\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabUnionSetup', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabUnionSetup%'
-- Add security nodes for HouseCodes - Union Setup UI [End]

Update PayGrades View on CMDB database

-- Add “LastPayrollImportDate” system variable.

-- ALTER TABLE dbo.EmpPTOPlans ADD EmpPtopAccrualInterval INT NULL

/*
CT updated on 9th March 2016 11PM EST
*/

-- Add security nodes for HouseCodes - PT Metrics UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'HospitalContract', 'Hospital & Contract', 'Hospital & Contract', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\HospitalContract', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'HospitalContract', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'LaborControl', 'Labor Control', 'Labor Control', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\LaborControl', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'LaborControl', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'StrategicInit', 'Strategic Initiatives', 'Strategic Initiatives', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\StrategicInit', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'StrategicInit', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'QualityControl', 'Quality Control', 'Quality Control', @DisplayOrder + 4, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\QualityControl', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'QualityControl', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'QualityAssurance', 'Quality Assurance', 'Quality Assurance', @DisplayOrder + 5, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\QualityAssurance', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'QualityAssurance', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Administrative', 'Administrative', 'Administrative', @DisplayOrder + 6, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\Administrative', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'Administrative', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\PTMetrics%'
-- Add security nodes for HouseCodes - PT Metrics UI [End]


/*
ALTER TABLE dbo.HcmPTMetrics ADD HcmPtmCostedTripCycleTime INT NULL
ALTER TABLE dbo.HcmPTMetrics ADD HcmPtmContractedAnnualTrips INT NULL
ALTER TABLE dbo.HcmPTMetrics ADD HcmPTTaskManagementSystem INT NULL
ALTER TABLE dbo.HcmPTMetrics ADD HcmPtmTaskManagementSystemOther VARCHAR(64) NULL
ALTER TABLE dbo.HcmPTMetrics ADD HcmPTAdministratorObjective1 INT NULL
ALTER TABLE dbo.HcmPTMetrics ADD HcmPTAdministratorObjective2 INT NULL
ALTER TABLE dbo.HcmPTMetrics ADD HcmPTAdministratorObjective3 INT NULL
*/

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Thresholds - In House', '', 'Best In Class', 'Thresholds - In House - Best In Class', 'Decimal', 21, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Thresholds - In House', '', 'Target', 'Thresholds - In House - Target', 'Decimal', 22, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Thresholds - Third Party', '', 'Best In Class', 'Thresholds - Third Party - Best In Class', 'Decimal', 23, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Thresholds - Third Party', '', 'Target', 'Thresholds - Third Party - Target', 'Decimal', 24, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTTaskManagementSystems] (HcmPttmsBrief, HcmPttmsTitle, HcmPttmsDescription, HcmPttmsDisplayOrder, HcmPttmsActive, HcmPttmsModBy, HcmPttmsModAt)
VALUES ('TeamThroughput', 'TeamThroughput', 'TeamThroughput', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTTaskManagementSystems] (HcmPttmsBrief, HcmPttmsTitle, HcmPttmsDescription, HcmPttmsDisplayOrder, HcmPttmsActive, HcmPttmsModBy, HcmPttmsModAt)
VALUES ('TeamFlow', 'TeamFlow', 'TeamFlow', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTTaskManagementSystems] (HcmPttmsBrief, HcmPttmsTitle, HcmPttmsDescription, HcmPttmsDisplayOrder, HcmPttmsActive, HcmPttmsModBy, HcmPttmsModAt)
VALUES ('Cerner', 'Cerner', 'Cerner', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTTaskManagementSystems] (HcmPttmsBrief, HcmPttmsTitle, HcmPttmsDescription, HcmPttmsDisplayOrder, HcmPttmsActive, HcmPttmsModBy, HcmPttmsModAt)
VALUES ('Epic', 'Epic', 'Epic', 4, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTTaskManagementSystems] (HcmPttmsBrief, HcmPttmsTitle, HcmPttmsDescription, HcmPttmsDisplayOrder, HcmPttmsActive, HcmPttmsModBy, HcmPttmsModAt)
VALUES ('TeleTracking', 'TeleTracking', 'TeleTracking', 5, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTTaskManagementSystems] (HcmPttmsBrief, HcmPttmsTitle, HcmPttmsDescription, HcmPttmsDisplayOrder, HcmPttmsActive, HcmPttmsModBy, HcmPttmsModAt)
VALUES ('Other', 'Other', 'Other', 6, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('CWYMV', 'Compatible with Your Mission/Values ', 'Compatible With Your Mission/Values ', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('OSMT', 'On-Site Management Team ', 'On-Site Management Team ', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('QPTS', 'Quality of Patient Transportation Staff ', 'Quality of Patient Transportation Staff ', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('ETS', 'Employee Training/Standardization', 'Employee Training/Standardization', 4, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('PVS', 'Price/Value of Service ', 'Price/Value of Service ', 5, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('CRS', 'Corporate and Regional Support ', 'Corporate and Regional Support ', 6, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('HSRPC', 'Health/Safety/Regulatory Performance/Compliance', 'Health/Safety/Regulatory Performance/Compliance', 7, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('TI', 'Technology/Innovation', 'Technology/Innovation', 8, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('CEUS', 'Customer/End User Satisfaction ', 'Customer/End User Satisfaction ', 9, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('ESE', 'Employee Satisfaction/Engagement', 'Employee Satisfaction/Engagement', 10, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('FPR', 'Financial Performance and Reporting', 'Financial Performance and Reporting', 11, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('BACR', 'Benchmarking/Analytic Capability and Reporting', 'Benchmarking/Analytic Capability and Reporting', 12, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('SCMPT', 'Support of Capacity Management/Patient Throughput', 'Support of Capacity Management/Patient Throughput', 13, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('SPS', 'Support of Patient Satisfaction/HCAHPS', 'Support of Patient Satisfaction/HCAHPS', 14, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('DKPIO', 'Departmental Key Performance Indicator Outcomes', 'Departmental Key Performance Indicator Outcomes', 15, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTAdministratorObjectives] (HcmPtaoBrief, HcmPtaoTitle, HcmPtaoDescription, HcmPtaoDisplayOrder, HcmPtaoActive, HcmPtaoModBy, HcmPtaoModAt)
VALUES ('SCDL', 'Synergy/Collaboration with Departments/Leadership ', 'Synergy/Collaboration with Departments/Leadership', 16, 1, 'Compass-Usa\Data Conversion', GetDate())


-- Add security nodes for Budgeting - Administration UI [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\BudgetAdministration'

Update ESMV2.dbo.HirNodes Set HirNodTitle = 'Administration', HirNodFullPath = '\crothall\chimes\fin\Budgeting\Administration', HirNodLevel5 = 'Administration' 
Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\BudgetAdministration'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\Administration'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'AnnualInfo', 'Annual Info', 'Annual Info', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Budgeting\Administration\AnnualInfo', 'crothall', 'chimes', 'fin', 'Budgeting', 'Administration', 'AnnualInfo', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ApproveBudget', 'Approve Budget', 'Approve Budget', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Budgeting\Administration\ApproveBudget', 'crothall', 'chimes', 'fin', 'Budgeting', 'Administration', 'ApproveBudget', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'DeleteBudget', 'Delete Budget', 'Delete Budget', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Budgeting\Administration\DeleteBudget', 'crothall', 'chimes', 'fin', 'Budgeting', 'Administration', 'DeleteBudget', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ExportBudget', 'Export Budget', 'Export Budget', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Budgeting\Administration\ExportBudget', 'crothall', 'chimes', 'fin', 'Budgeting', 'Administration', 'ExportBudget', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BenefitsCost', 'Benefits Cost', 'Benefits Cost', @DisplayOrder + 5, 1, '\crothall\chimes\fin\Budgeting\Administration\BenefitsCost', 'crothall', 'chimes', 'fin', 'Budgeting', 'Administration', 'BenefitsCost', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Budgeting\Administration%'
-- Add security nodes for Budgeting - Administration UI [End]

--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaLOAManagerName Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaLOAManagerEmail Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaHRManagerName Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaHRManagerEmail Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaHRDirectorName Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaHRDirectorEmail Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaProcessHRName Varchar(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaProcessHREmail Varchar(50) NULL

/*
CT updated on 24th March 2016 11PM EST
*/

when publishing to CT and production, please make sure [BudBenefitsCostInitials] has the first 3 rows... BudBenefitsCostInitials = 1, 2, 3

EXEC sp_rename 'EmpEmployeePersonnelActions.EmpEpaHRReview', 'EmpEpaHRReviewType', 'COLUMN'
ALTER TABLE EmpEmployeePersonnelActions ALTER COLUMN EmpEpaHRReviewType INT
ALTER TABLE EmpEmployeePersonnelActions ALTER COLUMN EmpEpaRegionalManagerNumber INT
ALTER TABLE EmpEmployeePersonnelActions ALTER COLUMN EmpEpaData Varchar(1024)

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'CHRA', 'CHRA', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'CHRC', 'CHRC', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'CSHRC', 'CSHRC', 3, 1, 'Compass-USA\Data Conversion', GetDate())

/*
Last production release version 2.04.019 on 30th March 2016 11PM EST
*/
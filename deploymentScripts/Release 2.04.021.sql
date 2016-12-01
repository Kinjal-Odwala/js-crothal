/*
Last production release version 2.04.020 on 10th August 2016 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.021', M_ENV_ENV_Database_Version = '2.04.021' 
Where M_ENV_ENVIRONMENT = 4

-- Add the following system variable.
ScerISWebURL	-	https://ap.crothall.com/ScerISWeb/Client/SearchResults.aspx?ViewDocs=true&SearchParams2=[4]

-- PTO Setup --> Main Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 770
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin'
 
Exec EsmV2.dbo.AppMenuItemUpdate 
	'PTO Setup' --@MenuTitle Varchar(64)
	, 1 --@MenuAction Int
	, 4 --@MenuState Int 
	, @DisplayOrderMenu --@DisplayOrderMenu Int
	, Null --@MenuFilePath varchar(500)
	, @HirNodeParent --@HirNodeParent Int -- fin

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\PTOSetup'

Update EsmV2.dbo.AppMenuItems Set AppMeniID = 'PTOSetup' Where AppMenuItem = 3133
Update EsmV2.dbo.HirNodes Set HirNodBrief = 'PTOSetup', HirNodTitle = 'PTO Setup' Where HirNode = 29514
-- PTO Setup --> Main Menu Insert [End]

-- PTO Setup --> Plan Assignments Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 772
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\PTOSetup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Plan Assignments' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/emp/planAssignment/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\PTOSetup%'

Update EsmV2.dbo.AppMenuItems Set AppMeniID = 'PlanAssignments' Where AppMenuItem = 3134
Update EsmV2.dbo.HirNodes Set HirNodBrief = 'PlanAssignments', HirNodTitle = 'Plan Assignments' Where HirNode = 29515
-- PTO Setup --> Plan Assignments Menu Insert [End] 

-- Move the menu Employee PTO from Setup to PTO Setup [Begin]
-- NOTE: Execute the scripts carefully
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\PTOSetup%'
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\EmployeePTO%'

Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO'
Update EsmV2.dbo.HirNodes Set HirNodeParent = 29514, HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO', HirNodLevel4 = 'PTOSetup' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO'

Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOAssignments'
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTODays'
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOPlans'
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOTypes'
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOYears'
Update EsmV2.dbo.HirNodes Set HirNodeParent = 22440, HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO\PTOAssignments', HirNodLevel4 = 'PTOSetup' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOAssignments'
Update EsmV2.dbo.HirNodes Set HirNodeParent = 22440, HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO\PTODays', HirNodLevel4 = 'PTOSetup' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTODays'
Update EsmV2.dbo.HirNodes Set HirNodeParent = 22440, HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO\PTOPlans', HirNodLevel4 = 'PTOSetup' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOPlans'
Update EsmV2.dbo.HirNodes Set HirNodeParent = 22440, HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO\PTOTypes', HirNodLevel4 = 'PTOSetup' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOTypes'
Update EsmV2.dbo.HirNodes Set HirNodeParent = 22440, HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO\PTOYears', HirNodLevel4 = 'PTOSetup' Where HirNodFullPath = '\crothall\chimes\fin\Setup\EmployeePTO\PTOYears'

Update EsmV2.dbo.HirNodes Set HirNodBrief = 'EmployeePTO', HirNodTitle = 'Employee PTO' Where HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO'

Select * From EsmV2.dbo.AppMenuItems Where AppMeniBrief = 'Employee PTO'
Update EsmV2.dbo.AppMenuItems Set AppMeniDisplayOrder = 771 Where AppMenuItem = 123
-- Move the menu Employee PTO from Setup to PTO Setup [Begin]

INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('0', 'Take the deduction every pay period', 'Take the deduction every pay period', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('1', 'Take the deduction in the pay period where the deduction schedule code is 1 in the processing schedule', 'Take the deduction in the pay period where the deduction schedule code is 1 in the processing schedule', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('2', 'Take the deduction in the pay period where the deduction schedule code is 2 in the processing schedule', 'Take the deduction in the pay period where the deduction schedule code is 2 in the processing schedule', 3, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('3', 'Take the deduction in the pay period where the deduction schedule code is 3 in the processing schedule', 'Take the deduction in the pay period where the deduction schedule code is 3 in the processing schedule', 4, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('4', 'Take the deduction in the pay period where the deduction schedule code is 4 in the processing schedule', 'Take the deduction in the pay period where the deduction schedule code is 4 in the processing schedule', 5, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('5', 'Take the deduction in the pay period where the deduction schedule code is 1 or 3 in the processing schedule', 'Take the deduction in the pay period where the deduction schedule code is 1 or 3 in the processing schedule', 6, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeductionFrequencyTypes(HcmDftBrief, HcmDftTitle, HcmDftDescription, HcmDftDisplayOrder, HcmDftActive, HcmDftModBy, HcmDftModAt)
VALUES('6', 'Take the deduction in the pay period where the deduction schedule code is 2 or 4 in the processing schedule', 'Take the deduction in the pay period where the deduction schedule code is 2 or 4 in the processing schedule', 7, 1, 'Compass-USA\Data Conversion', GetDate())

Select * From dbo.HcmPTMetricTypes

Update dbo.HcmPTMetricTypes Set HcmPtmtTitle = 'Total Paid Labor Actual PFC', HcmPtmtDescription = 'Total Paid Labor Actual PFC' Where HcmPTMetricType = 1
Update dbo.HcmPTMetricTypes Set HcmPtmtTitle = 'Total Hours Labor Actual PFC', HcmPtmtDescription = 'Total Hours Labor Actual PFC' Where HcmPTMetricType = 25

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Paid Labor Actual Non-PFC', 'Total Paid Labor Actual Non-PFC', 'Decimal', 31, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Hours Labor Actual Non-PFC', 'Total Hours Labor Actual Non-PFC', 'Decimal', 32, 1, 'Compass-Usa\Data Conversion', GetDate())

INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpEthnicityType', 'American Indian or Alaskan', 'American Indian or Alaskan Native', 1, 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 12th October 2016 11PM EST
*/

--ALTER TABLE dbo.EmpJobCodeTypes ADD EmpJobctDenyViewEmployee BIT NULL
Update dbo.EmpJobCodeTypes Set EmpJobctDenyViewEmployee = 0 

-- Ad-Hoc Payroll report updates [Begin]
Select * From dbo.AppModules
Select * From dbo.AppModuleColumns Where AppModcReferenceTableName = 'AppTransactionStatusTypes' -- EmpJobCodeTypes, PayPayCodes, FscYears, EmpWorkShifts, AppTransactionStatusTypes
Select * From dbo.AppModuleColumns Where AppModule = 10

Update AppModules Set AppModDescription = 'PayEmployeeWeeklyPayrolls' Where AppModTitle = 'Payroll'

Update dbo.AppModuleColumns 
Set AppModcFilter = 0
Where AppModule = 10 And AppModcDescription = 'Job'

Update dbo.AppModuleColumns 
Set AppModcTitle = 'PayPayCode', AppModcType = 'Int', AppModcValidation = 'Int', AppModcReferenceTableName = 'PayPayCodes', AppModcLength = Null
Where AppModule = 10 And AppModcDescription = 'Pay Code'

Update dbo.AppModuleColumns 
Set AppModcTitle = 'EmpWorkShift', AppModcType = 'Int', AppModcValidation = 'Int', AppModcReferenceTableName = 'EmpWorkShifts', AppModcLength = Null
Where AppModule = 10 And AppModcDescription = 'Work Shift'

Update dbo.AppModuleColumns 
Set AppModcTitle = 'EmpJobCodeType', AppModcType = 'Int', AppModcValidation = 'Int', AppModcReferenceTableName = 'EmpJobCodeTypes', AppModcLength = Null
Where AppModule = 10 And AppModcDescription = 'Job Code'

Update dbo.AppModuleColumns 
Set AppModcTitle = 'AppTransactionStatusType', AppModcType = 'Int', AppModcValidation = 'Int', AppModcReferenceTableName = 'AppTransactionStatusTypes', AppModcLength = Null
Where AppModule = 10 And AppModcDescription = 'Status'

Update dbo.AppModuleColumns 
Set AppModcTitle = 'FscYear', AppModcType = 'Int', AppModcValidation = 'Int', AppModcReferenceTableName = 'FscYears', AppModcLength = Null
Where AppModule = 10 And AppModcDescription = 'Fiscal Year'

-- Add the following key into adh-->act-->web.config file
<add key="FinPayPath" value="/net/crothall/chimes/fin/pay/act/provider.aspx?moduleId=pay" />
-- Ad-Hoc Payroll report updates [End]

--ALTER TABLE dbo.EmpPTOAssignments ADD EmpPtoaActive BIT NULL
--ALTER TABLE dbo.EmpPTOAssignments ADD EmpPTOPlanAssignment INT NULL

INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpEthnicityType', 'Hawaiian or Pacific Islander', 'Native Hawaiian or Other Pacific Islander', 1, 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 6th November 2016 11PM EST
*/

--ALTER TABLE dbo.EmpEmployeeTypeMappings ADD EmpEtmBrief VARCHAR(16) NULL

INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'AL', 'D', 'MS', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'AR', 'S', 'H', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'CO', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'DC', 'D', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'DC', 'S', 'R', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'DC', 'S', 'H', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'DE', 'D', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'GA', 'S', 'A', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'GA', 'M', 'C', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'GA', 'H', 'E', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'GA', 'B1', 'B', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'GA', 'D1', 'D', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'HI', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'HI', 'S', 'C', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'HI', 'S', 'N', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'ID', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'IN', 'M', '', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'KS', 'M', 'J', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'LA', 'S', 'N', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MA', 'S', 'FS', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MA', 'S', 'B', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MD', 'F', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'ME', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MN', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MN', 'S', 'SM', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MN', 'S', 'SMA', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MS', 'E', 'MA', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MS', 'B', 'MB', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MS', 'H', 'HF', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'MT', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'ND', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NE', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NJ', 'A', 'S', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NJ', 'B', 'MJ', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NJ', 'C', 'MS', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NJ', 'D', 'H', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NJ', 'E', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NM', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NY', 'S', 'SH', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'NY', 'S', 'MB', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'OK', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'OR', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'RI', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'SC', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'UT', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'VT', 'C', 'CU', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'VT', 'F', 'MB', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'VT', 'F', 'CUB', 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmBrief, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpMaritalStatusStateTaxType', 'WI', 'S', 'X', 1, 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 27th November 2016 11PM EST
*/

-- Copy the following files manually
js folder
../emp/planAssignment/usr/main.js
../rev/apSearch/usr/main.js
../rpt/ssrsReport/usr/controllers.js

/*
Last production release version 2.04.021 on 30th November 2016 11PM EST
*/
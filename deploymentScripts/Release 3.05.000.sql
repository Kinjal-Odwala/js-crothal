/*
Last production release version 3.04.000 on 24th October, 2018 - 11PM EST
*/
Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS

Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.05.000', M_ENV_ENV_Database_Version = '3.05.000'
Where M_ENV_ENVIRONMENT = 4

-- Budgeting --> Forecast Snapshot Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 107
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting'

Exec EsmV2.dbo.AppMenuItemUpdate
	'Forecast Snapshot' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/bud/snapshot/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\ForecastSnapshot'

Update EsmV2.dbo.AppMenuItems Set AppMeniBrief = 'Snapshot', AppMeniTitle = 'Forecast Snapshot', AppMeniID = 'ForecastSnapshot' Where AppMeniTitle = 'Forecast Snapshot'
Update EsmV2.dbo.HirNodes Set HirNodBrief = 'ForecastSnapshot', HirNodTitle = 'Forecast Snapshot'  Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\ForecastSnapshot'
-- Budgeting --> Forecast Snapshot Menu Insert [End] 

-- Add security nodes for Budgeting - Forecast Snapshot UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Budgeting\ForecastSnapshot'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Budgeting\ForecastSnapshot\Write', 'crothall', 'chimes', 'fin', 'Budgeting', 'ForecastSnapshot', 'Write', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'UnlockSnapshot', 'Unlock Snapshot', 'Unlock Snapshot', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Budgeting\ForecastSnapshot\UnlockSnapshot', 'crothall', 'chimes', 'fin', 'Budgeting', 'ForecastSnapshot', 'UnlockSnapshot', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Budgeting\ForecastSnapshot%'
-- Add security nodes for Budgeting - Forecast Snapshot UI [End]

INSERT INTO dbo.HcmDivisions(HcmDivBrief, HcmDivTitle, HcmDivDescription, HcmDivProfileCode, HcmDivDisplayOrder, HcmDivActive, HcmDivModBy, HcmDivModAt)
VALUES ('BE0000', 'Healthcare Division', 'Healthcare Division', 'BE', 1, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO dbo.HcmDivisions(HcmDivBrief, HcmDivTitle, HcmDivDescription, HcmDivProfileCode, HcmDivDisplayOrder, HcmDivActive, HcmDivModBy, HcmDivModAt)
VALUES ('BF0000', 'Facilities Mgmt Division', 'Facilities Mgmt Division', 'BF', 2, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO dbo.HcmDivisions(HcmDivBrief, HcmDivTitle, HcmDivDescription, HcmDivProfileCode, HcmDivDisplayOrder, HcmDivActive, HcmDivModBy, HcmDivModAt)
VALUES ('BL0000', 'Laundry Division', 'Laundry Division', 'BL', 3, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO dbo.HcmDivisions(HcmDivBrief, HcmDivTitle, HcmDivDescription, HcmDivProfileCode, HcmDivDisplayOrder, HcmDivActive, HcmDivModBy, HcmDivModAt)
VALUES ('BP0000', 'POM Division', 'POM Division', 'BP', 4, 1, 'Compass-Usa\Data Conversion', GetDate())

--ALTER TABLE dbo.BudMopSnapshots ADD BudMopsLocked Bit NULL
--ALTER TABLE dbo.BudMopSnapshots ADD BudMopsUnlockRequested Bit NULL
--ALTER TABLE dbo.PurVendors ADD PurVenClientMandated Bit NULL
--ALTER TABLE dbo.PurVendors ADD PurVenNonCompliant Bit NULL
--ALTER TABLE dbo.PurItems ADD PurIteClientMandated Bit NULL
--ALTER TABLE dbo.PurItems ADD PurIteNonCompliant Bit NULL
--ALTER TABLE dbo.HcmEVSMetricTypes ADD HcmEvsmtRegExpValidation VARCHAR(256) NULL
--ALTER TABLE dbo.HcmEVSMetricTypes ADD HcmEvsmtValidationMessage VARCHAR(256) NULL

/*
CT updated on 28th November, 2018 - 11PM EST
*/

--ALTER TABLE dbo.HcmJobs ADD HcmJobEmailAddress VARCHAR(50) NULL
--ALTER TABLE dbo.HcmPTMetrics ADD HcmPtmBudgetedTPPH DECIMAL(18, 2) NULL

-- Add EmailAddress security nodes in HouseCodes - Jobs [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'EmailAddress', 'Email Address', 'Email Address', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\EmailAddress', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'EmailAddress', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\EmailAddress'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\EmailAddress\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'EmailAddress', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\EmailAddress\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'EmailAddress', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\HouseCodeSetup\Jobs\EmailAddress%'
-- Add EmailAddress security nodes in HouseCodes - Jobs [End]

Select * From dbo.HcmEVSMetricTypes Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtTitle = 'Hospital Financial Budget'
Select * From dbo.HcmEVSMetricTypes Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtTitle = 'Hospital Financial Actuals'

Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Hospital EVS Financial Budget' Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtTitle = 'Hospital Financial Budget'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtTitle = 'Hospital EVS Financial Actuals' Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtTitle = 'Hospital Financial Actuals'

Select * From dbo.HcmEVSMetricTypes order By HcmEvsmtDisplayOrder

INSERT INTO dbo.HcmEVSMetricTypes(HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('Quality Partnership', '', 'Contracted', 'Contracted', 'Decimal', 36, 1, 'Compass-Usa\Data Conversion', GetDate())
Update dbo.HcmEVSMetricTypes Set HcmEvsmtDisplayOrder = HcmEvsmtDisplayOrder + 1 Where HcmEVSMetricType >= 36 And HcmEVSMetricType <= 73

INSERT INTO dbo.HcmEVSMetricTypes(HcmEvsmtSubType, HcmEvsmtBrief, HcmEvsmtTitle, HcmEvsmtDescription, HcmEvsmtDataType, HcmEvsmtDisplayOrder, HcmEvsmtActive, HcmEvsmtModBy, HcmEvsmtModAt)
VALUES ('EVS Statistics', '', 'Left Without Being Seen', 'Left Without Being Seen', 'Integer', 53, 1, 'Compass-Usa\Data Conversion', GetDate())
Update dbo.HcmEVSMetricTypes Set HcmEvsmtDisplayOrder = HcmEvsmtDisplayOrder + 1 Where HcmEVSMetricType >= 52 And HcmEVSMetricType <= 73

Update dbo.HcmEVSMetricTypes 
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99' 
Where HcmEvsmtTitle = 'Regular Productive Hours'

Update dbo.HcmEVSMetricTypes 
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99' 
Where HcmEvsmtTitle = 'Overtime Productive Hours'

Update dbo.HcmEVSMetricTypes 
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99' 
Where HcmEvsmtTitle = 'Non-Productive Hours'

Update dbo.HcmEVSMetricTypes 
Set HcmEvsmtRegExpValidation = '^-?\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99' 
Where HcmEvsmtTitle = 'Regular Productive Dollars'

Update dbo.HcmEVSMetricTypes 
Set HcmEvsmtRegExpValidation = '^-?\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99' 
Where HcmEvsmtTitle = 'Overtime Productive Dollars'

Update dbo.HcmEVSMetricTypes 
Set HcmEvsmtRegExpValidation = '^-?\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99' 
Where HcmEvsmtTitle = 'Non-Productive Dollars'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'Quality Assurance' And HcmEvsmtDataType = 'Decimal'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'Audit Scores' And HcmEvsmtDataType = 'Decimal'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'Competency Training' And HcmEvsmtDataType = 'Decimal'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^-?\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'Quality Partnership' And HcmEvsmtDataType = 'Decimal'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtDataType = 'Decimal'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^-?\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtDataType = 'Decimal' And HcmEvsmtTitle = 'Hospital EVS Financial Budget'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^-?\d{0,16}(\.\d{1,2})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.99'
Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtDataType = 'Decimal' And HcmEvsmtTitle = 'Hospital EVS Financial Actuals'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtDataType = 'Decimal', HcmEvsmtRegExpValidation = '^\d{0,16}(\.\d{1,1})?$', HcmEvsmtValidationMessage = 'Please enter numeric value. Example 99.9'
Where HcmEvsmtSubType = 'Management Staff'

Update dbo.HcmEVSMetricTypes
Set HcmEvsmtRegExpValidation = '^\d{1,9}$', HcmEvsmtValidationMessage = 'Please enter valid number.'
Where HcmEvsmtSubType = 'EVS Statistics' And HcmEvsmtDataType = 'Integer' 

Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'Yes' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'RRM'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'Yes' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Unit Director'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'Yes' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Assistant Unit Director'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'Yes' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Ops Manager'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Patient Flow Coordinator'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Patient Experience Manager'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Office Manager'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'HR'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Payroll'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Clerical'
Update dbo.HcmEVSMetricTypes Set HcmEvsmtBrief = 'No' Where HcmEvsmtSubType = 'Management Staff' And HcmEvsmtTitle = 'Other'

/*
CT updated on 12th December, 2018 - 11PM EST
*/

/*
Last production release version 3.05.000 on 19th December, 2018 - 11PM EST
*/
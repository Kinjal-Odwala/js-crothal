/*
Last production release version 2.04.022 on 29th March 2017 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.023', M_ENV_ENV_Database_Version = '2.04.023' 
Where M_ENV_ENVIRONMENT = 4


-- Check before executing the following scripts [Already updated on CT and Production]
--------------------------------------------------------------------------------------
Select * From dbo.BudEmployeeLocks where BudEmplWeeklyHours is not null
ALTER TABLE [dbo].[BudEmployeeLocks] DROP COLUMN BudEmplWeeklyHours

-- Add security nodes for action menu items in Employee Wizard [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'HRNewHire', 'HR NewHire', 'HR NewHire', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\Employees\Wizard\HRNewHire', 'crothall', 'chimes', 'fin', 'Setup', 'Employees', 'Wizard', 'HRNewHire', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'HRReHire', 'HR ReHire', 'HR ReHire', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Setup\Employees\Wizard\HRReHire', 'crothall', 'chimes', 'fin', 'Setup', 'Employees', 'Wizard', 'HRReHire', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\Employees\Wizard%'
-- Add security nodes for action menu items in Employee Wizard [End]
--------------------------------------------------------------------------------------

-- Select * From dbo.AppGenericImports Where AppgiObject = 'AutoEmployeeImport'
-- Select * From dbo.EmpEmployeeONBImports

Insert Into dbo.EmpEmployeeONBImports
	( EmpEmployeeGeneral
	, EmpEONBiBatch
	, EmpEONBiImported
	, EmpEONBiValid
	, EmpEONBiNotes
	, EmpEONBiRCMCostCenterUnit			-- RCM_CostCenterUnit
	, EmpEONBiEmployeeLogin				-- EmployeeLogin
	, EmpEONBiFirstName					-- FirstName
	, EmpEONBiLastName					-- LastName
	, EmpEONBiMiddleName				-- MiddleName
	, EmpEONBiMailAddress1				-- MailAddress
	, EmpEONBiMailAddress2				-- MailAddress2
	, EmpEONBiMailCity					-- MailCity
	, EmpEONBiMailAddressState			-- MailAddressState
	, EmpEONBiMailZip					-- MailZip
	, EmpEONBiDaytimePhoneAC			-- DaytimePhoneAC
	, EmpEONBiDaytimePhoneNumber		-- DaytimePhoneNum
	, EmpEONBiEveningPhoneAC			-- EveningPhoneAC
	, EmpEONBiEveningPhoneNumber		-- EveningPhoneNum
	, EmpEONBiEmail						-- Email
	, EmpEONBiSSN						-- SSN
	, EmpEONBiRCMJobTitle				-- RCM_JobTitle
	, EmpEONBiWOTCStartDate				-- WOTCStartDate
	, EmpEONBiJobAccountCode			-- JobAccountCode
	, EmpEONBiRCMUnion					-- RCM_Union
	, EmpEONBiCGNAONBAltPayA			-- CGNA_ONB_AltPayA
	, EmpEONBiCGNAONBAltPayB			-- CGNA_ONB_AltPayB
	, EmpEONBiCGNAONBAltPayC			-- CGNA_ONB_AltPayC
	, EmpEONBiCGNAONBAltPayD			-- CGNA_ONB_AltPayD
	, EmpEONBiCGNAONBCrothallUnion		-- CGNA_ONB_CROTHALL_UNION
	, EmpEONBiJobPayRate				-- JobPayRate
	, EmpEONBiCGNAONBGender				-- CGNA_ONB_GENDER
	, EmpEONBiCGNAONBEthnicity			-- CGNA_ONB_ETHNICITY
	, EmpEONBiRCMEthnicity				-- RCM_Ethnicity
	, EmpEONBiDateOfBirth				-- DateOfBirth
	, EmpEONBiW4TotalAllow				-- W4TotalAllow
	, EmpEONBiW4MaritalStatus			-- W4MaritalStatus
	, EmpEONBiW4TwoEarnerAmount			-- W4TwoEarnerAmt
	, EmpEONBiWorkState					-- WorkState
	, EmpEONBiWorkStateFilingStatus		-- WorkStateFilingStatus
	, EmpEONBiResidenceFilingStatus		-- ResidenceFilingStatus
	, EmpEONBiWorkStateAllowances		-- WorkStateAllowances
	, EmpEONBiWorkStateAdditionalTax	-- WorkStateAdditionalTax
	, EmpEONBiCGNAONBCrothallLocal		-- CGNA_ONB_CROTHALL_LOCAL
	, EmpEONBiCGNAONBCrothallOpt		-- CGNA_ONB_CROTHALL_OPT
	, EmpEONBiCGNAONBVetStatus			-- CGNA_ONB_VETSTATUS
	, EmpEONBiCGNAONBRace				-- CGNA_ONB_RACE
	, EmpEONBiRCMRace					-- RCM_Race
	, EmpEONBiCGNAONBDisabilityStatus	-- CGNA_ONB_DISABILITYSTATUS
	, EmpEONBiPSDCode					-- PSDCode
	, EmpEONBiBusinessPSDCode			-- BusinessPSDCode
	, EmpEONBiRCMWOTCNumber				-- RCM_WOTCNumber
	, EmpEONBiStandardPaymentMethod		-- StandardPaymentMethod
	, EmpEONBiDirDepBank1Name			-- DirDep_Bank1_Name
	, EmpEONBiDirDepBank1RoutNumber		-- DirDep_Bank1_RoutNum
	, EmpEONBiDirDepBank1AccountNumber	-- DirDep_Bank1_AccountNum
	, EmpEONBiDirDepBank1Type			-- DirDep_Bank1_Type
	, EmpEONBiDirDepBank1Amount			-- DirDep_Bank1_Amount
	, EmpEONBiDirDepBank1View			-- DirDep_Bank1_View
	, EmpEONBiDirDepBank2Name			-- DirDep_Bank2_Name
	, EmpEONBiDirDepBank2RoutNumber		-- DirDep_Bank2_RoutNum
	, EmpEONBiDirDepBank2AccountNumber	-- DirDep_Bank2_AccountNum
	, EmpEONBiDirDepBank2Type			-- DirDep_Bank2_Type
	, EmpEONBiDirDepBank2Amount			-- DirDep_Bank2_Amount
	, EmpEONBiDirDepBank2View			-- DirDep_Bank2_View
	, EmpEONBiRCMGender					-- RCM_GENDER
	, EmpEONBiHouseCode
	, EmpEONBiScheduledHours
	, EmpEONBiEthnicityTypeTitle
	, EmpEONBiMultiRace1
	, EmpEONBiMultiRace2
	, EmpEONBiMultiRace3
	, EmpEONBiMultiRace4
	, EmpEONBiMultiRace5
	, EmpEONBiPrimaryStateTitle
	, EmpEONBiSecondaryStateTitle
	, EmpEONBiMaritalStatusFederalTaxTypeTitle
	, EmpEONBiMaritalStatusStateTaxTypePrimaryTitle
	, EmpEONBiMaritalStatusStateTaxTypeSecondaryTitle
	, EmpEONBiUnionTitle
	, EmpEONBiChangeStatusCode
	, EmpEONBiStatusCategoryTitle
	, EmpEONBiGenderTypeTitle
	, EmpEONBiCrtdBy
	, EmpEONBiCrtdAt
	)
Select AppgiCol105
	, AppgiBatch
	, AppgiImported
	, AppgiCol109
	, AppgiNote
	, AppgiCol001			-- RCM_CostCenterUnit
	, AppgiCol002			-- EmployeeLogin
	, AppgiCol003			-- FirstName
	, AppgiCol004			-- LastName
	, AppgiCol005			-- MiddleName
	, AppgiCol006			-- MailAddress
	, AppgiCol007			-- MailAddress2
	, AppgiCol008			-- MailCity
	, AppgiCol009			-- MailAddressState
	, AppgiCol010			-- MailZip
	, AppgiCol011			-- DaytimePhoneAC
	, AppgiCol012			-- DaytimePhoneNum
	, AppgiCol013			-- EveningPhoneAC
	, AppgiCol014			-- EveningPhoneNum
	, AppgiCol015			-- Email
	, AppgiCol016			-- SSN
	, AppgiCol017			-- RCM_JobTitle
	, AppgiCol018			-- WOTCStartDate
	, AppgiCol019			-- JobAccountCode
	, AppgiCol020			-- RCM_Union
	, AppgiCol021			-- CGNA_ONB_AltPayA
	, AppgiCol022			-- CGNA_ONB_AltPayB
	, AppgiCol023			-- CGNA_ONB_AltPayC
	, AppgiCol024			-- CGNA_ONB_AltPayD
	, AppgiCol025			-- CGNA_ONB_CROTHALL_UNION
	, AppgiCol026			-- JobPayRate
	, AppgiCol027			-- CGNA_ONB_GENDER
	, AppgiCol028			-- CGNA_ONB_ETHNICITY
	, AppgiCol029			-- RCM_Ethnicity
	, AppgiCol030			-- DateOfBirth
	, AppgiCol031			-- W4TotalAllow
	, AppgiCol032			-- W4MaritalStatus
	, AppgiCol033			-- W4TwoEarnerAmt
	, AppgiCol034			-- WorkState
	, AppgiCol035			-- WorkStateFilingStatus
	, AppgiCol036			-- ResidenceFilingStatus
	, AppgiCol037			-- WorkStateAllowances
	, AppgiCol038			-- WorkStateAdditionalTax
	, AppgiCol039			-- CGNA_ONB_CROTHALL_LOCAL
	, AppgiCol040			-- CGNA_ONB_CROTHALL_OPT
	, AppgiCol041			-- CGNA_ONB_VETSTATUS
	, AppgiCol042			-- CGNA_ONB_RACE
	, AppgiCol043			-- RCM_Race
	, AppgiCol044			-- CGNA_ONB_DISABILITYSTATUS
	, AppgiCol045			-- PSDCode
	, AppgiCol046			-- BusinessPSDCode
	, AppgiCol047			-- RCM_WOTCNumber
	, AppgiCol048			-- StandardPaymentMethod
	, AppgiCol049			-- DirDep_Bank1_Name
	, AppgiCol050			-- DirDep_Bank1_RoutNum
	, AppgiCol051			-- DirDep_Bank1_AccountNum
	, AppgiCol052			-- DirDep_Bank1_Type
	, AppgiCol053			-- DirDep_Bank1_Amount
	, AppgiCol054			-- DirDep_Bank1_View
	, AppgiCol055			-- DirDep_Bank2_Name
	, AppgiCol056			-- DirDep_Bank2_RoutNum
	, AppgiCol057			-- DirDep_Bank2_AccountNum
	, AppgiCol058			-- DirDep_Bank2_Type
	, AppgiCol059			-- DirDep_Bank2_Amount
	, AppgiCol060			-- DirDep_Bank2_View
	, AppgiCol061			-- RCM_GENDER
	, AppgiCol091			-- HouseCode
	, AppgiCol092			-- ScheduledHours
	, AppgiCol093			-- EthnicityTypeTitle
	, AppgiCol094			-- MultiRace1
	, AppgiCol095			-- MultiRace2
	, AppgiCol096			-- MultiRace3
	, AppgiCol097			-- MultiRace4
	, AppgiCol098			-- MultiRace5
	, AppgiCol099			-- PrimaryStateTitle
	, AppgiCol100			-- SecondaryStateTitle
	, AppgiCol101			-- MaritalStatusFederalTaxTypeTitle
	, AppgiCol102			-- MaritalStatusStateTaxTypePrimaryTitle
	, AppgiCol103			-- MaritalStatusStateTaxTypeSecondaryTitle
	, AppgiCol104			-- UnionTitle
	, AppgiCol107			-- ChangeStatusCode
	, AppgiCol108			-- StatusCategoryTitle
	, AppgiCol110			-- GenderType
	, Null
	, AppgiCol106			-- ImportedAt	
From dbo.AppGenericImports
Where  AppgiObject = 'AutoEmployeeImport'

Select * From EmpEmployeeONBImports

Update EI
Set EmpEONBiBatch = Batch.NewBatch
From dbo.EmpEmployeeONBImports EI
	Inner Join (Select EmpEONBiBatch, ROW_NUMBER() OVER (ORDER BY [EmpEONBiBatch] Asc) As NewBatch From dbo.EmpEmployeeONBImports Group By EmpEONBiBatch) Batch
On EI.EmpEONBiBatch = Batch.EmpEONBiBatch

/* Create new Sequence Object */
CREATE SEQUENCE EmployeeONBImportBatchNumber AS INT
START WITH 29 -- This is the Number you want to start the Sequence with (Maximum Batch Number + 1)
INCREMENT BY 1 -- This is how you want to increment the number

/* This will display the current value of the Sequence Object */
SELECT CURRENT_VALUE FROM sys.sequences WHERE name = 'EmployeeONBImportBatchNumber'


-- Setup --> Pay Rate Types Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 820
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Pay Rate Types' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/pay/payRateType/usr/markup.htm'
	, @HirNodeParent
	
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup%' Order By HirNode

Update EsmV2.dbo.HirNodes Set HirNodBrief = 'PayRateTypes', HirNodTitle = 'Pay Rate Types' Where HirNode = 34708
-- Setup --> Pay Rate Types Menu Insert [End] 


-- Employee Onboarding updates [Begin]
Select * From dbo.EmpEmployeeTypeMappings Where EmpEtmBrief = 'NJ'
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt, EmpEtmBrief)
VALUES ('EmpMaritalStatusStateTaxType', 'B3', 'M', 1, 'Compass-USA\Data Conversion', GetDate(), 'NJ')
Update EmpEmployeeTypeMappings Set EmpEtmTypeTitle = 'D3' Where EmpEtmBrief = 'NJ' And EmpEtmTitle = 'X'

Select * From dbo.EmpEmployeeTypeMappings Where EmpEtmBrief = 'MS'
Update EmpEmployeeTypeMappings Set EmpEtmTypeTitle = 'E2' Where EmpEtmBrief = 'MS' And EmpEtmTitle = 'MA'
Update EmpEmployeeTypeMappings Set EmpEtmTypeTitle = 'B1' Where EmpEtmBrief = 'MS' And EmpEtmTitle = 'MB'

Select * From dbo.EmpEmployeeTypeMappings Where EmpEtmBrief = 'CT'
Update EmpEmployeeTypeMappings Set EmpEtmTypeTitle = 'P' Where EmpEtmBrief = 'CT' And EmpEtmTitle = 'H'

INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt, EmpEtmBrief)
VALUES ('EmpMaritalStatusStateTaxType', 'M', 'QW', 1, 'Compass-USA\Data Conversion', GetDate(), 'CT')
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt, EmpEtmBrief)
VALUES ('EmpMaritalStatusStateTaxType', 'B5', 'H', 1, 'Compass-USA\Data Conversion', GetDate(), 'CT')
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt, EmpEtmBrief)
VALUES ('EmpMaritalStatusStateTaxType', 'T', 'S', 1, 'Compass-USA\Data Conversion', GetDate(), 'CT')
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt, EmpEtmBrief)
VALUES ('EmpMaritalStatusStateTaxType', 'Y', 'X', 1, 'Compass-USA\Data Conversion', GetDate(), 'CT')
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt, EmpEtmBrief)
VALUES ('EmpMaritalStatusStateTaxType', 'E', 'M', 1, 'Compass-USA\Data Conversion', GetDate(), 'CT')
-- Employee Onboarding updates [End]

--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCPIPercentage DECIMAL(5, 2) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCPIAmount DECIMAL(18, 2) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCPIDate DATETIME NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCPIECIWaived BIT NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCPIEnteredBy VARCHAR(50) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCPIEnteredAt DATETIME NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevCPIPercentage DECIMAL(5, 2) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevCPIAmount DECIMAL(18, 2) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevCPIDate DATETIME NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevCPIECIWaived BIT NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevCPIEnteredBy VARCHAR(50) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevCPIEnteredAt DATETIME NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevPrevCPIPercentage DECIMAL(5, 2) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevPrevCPIAmount DECIMAL(18, 2) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevPrevCPIDate DATETIME NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevPrevCPIECIWaived BIT NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevPrevCPIEnteredBy VARCHAR(50) NULL
--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPrevPrevCPIEnteredAt DATETIME NULL

-- Add Read/Write security nodes for HcmHoucCPIPercentage, HcmHoucCPIAmount, HcmHoucCPIDate and HcmHoucCPIECIWaived fields in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CPIPercentage', 'CPI Percentage', 'CPI Percentage', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIPercentage', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIPercentage', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIPercentage'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIPercentage\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIPercentage', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIPercentage\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIPercentage', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CPIAmount', 'CPI Amount', 'CPI Amount', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIAmount', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIAmount', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIAmount'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIAmount\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIAmount', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIAmount\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIAmount', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CPIDate', 'CPI Date', 'CPI Date', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIDate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIDate', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIDate'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIDate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIDate', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIDate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIDate', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CPIECIWaived', 'CPI/ECI Waived', 'CPI/ECI Waived', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIECIWaived', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIECIWaived', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIECIWaived'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIECIWaived\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIECIWaived', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\CPIECIWaived\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'CPIECIWaived', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for HcmHoucCPIPercentage, HcmHoucCPIAmount, HcmHoucCPIDate and HcmHoucCPIECIWaived fields in House Code[End]

/*
CT updated on 31st May 2017 11PM EST
*/

--Update the following key values in TeamFin service app.config file
<add key="EmployeeImportNotificationEmail" value="Rebecca.larson@compass-usa.com"/>

--Add the following key values in TeamFin service app.config file
<add key="LogFilePath" value="E:\Sites\TeamFin\Service\logs\"/>
<add key="LogEmailAddress" value="ray.terreforte@compass-usa.com;chandru.balekkala@iicorporate.com"/>

-- Copy the following files manually
js folder
../emp/planAssignment/usr/main.js
../emp/employeePTOSetup/usr/main.js
../rpt/ssrsReport/usr/controllers.js

/*
Last production release version 2.04.023 on 21st June 2017 11PM EST
*/
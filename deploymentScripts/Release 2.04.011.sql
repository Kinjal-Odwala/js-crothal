/*
Last production release version 2.04.010 on 10th July 2013 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.011', M_ENV_ENV_Database_Version = '2.04.011' 
Where M_ENV_ENVIRONMENT = 4

/*
ALTER TABLE [TeamFinV2].[dbo].[EmpEmployeeGenerals] ADD HcmEPayGroupType INT NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ALTER COLUMN HcmJobTaxId VARCHAR(50)
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmHoucManagerAlternateEmail VARCHAR(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountReceivables] ADD HcmHouseCodeJob INT NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountPayableInvoices] ADD RevApiTransmittalHouseCode VARCHAR(12) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountPayableInvoices] ADD RevApiTransmittalGLAccount VARCHAR(6) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountPayableInvoices] ADD RevApiTransmittalAmount DECIMAL(17, 2) NULL

ALTER TABLE [TeamFinV2].[dbo].[RevAccountReceivablePaidImports] ADD RevAccrpiCustomerNumber VARCHAR(8) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountReceivablePaidImports] ADD RevAccrpiCustomerName VARCHAR(30) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountReceivablePaidImports] ADD RevAccrpiHouseCodeName VARCHAR(30) NULL
ALTER TABLE [TeamFinV2].[dbo].[RevAccountReceivablePaidImports] ADD RevAccrpiOpenAmount DECIMAL(15, 2) NULL

ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol101 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol102 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol103 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol104 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol105 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol106 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol107 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol108 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol109 Varchar(Max) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppGenericImports] ADD AppgiCol110 Varchar(Max) NULL
*/

Update EG
Set EG.HcmEPayGroupType = HC.HcmEPayGroupType
From dbo.HcmHouseCodes HC Inner Join dbo.EmpEmployeeGenerals EG On HC.HcmHouseCode = EG.HcmHouseCode

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (2, 'HcmEPayGroupType', 'EPay Pay Group', 102, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'HcmEPayGroupTypes', Null, Null, 150, Null, Null)

-- Invoice Items Ad-Hoc Report [Begin]

Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModEditable, AppModHouseCodeAssociated)
Values ('Invoice Items', 'InvoiceItems', 1, 1, 'compass-usa\data conversion', GetDate(), 1, 1)

Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (11, 3, 1, 'compass-usa\data conversion', GetDate())

Update AppModuleColumns Set AppModcAdHocActive = 1 Where AppModule = 3 And AppModcTitle = 'RevInvoice'

-- Invoice Items Ad-Hoc Report [End]

-- Add the following key in app->act web.config file
<add key="ExcelTemplateFilePath" value="E:\Sites\iiDev\TeamFin\js\crothall\chimes\fin\app\state\usr\" />

-- Add the following key in rev->act web.config file
<add key="TaxRatesTemplateFilePath" value="E:\Sites\iiDev\TeamFin\js\crothall\chimes\fin\rev\taxRate\usr\" />

-- Add the following key in hcm->act web.config file
<add key="ExcelTemplateFilePath" value="E:\Sites\iiDev\TeamFin\js\crothall\chimes\fin\hcm\ePaySiteSurvey\usr\" />

-- Add the following key in adh->act web.config file
<httpRuntime executionTimeout="300" />

-- Add the following system variable name and values
EmployeeImportMinimumRecords - 10

-- Payroll --> EPay Site Survey Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 708
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'EPay Site Survey' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/hcm/ePaySiteSurvey/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup%'
-- Payroll --> EPay Site Survey  Menu Insert [End] 

-- EPay Site Survey [Begin]
INSERT INTO dbo.HcmReportingFrequencyTypes(HcmRftBrief, HcmRftTitle, HcmRftDescription, HcmRftDisplayOrder, HcmRftActive, HcmRftModBy, HcmRftModAt)
VALUES ('Weekly', 'Weekly', 'Weekly', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmReportingFrequencyTypes(HcmRftBrief, HcmRftTitle, HcmRftDescription, HcmRftDisplayOrder, HcmRftActive, HcmRftModBy, HcmRftModAt)
VALUES ('Bi-Weekly', 'Bi-Weekly', 'Bi-Weekly', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmReportingFrequencyTypes(HcmRftBrief, HcmRftTitle, HcmRftDescription, HcmRftDisplayOrder, HcmRftActive, HcmRftModBy, HcmRftModAt)
VALUES ('Monthly', 'Monthly', 'Monthly', 3, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.HcmPreferredConnectionMethods(HcmPcmBrief, HcmPcmTitle, HcmPcmDescription, HcmPcmDisplayOrder, HcmPcmActive, HcmPcmModBy, HcmPcmModAt)
VALUES ('LAN', 'LAN', 'LAN', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmPreferredConnectionMethods(HcmPcmBrief, HcmPcmTitle, HcmPcmDescription, HcmPcmDisplayOrder, HcmPcmActive, HcmPcmModBy, HcmPcmModAt)
VALUES ('Wi-Fi', 'Wi-Fi', 'Wi-Fi', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmPreferredConnectionMethods(HcmPcmBrief, HcmPcmTitle, HcmPcmDescription, HcmPcmDisplayOrder, HcmPcmActive, HcmPcmModBy, HcmPcmModAt)
VALUES ('Dialup', 'Dialup', 'Dialup', 3, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmPreferredConnectionMethods(HcmPcmBrief, HcmPcmTitle, HcmPcmDescription, HcmPcmDisplayOrder, HcmPcmActive, HcmPcmModBy, HcmPcmModAt)
VALUES ('Cellular', 'Cellular', 'Cellular', 4, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.HcmTaskSelectionMethods(HcmTsmBrief, HcmTsmTitle, HcmTsmDescription, HcmTsmDisplayOrder, HcmTsmActive, HcmTsmModBy, HcmTsmModAt)
VALUES ('Normal', 'Normal', 'Normal', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmTaskSelectionMethods(HcmTsmBrief, HcmTsmTitle, HcmTsmDescription, HcmTsmDisplayOrder, HcmTsmActive, HcmTsmModBy, HcmTsmModAt)
VALUES ('Auto-Select', 'Auto-Select', 'Auto-Select', 2, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmTaskSelectionMethods(HcmTsmBrief, HcmTsmTitle, HcmTsmDescription, HcmTsmDisplayOrder, HcmTsmActive, HcmTsmModBy, HcmTsmModAt)
VALUES ('Manual', 'Manual', 'Manual', 3, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmTaskSelectionMethods(HcmTsmBrief, HcmTsmTitle, HcmTsmDescription, HcmTsmDisplayOrder, HcmTsmActive, HcmTsmModBy, HcmTsmModAt)
VALUES ('Full List', 'Full List', 'Full List', 4, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.HcmDeviceStatusTypes(HcmDevstBrief, HcmDevstTitle, HcmDevstDescription, HcmDevstDisplayOrder, HcmDevstActive, HcmDevstModBy, HcmDevstModAt)
VALUES ('Assigned', 'Assigned', 'Assigned', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmDeviceStatusTypes(HcmDevstBrief, HcmDevstTitle, HcmDevstDescription, HcmDevstDisplayOrder, HcmDevstActive, HcmDevstModBy, HcmDevstModAt)
VALUES ('Unassigned', 'Unassigned', 'Unassigned', 2, 1, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.HcmAssetTransferStatusTypes(HcmAtstBrief, HcmAtstTitle, HcmAtstDescription, HcmAtstDisplayOrder, HcmAtstActive, HcmAtstModBy, HcmAtstModAt)
VALUES ('Requested', 'Requested', 'Requested', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.HcmAssetTransferStatusTypes(HcmAtstBrief, HcmAtstTitle, HcmAtstDescription, HcmAtstDisplayOrder, HcmAtstActive, HcmAtstModBy, HcmAtstModAt)
VALUES ('Transferred', 'Transferred', 'Transferred', 2, 1, 'Compass-USA\Data Conversion', GetDate())

-- EPay Site Survey [End]

--  Epay Site & Epay Site Association Ad-Hoc Report modules [Begin]
Update dbo.AppModules Set AppModTitle = 'Invoice Item' Where AppModDescription = 'InvoiceItems'

Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModEditable, AppModHouseCodeAssociated)
Values ('Epay Site', 'HcmJobs', 1, 1, 'compass-usa\data conversion', GetDate(), 1, 0)
Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModEditable, AppModHouseCodeAssociated)
Values ('Epay Site Association', 'HcmHouseCodeJobs', 1, 1, 'compass-usa\data conversion', GetDate(), 1, 1)

Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (13, 12, 1, 'compass-usa\data conversion', GetDate())

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJob', 'HcmJob', 0, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 0, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobBrief', 'Epay Site Number', 1, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, Null, 8)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobTitle', 'Description', 2, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 300, Null, 256)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobContact', 'Contact', 3, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobAddress1', 'Address 1', 4, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobAddress2', 'Address 2', 5, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobPostalCode', 'Postal Code', 6, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, 'Zip', 1, Null, Null, Null, 100, Null, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobGEOCode', 'GEO Code', 7, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, 'AppZipCodeTypes', Null, Null, 100, Null, 2)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobCity', 'City', 8, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, 0, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'AppStateType', 'State', 9, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 1, 'AppStateTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmEPayGroupType', 'EPay Group Type', 10, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'HcmEPayGroupTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobActive', 'Active', 11, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 1, 'Bit', 1, Null, Null, Null, 100, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobModBy', 'Mod By', 12, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 0, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (12, 'HcmJobModAt', 'Mod At', 13, 1, 'compass-usa\data conversion', GetDate(), 'DateTime', 1, 'DateTime', 0, Null, Null, Null, 150, Null, 10)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHouseCodeJob', 'HcmHouseCodeJob', 0, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 0, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjLanguage1', 'Language 1', 1, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjLanguage2', 'Language 2', 2, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjLanguage3', 'Language 3', 3, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjDefaultHouseCode', 'Default House Code', 4, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 0, 'Bit', 1, Null, Null, Null, 100, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjActive', 'Active', 5, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 1, 'Bit', 1, Null, Null, Null, 100, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjModBy', 'Mod By', 6, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 0, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (13, 'HcmHoucjModAt', 'Mod At', 7, 1, 'compass-usa\data conversion', GetDate(), 'DateTime', 1, 'DateTime', 0, Null, Null, Null, 150, Null, 10)

--  Epay Site & Epay Site Association Ad-Hoc Report modules [End]

-- Change the Header Title to fix the Export To Excel issue [Begin]
Update AppModuleColumns Set AppModcDescription = 'Site Title' Where AppModule = 4 And AppModcTitle = 'AppSitTitle'
Update AppModuleColumns Set AppModcDescription = 'HirNode Title' Where AppModule = 7 And AppModcTitle = 'HirNodTitle'
Update AppModuleColumns Set AppModcDescription = 'Unit Title' Where AppModule = 8 And AppModcTitle = 'AppUniTitle'

Update AppModuleColumns Set AppModcDescription = 'Epay Site Active' Where AppModule = 12 And AppModcTitle = 'HcmJobActive'
Update AppModuleColumns Set AppModcDescription = 'Epay Site Association Active' Where AppModule = 13 And AppModcTitle = 'HcmHoucjActive'
-- Change the Header Title to fix the Export To Excel issue [End]

-- Add security nodes for action menu items in Epay Site Survey UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\EPaySiteSurvey'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'EPaySiteSurvey', HirNodTitle = 'EPay Site Survey', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey', HirNodLevel5 = 'EPay Site Survey'
Where HirNode = @HirNode

-----------------------------------------------------------------------------

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SiteSurvey', 'Site Survey', 'Site Survey', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey\Site Survey', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'EPay Site Survey', 'Site Survey', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SiteMethodology', 'Site Methodology', 'Site Methodology', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey\Site Methodology', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'EPay Site Survey', 'SiteMe thodology', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ClockManagement', 'Clock Management', 'Clock Management', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey\Clock Management', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'EPaySiteSurvey', 'Clock Management', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ManageDeviceType', 'Manage Device Type', 'Manage Device Type', @DisplayOrder + 4, 1, '\crothall\chimes\fin\HouseCodeSetup\EPay Site Survey\Manage Device Type', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'EPay Site Survey', 'Manage Device Type', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\EPaySiteSurvey%'
-- Add security nodes for action menu items in Epay Site Survey UI [End]


-- Added new columns to House Code Ad-Hoc report and updated the correct display order [Begin]

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucBuildingPopulation', 'Building Population', 41, 1, 'compass-usa\data conversion', GetDate(), 'Decimal', 1, 'Decimal', 1, Null, Null, Null, 150, 1, 11)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucMaintainableAcres', 'Maintainable Acres', 42, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucScientists', '# of Scientists', 43, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucManagedRooms', '# of Managed Rooms', 44, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmSiteType', 'Site Type', 45, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'HcmSiteTypes', Null, Null, 100, 1, 10)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucIntegrator', 'Integrator', 46, 1, 'compass-usa\data conversion',GetDate(), 'Bit', 1, 'Bit', 1, Null, Null, Null, 100, 1, Null)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucIntegratorName', 'Integrator Name', 47, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucAuditScore', 'Audit Score', 48, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucStandardizationScore', 'Standardization Score', 49, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucIncidentFrequencyRate', 'Incident Frequency Rate', 85, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 200, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucTRIR', 'TRIR', 86, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucReportedClaims', '# of Reported Claims', 87, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucNearMisses', '# of Near Misses', 88, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucOSHARecordable', '# of OSHA Recordable', 89, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucManagerAlternateEmail', 'Manager Alternate Email', 99, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 250, 1, 50)

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucLostDays', '# of Lost Days', 100, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, 1, 50)

Update dbo.AppModuleColumns Set AppModcDisplayOrder = 2 where AppModule = 1 And AppModcTitle = 'FscJDECompany'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 3 where AppModule = 1 And AppModcTitle = 'AppUnit'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 4 where AppModule = 1 And AppModcTitle = 'HcmHoucStartDate'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 5 where AppModule = 1 And AppModcTitle = 'HcmServiceType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 6 where AppModule = 1 And AppModcTitle = 'HcmServiceLine'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 7 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerName'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 8 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerEmail'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 9 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerPhone'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 10 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerFax'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 11 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerCellPhone'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 12 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerPager'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 13 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerAssistantName'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 14 where AppModule = 1 And AppModcTitle = 'HcmHoucManagerAssistantPhone'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 15 where AppModule = 1 And AppModcTitle = 'HcmHoucClientFirstName'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 16 where AppModule = 1 And AppModcTitle = 'HcmHoucClientLastName'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 17 where AppModule = 1 And AppModcTitle = 'HcmHoucClientTitle'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 18 where AppModule = 1 And AppModcTitle = 'HcmHoucClientPhone'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 19 where AppModule = 1 And AppModcTitle = 'HcmHoucClientFax'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 20 where AppModule = 1 And AppModcTitle = 'HcmHoucClientAssistantName'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 21 where AppModule = 1 And AppModcTitle = 'HcmHoucClientAssistantPhone'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 22 where AppModule = 1 And AppModcTitle = 'HcmHoucManagedEmployees'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 23 where AppModule = 1 And AppModcTitle = 'HcmHoucCrothallEmployees'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 24 where AppModule = 1 And AppModcTitle = 'HcmHoucBedsLicensed'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 25 where AppModule = 1 And AppModcTitle = 'HcmHoucBedsActive'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 26 where AppModule = 1 And AppModcTitle = 'HcmHoucPatientDays'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 27 where AppModule = 1 And AppModcTitle = 'HcmHoucAdjustedPatientDaysBudgeted'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 28 where AppModule = 1 And AppModcTitle = 'HcmHoucAverageDailyCensus'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 29 where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualDischarges'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 30 where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualTransfers'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 31 where AppModule = 1 And AppModcTitle = 'HcmHoucAverageBedTurnaroundTime'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 32 where AppModule = 1 And AppModcTitle = 'HcmHoucNetCleanableSqft'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 33 where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualTransports'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 34 where AppModule = 1 And AppModcTitle = 'HcmHoucAverageLaundryLbs'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 35 where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTerminatedHourlyEmployees'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 36 where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeActiveHourlyEmployees'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 37 where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalProductiveLaborHoursWorked'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 38 where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalNonProductiveLaborHours'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 39 where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalProductiveLaborDollarsPaid'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 40 where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalNonProductiveLaborDollarsPaid'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 50 where AppModule = 1 And AppModcTitle = 'HcmHoucShippingAddress1'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 51 where AppModule = 1 And AppModcTitle = 'HcmHoucShippingAddress2'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 52 where AppModule = 1 And AppModcTitle = 'HcmHoucShippingCity'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 53 where AppModule = 1 And AppModcTitle = 'HcmHoucShippingState'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 54 where AppModule = 1 And AppModcTitle = 'HcmHoucShippingZip'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 55 where AppModule = 1 And AppModcTitle = 'HcmRemitToLocation'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 56 where AppModule = 1 And AppModcTitle = 'HcmContractType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 57 where AppModule = 1 And AppModcTitle = 'HcmTermsOfContractType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 58 where AppModule = 1 And AppModcTitle = 'HcmBillingCycleFrequencyType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 59 where AppModule = 1 And AppModcTitle = 'HcmServiceLineFinancialEntity'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 60 where AppModule = 1 And AppModcTitle = 'HcmHoucBankCodeNumber'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 61 where AppModule = 1 And AppModcTitle = 'HcmHoucBankAccountNumber'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 62 where AppModule = 1 And AppModcTitle = 'HcmHoucBankName'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 63 where AppModule = 1 And AppModcTitle = 'HcmHoucBankContact'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 64 where AppModule = 1 And AppModcTitle = 'HcmHoucBankAddress1'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 65 where AppModule = 1 And AppModcTitle = 'HcmHoucBankAddress2'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 66 where AppModule = 1 And AppModcTitle = 'HcmHoucBankCity'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 67 where AppModule = 1 And AppModcTitle = 'HcmHoucBankState'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 68 where AppModule = 1 And AppModcTitle = 'HcmHoucBankZip'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 69 where AppModule = 1 And AppModcTitle = 'HcmHoucBankPhone'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 70 where AppModule = 1 And AppModcTitle = 'HcmHoucBankFax'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 71 where AppModule = 1 And AppModcTitle = 'HcmHoucBankEmail'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 72 where AppModule = 1 And AppModcTitle = 'HcmInvoiceLogoType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 73 where AppModule = 1 And AppModcTitle = 'HcmBudgetTemplate'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 74 where AppModule = 1 And AppModcTitle = 'HcmBudgetLaborCalcMethod'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 75 where AppModule = 1 And AppModcTitle = 'HcmBudgetComputerRelatedCharge'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 76 where AppModule = 1 And AppModcTitle = 'HcmPayrollProcessingLocationType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 77 where AppModule = 1 And AppModcTitle = 'HcmHoucTimeAndAttendance'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 78 where AppModule = 1 And AppModcTitle = 'HcmHoucDefaultLunchBreak'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 79 where AppModule = 1 And AppModcTitle = 'HcmHoucLunchBreakTrigger'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 80 where AppModule = 1 And AppModcTitle = 'HcmHouseCodeType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 81 where AppModule = 1 And AppModcTitle = 'HcmHoucRoundingTimePeriod'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 82 where AppModule = 1 And AppModcTitle = 'HcmHoucEPaySite'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 83 where AppModule = 1 And AppModcTitle = 'HcmEPayGroupType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 84 where AppModule = 1 And AppModcTitle = 'HcmHoucEPayTask'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 90 where AppModule = 1 And AppModcTitle = 'HcmHoucEnforceLaborControl'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 91 where AppModule = 1 And AppModcTitle = 'HcmHoucHospitalPaidJanitorialPaperPlasticSupplyCost'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 92 where AppModule = 1 And AppModcTitle = 'HcmHoucReference'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 93 where AppModule = 1 And AppModcTitle = 'HcmHoucFormerProvider'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 94 where AppModule = 1 And AppModcTitle = 'HcmHoucPayrollConversion'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 95 where AppModule = 1 And AppModcTitle = 'HcmHoucClosedDate'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 96 where AppModule = 1 And AppModcTitle = 'HcmHoucClosedReason'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 97 where AppModule = 1 And AppModcTitle = 'HcmHoucLostTo'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 98 where AppModule = 1 And AppModcTitle = 'HcmHoucLocation'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 101 where AppModule = 1 And AppModcTitle = 'HcmHoucStateTaxPercent'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 102 where AppModule = 1 And AppModcTitle = 'HcmHoucLocalTaxPercent'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 103 where AppModule = 1 And AppModcTitle = 'HcmLaborTrackingType'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 104 where AppModule = 1 And AppModcTitle = 'HcmHoucModBy'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 105 where AppModule = 1 And AppModcTitle = 'HcmHoucModAt'
Update dbo.AppModuleColumns Set AppModcDisplayOrder = 106 where AppModule = 1 And AppModcTitle = 'HirNode'
Update AppModuleColumns Set AppModcValidation = 'Email' Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerAlternateEmail'
-- Added new columns to House Code Ad-Hoc report and updated the correct display order [End]

-- Insert the time zones and zip codes [Begin]
Declare @Code Varchar(20)
	, @Name Varchar(100)
	, @UTCOffset Varchar(10)

Declare curTimeZone Cursor For
	Select ApptzCode, ApptzName, ApptzUTCOffset From dbo.AppTimeZones With (NoLock)

Open curTimeZone

While 1=1
Begin
	Fetch Next From curTimeZone Into @Code, @Name, @UTCOffset
	Set @Name = Replace(@Name, '''', '''''')
	If @@Fetch_Status <> 0 Break
	Print 'Insert Into AppTimeZones (ApptzCode, ApptzName, ApptzUTCOffset, ApptzModBy, ApptzModAt) Values (''' + @Code + ''', ''' + @Name + ''', ''' + @UTCOffset + ''', ''Compass-USA\Auto Import'', GetDate())'
End

Close curTimeZone
Deallocate curTimeZone

Declare @ZipCode Varchar(50)
	, @City Varchar(50)
	, @State Varchar(50)
	, @Latitude Varchar(50)
	, @Longitude Varchar(50)
	, @TimeZone Varchar(50)
	, @DaylightSavingTime Varchar(50)

Declare curZipCode Cursor For
	Select AppzcZipCode, AppzcCity, AppzcState, AppzcLatitude, AppzcLongitude, AppzcTimeZone, AppzcDaylightSavingTime From dbo.AppZipCodes With (NoLock)

Open curZipCode

While 1=1
Begin
	Fetch Next From curZipCode Into @ZipCode, @City, @State, @Latitude, @Longitude, @TimeZone, @DaylightSavingTime
	Set @City = Replace(@City, '''', '''''')
	If @@Fetch_Status <> 0 Break
	Print 'Insert Into AppZipCodes (AppzcZipCode, AppzcCity, AppzcState, AppzcLatitude, AppzcLongitude, AppzcTimeZone, AppzcDaylightSavingTime, AppzcModBy, AppzcModAt) Values (''' + @ZipCode + ''', ''' + @City + ''', ''' + @State + ''', ''' + @Latitude + ''', ''' + @Longitude + ''', ''' + @TimeZone + ''', ' + @DaylightSavingTime + ', ''Compass-USA\Auto Import'', GetDate())'
End

Close curZipCode
Deallocate curZipCode

-- Insert the time zones and zip codes [End]

-- Update the BudAnnualBudgets table newly added fields [Begin]
UPDATE BudAnnualBudgets
SET [HcmBudgetTemplate] = (SELECT [HcmBudgetTemplate] FROM HcmHouseCodes WHERE HcmHouseCodes.HcmHouseCode = BudAnnualBudgets.HcmHouseCode),
    [HcmBudgetComputerRelatedCharge] = (SELECT [HcmBudgetComputerRelatedCharge] FROM HcmHouseCodes WHERE HcmHouseCodes.HcmHouseCode = BudAnnualBudgets.HcmHouseCode),
    [HcmBudgetLaborCalcMethod] = (SELECT [HcmBudgetLaborCalcMethod] FROM HcmHouseCodes WHERE HcmHouseCodes.HcmHouseCode = BudAnnualBudgets.HcmHouseCode),
    [HcmContractType] = (SELECT [HcmContractType] FROM HcmHouseCodes WHERE HcmHouseCodes.HcmHouseCode = BudAnnualBudgets.HcmHouseCode),
    [HcmBillingCycleFrequencyType] = (SELECT [HcmBillingCycleFrequencyType] FROM HcmHouseCodes WHERE HcmHouseCodes.HcmHouseCode = BudAnnualBudgets.HcmHouseCode)
-- Update the BudAnnualBudgets table newly added fields [End]

-- Add the Sequence Object (InvoiceNumber) to create the Invoice Number [Begin]
Select Max(RevInvInvoiceNumber) From dbo.RevInvoices
Declare @InvoiceNumber Int
Select @InvoiceNumber = AppSysVariableValue From dbo.AppSystemVariables Where AppSysVariableName = 'NewInvoiceNumber'
Set @InvoiceNumber = @InvoiceNumber + 1

CREATE SEQUENCE InvoiceNumber AS INT
START WITH @InvoiceNumber -- This is the Number you want to start the Sequence with
INCREMENT BY 1 -- This is how you want to increment the number
-- Add the Sequence Object (InvoiceNumber) to create the Invoice Number [End]

/*
CT updated on 9th October 2013 11PM EST
*/

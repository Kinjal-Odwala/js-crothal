Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS

Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.00.000', M_ENV_ENV_Database_Version = '3.00.000', M_ENV_ENV_DEFAULT = 0, M_ENV_ENV_LOGOUT_URL = 'http://localhost:82/fin/app/usr/closeBrowser.htm', M_ENV_ENV_TITLE = 'Local Development Trans'
Where M_ENV_ENVIRONMENT = 1
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.00.000', M_ENV_ENV_Database_Version = '3.00.000', M_ENV_ENV_DEFAULT = 0, M_ENV_ENV_LOGOUT_URL = 'https://findevtrans.crothall.com/fin/app/usr/closeBrowser.htm', M_ENV_ENV_TITLE = 'Crothall Dev Trans(FINDEVTRANS)'
Where M_ENV_ENVIRONMENT = 2
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.00.000', M_ENV_ENV_Database_Version = '3.00.000', M_ENV_ENV_DEFAULT = 0, M_ENV_ENV_LOGOUT_URL = 'https://fincttrans.crothall.com/fin/app/usr/closeBrowser.htm', M_ENV_ENV_TITLE = 'Crothall Test Trans(FINCTTRANS)'
Where M_ENV_ENVIRONMENT = 3
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.00.000', M_ENV_ENV_Database_Version = '3.00.000' 
Where M_ENV_ENVIRONMENT = 4


-- Update SSRS Reports URL - CT Only [Begin]
Select * From dbo.RptReports
Select RptRepReportURL, SubString(RptRepReportURL, 1, 15), 'https://ctreports' + SubString(RptRepReportURL, 16,  Len(RptRepReportURL) - 15) From RptReports Where SubString(RptRepReportURL, 1, 15) = 'https://reports'
Select RptRepReportURL, SubString(RptRepReportURL, 1, 14), 'http://ctreports' + SubString(RptRepReportURL, 15,  Len(RptRepReportURL) - 14) From RptReports Where SubString(RptRepReportURL, 1, 14) = 'http://reports'

Update RptReports Set RptRepReportURL = 'https://ctreports' + SubString(RptRepReportURL, 16,  Len(RptRepReportURL) - 15) Where SubString(RptRepReportURL, 1, 15) = 'https://reports'
Update RptReports Set RptRepReportURL = 'http://ctreports' + SubString(RptRepReportURL, 15,  Len(RptRepReportURL) - 14) Where SubString(RptRepReportURL, 1, 14) = 'http://reports'
-- Update SSRS Reports URL - CT Only [End]


-- Deactivate unnecessary menu items [Begin]
Select * From Esmv2.dbo.AppMenuItems Where AppMeniActive = 0

Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Notifications'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Annualized 2012'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Annual Proj'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Recurring Exps'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Journal Entry'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'AP Import'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Housecode Wizard'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Report'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Epay Scheduler'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Import Employees'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Data Collector'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Emp Request'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Employee PAF'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'HC Requests'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Import HouseCode'
Select * From Esmv2.dbo.AppMenuItems Where AppMeniBrief = 'Employees'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Notifications'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Annualized 2012'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Annual Proj'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Recurring Exps'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Journal Entry'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'AP Import'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Housecode Wizard'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Report'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Epay Scheduler'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Import Employees'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Data Collector'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Emp Request'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Employee PAF'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'HC Requests'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Import HouseCode'
Update Esmv2.dbo.AppMenuItems Set AppMeniActive = 0 Where AppMeniBrief = 'Employees'

Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Gateway'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Home'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Home\Notifications'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\Budgeting\Annualized2012%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\Budgeting\AnnualProjections%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\GeneralLedger\RecurringExpenses%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\GeneralLedger\JournalEntry%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Payables\AP Import'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Reports\Report'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\Hierarchy'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\Epay Scheduler'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\Import Employees'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\DataCollector'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\Setup\EmpRequest%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\Setup\EmployeePAF%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodeRequest%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\Import House Codes%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\Setup\Employees%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Gateway'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Home'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Home\Notifications'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\Budgeting\Annualized2012%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\Budgeting\AnnualProjections%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\GeneralLedger\RecurringExpenses%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\GeneralLedger\JournalEntry%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payables\AP Import'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Reports\Report'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\Hierarchy'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\Epay Scheduler'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\Import Employees'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Setup\DataCollector'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\Setup\EmpRequest%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\Setup\EmployeePAF%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\HouseCodeRequest%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\Import House Codes%'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath Like '\crothall\chimes\fin\Setup\Employees%'
-- Deactivate unnecessary menu items [End]


-- Create JobNumber sequence number [Begin]
Select Max(HcmJobBrief) From dbo.HcmJobs
CREATE SEQUENCE JobNumber AS INT
START WITH 9565801 -- This is the Number you want to start the Sequence with (Maximum Job Number + 1)   
INCREMENT BY 1
-- Create JobNumber sequence number [End]


 -- Add Write GL Account security nodes in Fiscal - Chart Of Account [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Fiscal\ChartOfAccounts'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SetupGLAccounts', 'Setup GL Accounts', 'Setup GL Accounts', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Fiscal\ChartOfAccounts\SetupGLAccounts', 'crothall', 'chimes', 'fin', 'Fiscal', 'ChartOfAccounts', 'SetupGLAccounts', 'Compass-USA\Data Conversion', GetDate())
-- Add Write GL Account security nodes in Fiscal - Chart Of Account [End]


-- Add Write Vendor Setup security nodes in Purchasing - Vendors [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\Vendors'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SetupVendors', 'Setup Vendors', 'Setup Vendors', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\Vendors\SetupVendors', 'crothall', 'chimes', 'fin', 'Purchasing', 'Vendors', 'SetupVendors', 'Compass-USA\Data Conversion', GetDate())
-- Add Write Vendor Setup security nodes in Purchasing - Vendors [End]


-- Insert the data for GL Accounts, Vendors and House Code import workflow modules [Begin]
Select * From AppWorkflowModules
Select * From AppWorkflowSteps

Update dbo.AppWorkflowModules Set AppWfmActive = 0 Where AppWorkflowModule In (1, 2, 3)

INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('gla', 'GL Accounts', 'GL Accounts', 4, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(4, 'Step 1', 'Step 1 (Received)', 'Send an email notification to the users informing that the GL Account Number file is received and there are changes and/or new accounts which needs to be reviewed and updated.', 1, 1, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(4, 'Step 2', 'Step 2 (Reviewed)', 'Send an email notification to the users informing that the GL Account number changed and/or new GL Account number have been reviewed and updated and GL Account numbers have been activated.', 2, 2, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('ven', 'Vendors', 'Vendors', 5, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(5, 'Step 1', 'Step 1 (Received)', 'Send an email notification to the users informing that the Vendor file is received and there are changes and/or new vendors which needs to be reviewed and updated.', 1, 1, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(5, 'Step 2', 'Step 2 (Reviewed)', 'Send an email notification to the users informing that the Vendor number changed and/or new Vendor number have been reviewed and updated and Vendor numbers have been activated.', 2, 2, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.AppWorkflowModules(AppWfmBrief, AppWfmTitle, AppWfmDescription, AppWfmDisplayOrder, AppWfmActive, AppWfmModBy, AppWfmModAt)
VALUES('hc', 'House Code', 'House Code', 6, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(6, 'Step 1', 'Step 1 (Received)', 'Send an email notification to the users informing that the House Code file is received and there are new house codes which needs to be reviewed and activated.', 1, 1, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(6, 'Step 2', 'Step 2 (Reviewed)', 'Send an email notification to the users informing that the new House Code has been reviewed and activated.', 2, 2, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())

-- Insert the data for GL Accounts, Vendors and House Code import workflow modules [End]

Update dbo.FscAccounts Set AppTransactionStatusType = 8
Update dbo.PurVendors Set AppTransactionStatusType = 8
Update EsmV2.dbo.AppStateTypes Set AppCountryType = 218

/*

ALTER TABLE dbo.FscAccounts ADD AppTransactionStatusType INT NULL
ALTER TABLE dbo.FscAccounts ADD FscAccAccountList VARCHAR(4) NULL
ALTER TABLE dbo.FscAccounts ADD FscAccGroup VARCHAR(4) NULL
ALTER TABLE dbo.FscAccounts ADD FscAccMatchCode VARCHAR(25) NULL
ALTER TABLE dbo.FscAccounts ADD FscAccShortDescription VARCHAR(20) NULL
ALTER TABLE dbo.FscAccounts ADD FscAccCrtdBy VARCHAR(50) NULL
ALTER TABLE dbo.FscAccounts ADD FscAccCrtdAt DATETIME NULL
ALTER TABLE dbo.FscAccounts ADD FscAccBalanceSheet BIT NULL
ALTER TABLE dbo.FscAccounts ADD FscAccProfitAndLoss BIT NULL
ALTER TABLE dbo.FscAccounts ADD FscAccBlockDeletion BIT NULL
ALTER TABLE dbo.FscAccounts ADD FscAccBlockCreation BIT NULL
ALTER TABLE dbo.FscAccounts ADD FscAccBlockPosting BIT NULL

ALTER TABLE dbo.PurVendors ADD AppTransactionStatusType INT NULL
ALTER TABLE dbo.PurVendors ADD PurVenName VARCHAR(256) NULL
ALTER TABLE dbo.PurVendors ADD PurVenTrainStation VARCHAR(25) NULL
ALTER TABLE dbo.PurVendors ADD PurVenGroupKey VARCHAR(10) NULL
ALTER TABLE dbo.PurVendors ADD PurVenPaymentTerm VARCHAR(4) NULL
ALTER TABLE dbo.PurVendors ADD PurVenAccountNumber VARCHAR(12) NULL
ALTER TABLE dbo.PurVendors ADD PurVenMemo VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenMinorityIndicator VARCHAR(3) NULL
ALTER TABLE dbo.PurVendors ADD PurVenConsolidatedCode VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenConsolidatedText VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenCategoryCode VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenCategoryText VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenNominatedCode VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenNominatedText VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenPaymentKeyTerms VARCHAR(4) NULL
ALTER TABLE dbo.PurVendors ADD PurVenBusinessType VARCHAR(30) NULL
ALTER TABLE dbo.PurVendors ADD PurVenCountry VARCHAR(3) NULL
ALTER TABLE dbo.PurVendors ADD PurVenBlockCentralPosting BIT NULL
ALTER TABLE dbo.PurVendors ADD PurVenBlockPayment BIT NULL
ALTER TABLE dbo.PurVendors ADD PurVenBlockPostingCompanyCode BIT NULL

ALTER TABLE EsmV2.dbo.AppStateTypes ADD AppCountryType INT NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucSAPSequenceNumber INT NULL
ALTER TABLE dbo.HcmJobs ADD AppCountryType INT NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobIndustryType INT NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobCrtdBy VARCHAR(50) NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobCrtdAt DATETIME NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobExported BIT NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobExportedDate DATETIME NULL
ALTER TABLE dbo.HcmHouseCodeJobs ADD HcmHoucjSAPCustomerNumber VARCHAR(10) NULL
ALTER TABLE dbo.HcmHouseCodeJobs ADD HcmHoucjCrtdBy VARCHAR(50) NULL
ALTER TABLE dbo.HcmHouseCodeJobs ADD HcmHoucjCrtdAt DATETIME NULL
ALTER TABLE dbo.HcmHouseCodeJobs ADD HcmHoucjExported BIT NULL
ALTER TABLE dbo.HcmHouseCodeJobs ADD HcmHoucjExportedDate DATETIME NULL

ALTER TABLE dbo.AppJDEGLTransactions ALTER COLUMN AppJDEtVendorNumber VARCHAR(16)
ALTER TABLE dbo.AppJDEGLTransactionPendings ALTER COLUMN AppJDEtVendorNumber VARCHAR(16)

ALTER TABLE dbo.PayPayCheckRequests ADD PayPaycrPaymentMethod VARCHAR(16) NULL

ALTER TABLE dbo.EmpEmployeeGenerals ALTER COLUMN EmpEmpgEmployeeNumber VARCHAR(15)
ALTER TABLE dbo.EmpEmployeeGenerals ALTER COLUMN EmpEmpgScheduledHours Decimal(5,2)
ALTER TABLE dbo.EmpEmployeeGenerals ADD EmpEmpgSupervisorID VARCHAR(15)

ALTER TABLE dbo.HcmJobs ADD HcmJobPaymentTerm INT NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobContactPhone VARCHAR(50) NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobCustomerName VARCHAR(50) NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobCustomerPhone VARCHAR(50) NULL
ALTER TABLE dbo.HcmJobs ADD HcmJobCounty VARCHAR(50) NULL

ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucControllingArea VARCHAR(4) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCompanyCode VARCHAR(4) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucBusinessArea VARCHAR(4) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCostCenterCategory VARCHAR(1) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucResponsiblePerson VARCHAR(20) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucJurisdictionCode VARCHAR(15) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucProfitCenter VARCHAR(10) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucDepartmentName VARCHAR(12) NULL
ALTER TABLE dbo.HcmHouseCodes ADD AppCountryType INT NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucName1 VARCHAR(35) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucName2 VARCHAR(35) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucName3 VARCHAR(35) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucName4 VARCHAR(35) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucDistrict VARCHAR(35) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPOBoxZipCode VARCHAR(10) NULL
ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucCostCenterShortName VARCHAR(35) NULL
*/

INSERT INTO EsmV2.dbo.AppCountryTypes(AppCoutBrief, AppCoutTitle, AppCoutDescription, AppCoutDisplayOrder, AppCoutActive, AppCoutModBy, AppCoutModAt)
VALUES ('AD', 'Andorra', 'Andorra', 1, 1, 'Compass-USA\Data Conversion', GetDate()),
('AE', 'Utd.Arab.Emir.', 'Utd.Arab.Emir.', 2, 1, 'Compass-USA\Data Conversion', GetDate()),
('AF', 'Afghanistan', 'Afghanistan', 3, 1, 'Compass-USA\Data Conversion', GetDate()),
('AG', 'Antigua/Barbads', 'Antigua/Barbads', 4, 1, 'Compass-USA\Data Conversion', GetDate()),
('AI', 'Anguilla', 'Anguilla', 5, 1, 'Compass-USA\Data Conversion', GetDate()),
('AL', 'Albania', 'Albania', 6, 1, 'Compass-USA\Data Conversion', GetDate()),
('AM', 'Armenia', 'Armenia', 7, 1, 'Compass-USA\Data Conversion', GetDate()),
('AN', 'Dutch Antilles', 'Dutch Antilles', 8, 1, 'Compass-USA\Data Conversion', GetDate()),
('AO', 'Angola', 'Angola', 9, 1, 'Compass-USA\Data Conversion', GetDate()),
('AQ', 'Antarctica', 'Antarctica', 10, 1, 'Compass-USA\Data Conversion', GetDate()),
('AR', 'Argentina', 'Argentina', 10, 1, 'Compass-USA\Data Conversion', GetDate()),
('AS', 'Samoa,American', 'Samoa,American', 11, 1, 'Compass-USA\Data Conversion', GetDate()),
('AT', 'Austria', 'Austria', 12, 1, 'Compass-USA\Data Conversion', GetDate()),
('AU', 'Australia', 'Australia', 13, 1, 'Compass-USA\Data Conversion', GetDate()),
('AW', 'Aruba', 'Aruba', 14, 1, 'Compass-USA\Data Conversion', GetDate()),
('AZ', 'Azerbaijan', 'Azerbaijan', 15, 1, 'Compass-USA\Data Conversion', GetDate()),
('BA', 'Bosnia-Herz.', 'Bosnia-Herz.', 16, 1, 'Compass-USA\Data Conversion', GetDate()),
('BB', 'Barbados', 'Barbados', 17, 1, 'Compass-USA\Data Conversion', GetDate()),
('BD', 'Bangladesh', 'Bangladesh', 18, 1, 'Compass-USA\Data Conversion', GetDate()),
('BE', 'Belgium', 'Belgium', 19, 1, 'Compass-USA\Data Conversion', GetDate()),
('BF', 'Burkina-Faso', 'Burkina-Faso', 20, 1, 'Compass-USA\Data Conversion', GetDate()),
('BG', 'Bulgaria', 'Bulgaria', 21, 1, 'Compass-USA\Data Conversion', GetDate()),
('BH', 'Bharain', 'Bharain', 22, 1, 'Compass-USA\Data Conversion', GetDate()),
('BI', 'Burundi', 'Burundi', 23, 1, 'Compass-USA\Data Conversion', GetDate()),
('BJ', 'Benin', 'Benin', 24, 1, 'Compass-USA\Data Conversion', GetDate()),
('BM', 'Bermuda', 'Bermuda', 25, 1, 'Compass-USA\Data Conversion', GetDate()),
('BN', 'Brunei Dar-es-S', 'Brunei Dar-es-S', 26, 1, 'Compass-USA\Data Conversion', GetDate()),
('BO', 'Bolivia', 'Bolivia', 27, 1, 'Compass-USA\Data Conversion', GetDate()),
('BR', 'Brazil', 'Brazil', 28, 1, 'Compass-USA\Data Conversion', GetDate()),
('BS', 'Bahamas', 'Bahamas', 29, 1, 'Compass-USA\Data Conversion', GetDate()),
('BT', 'Bhutan', 'Bhutan', 30, 1, 'Compass-USA\Data Conversion', GetDate()),
('BV', 'Bouvet Island', 'Bouvet Island', 31, 1, 'Compass-USA\Data Conversion', GetDate()),
('BW', 'Botswana', 'Botswana', 32, 1, 'Compass-USA\Data Conversion', GetDate()),
('BY', 'White Russia', 'White Russia', 33, 1, 'Compass-USA\Data Conversion', GetDate()),
('BZ', 'Belize', 'Belize', 34, 1, 'Compass-USA\Data Conversion', GetDate()),
('CA', 'Canada', 'Canada', 35, 1, 'Compass-USA\Data Conversion', GetDate()),
('CC', 'Coconut Islands', 'Coconut Islands', 36, 1, 'Compass-USA\Data Conversion', GetDate()),
('CF', 'Central Afr.Rep', 'Central Afr.Rep', 37, 1, 'Compass-USA\Data Conversion', GetDate()),
('CG', 'Congo', 'Congo', 38, 1, 'Compass-USA\Data Conversion', GetDate()),
('CH', 'Switzerland', 'Switzerland', 39, 1, 'Compass-USA\Data Conversion', GetDate()),
('CI', 'Ivory Coast', 'Ivory Coast', 40, 1, 'Compass-USA\Data Conversion', GetDate()),
('CK', 'Cook Islands', 'Cook Islands', 41, 1, 'Compass-USA\Data Conversion', GetDate()),
('CL', 'Chile', 'Chile', 42, 1, 'Compass-USA\Data Conversion', GetDate()),
('CM', 'Cameroon', 'Cameroon', 43, 1, 'Compass-USA\Data Conversion', GetDate()),
('CN', 'China', 'China', 44, 1, 'Compass-USA\Data Conversion', GetDate()),
('CO', 'Columbia', 'Columbia', 45, 1, 'Compass-USA\Data Conversion', GetDate()),
('CR', 'Costa Rica', 'Costa Rica', 46, 1, 'Compass-USA\Data Conversion', GetDate()),
('CU', 'Cuba', 'Cuba', 47, 1, 'Compass-USA\Data Conversion', GetDate()),
('CV', 'Cape Verde', 'Cape Verde', 48, 1, 'Compass-USA\Data Conversion', GetDate()),
('CX', 'Christmas Islnd', 'Christmas Islnd', 49, 1, 'Compass-USA\Data Conversion', GetDate()),
('CY', 'Cyprus', 'Cyprus', 50, 1, 'Compass-USA\Data Conversion', GetDate()),
('CZ', 'Czech Republic', 'Czech Republic', 51, 1, 'Compass-USA\Data Conversion', GetDate()),
('DE', 'Germany', 'Germany', 52, 1, 'Compass-USA\Data Conversion', GetDate()),
('DJ', 'Djibouti', 'Djibouti', 53, 1, 'Compass-USA\Data Conversion', GetDate()),
('DK', 'Denmark', 'Denmark', 54, 1, 'Compass-USA\Data Conversion', GetDate()),
('DM', 'Dominica', 'Dominica', 55, 1, 'Compass-USA\Data Conversion', GetDate()),
('DO', 'Dominican Rep.', 'Dominican Rep.', 56, 1, 'Compass-USA\Data Conversion', GetDate()),
('DZ', 'Algeria', 'Algeria', 57, 1, 'Compass-USA\Data Conversion', GetDate()),
('EC', 'Ecuador', 'Ecuador', 58, 1, 'Compass-USA\Data Conversion', GetDate()),
('EE', 'Estonia', 'Estonia', 59, 1, 'Compass-USA\Data Conversion', GetDate()),
('EG', 'Egypt', 'Egypt', 60, 1, 'Compass-USA\Data Conversion', GetDate()),
('ER', 'Eritrea', 'Eritrea', 61, 1, 'Compass-USA\Data Conversion', GetDate()),
('ES', 'Spain', 'Spain', 62, 1, 'Compass-USA\Data Conversion', GetDate()),
('ET', 'Ethiopia', 'Ethiopia', 63, 1, 'Compass-USA\Data Conversion', GetDate()),
('FI', 'Finland', 'Finland', 64, 1, 'Compass-USA\Data Conversion', GetDate()),
('FJ', 'Fiji', 'Fiji', 65, 1, 'Compass-USA\Data Conversion', GetDate()),
('FK', 'Falkland Islnds', 'Falkland Islnds', 66, 1, 'Compass-USA\Data Conversion', GetDate()),
('FM', 'Micronesia', 'Micronesia', 67, 1, 'Compass-USA\Data Conversion', GetDate()),
('FO', 'Faeroe', 'Faeroe', 68, 1, 'Compass-USA\Data Conversion', GetDate()),
('FR', 'France', 'France', 69, 1, 'Compass-USA\Data Conversion', GetDate()),
('GA', 'Gabon', 'Gabon', 70, 1, 'Compass-USA\Data Conversion', GetDate()),
('GB', 'United Kingdom', 'United Kingdom', 71, 1, 'Compass-USA\Data Conversion', GetDate()),
('GD', 'Grenada', 'Grenada', 72, 1, 'Compass-USA\Data Conversion', GetDate()),
('GE', 'Georgia', 'Georgia', 73, 1, 'Compass-USA\Data Conversion', GetDate()),
('GF', 'French Guinea', 'French Guinea', 74, 1, 'Compass-USA\Data Conversion', GetDate()),
('GH', 'Ghana', 'Ghana', 75, 1, 'Compass-USA\Data Conversion', GetDate()),
('GI', 'Gibraltar', 'Gibraltar', 76, 1, 'Compass-USA\Data Conversion', GetDate()),
('GL', 'Greenland', 'Greenland', 77, 1, 'Compass-USA\Data Conversion', GetDate()),
('GM', 'Gambia', 'Gambia', 78, 1, 'Compass-USA\Data Conversion', GetDate()),
('GN', 'Guinea', 'Guinea', 79, 1, 'Compass-USA\Data Conversion', GetDate()),
('GP', 'Guadeloupe', 'Guadeloupe', 80, 1, 'Compass-USA\Data Conversion', GetDate()),
('GQ', 'Equatorial Guin', 'Equatorial Guin', 81, 1, 'Compass-USA\Data Conversion', GetDate()),
('GR', 'Greece', 'Greece', 82, 1, 'Compass-USA\Data Conversion', GetDate()),
('GT', 'Guatemala', 'Guatemala', 83, 1, 'Compass-USA\Data Conversion', GetDate()),
('GU', 'Guam', 'Guam', 84, 1, 'Compass-USA\Data Conversion', GetDate()),
('GW', 'Guinea-Bissau', 'Guinea-Bissau', 85, 1, 'Compass-USA\Data Conversion', GetDate()),
('GY', 'Guyana', 'Guyana', 86, 1, 'Compass-USA\Data Conversion', GetDate()),
('HK', 'Hong Kong', 'Hong Kong', 87, 1, 'Compass-USA\Data Conversion', GetDate()),
('HM', 'Heard/McDon.Isl', 'Heard/McDon.Isl', 88, 1, 'Compass-USA\Data Conversion', GetDate()),
('HN', 'Honduras', 'Honduras', 89, 1, 'Compass-USA\Data Conversion', GetDate()),
('HR', 'Croatia', 'Croatia', 90, 1, 'Compass-USA\Data Conversion', GetDate()),
('HT', 'Haiti', 'Haiti', 91, 1, 'Compass-USA\Data Conversion', GetDate()),
('HU', 'Hungary', 'Hungary', 92, 1, 'Compass-USA\Data Conversion', GetDate()),
('ID', 'Indonesia', 'Indonesia', 93, 1, 'Compass-USA\Data Conversion', GetDate()),
('IE', 'Ireland', 'Ireland', 94, 1, 'Compass-USA\Data Conversion', GetDate()),
('IL', 'Israel', 'Israel', 95, 1, 'Compass-USA\Data Conversion', GetDate()),
('IN', 'India', 'India', 96, 1, 'Compass-USA\Data Conversion', GetDate()),
('IO', 'Brit.Ind.Oc.Ter', 'Brit.Ind.Oc.Ter', 97, 1, 'Compass-USA\Data Conversion', GetDate()),
('IQ', 'Iraq', 'Iraq', 98, 1, 'Compass-USA\Data Conversion', GetDate()),
('IR', 'Iran', 'Iran', 99, 1, 'Compass-USA\Data Conversion', GetDate()),
('IS', 'Iceland', 'Iceland', 100, 1, 'Compass-USA\Data Conversion', GetDate()),
('IT', 'Italy', 'Italy', 101, 1, 'Compass-USA\Data Conversion', GetDate()),
('JM', 'Jamaica', 'Jamaica', 102, 1, 'Compass-USA\Data Conversion', GetDate()),
('JO', 'Jordan', 'Jordan', 103, 1, 'Compass-USA\Data Conversion', GetDate()),
('JP', 'Japan', 'Japan', 104, 1, 'Compass-USA\Data Conversion', GetDate()),
('KE', 'Kenya', 'Kenya', 105, 1, 'Compass-USA\Data Conversion', GetDate()),
('KG', 'Kirghistan', 'Kirghistan', 106, 1, 'Compass-USA\Data Conversion', GetDate()),
('KH', 'Cambodia', 'Cambodia', 107, 1, 'Compass-USA\Data Conversion', GetDate()),
('KI', 'Kiribati', 'Kiribati', 108, 1, 'Compass-USA\Data Conversion', GetDate()),
('KM', 'Comoro', 'Comoro', 109, 1, 'Compass-USA\Data Conversion', GetDate()),
('KN', 'St.Chr.,Nevis', 'St.Chr.,Nevis', 110, 1, 'Compass-USA\Data Conversion', GetDate()),
('KP', 'North Korea', 'North Korea', 111, 1, 'Compass-USA\Data Conversion', GetDate()),
('KR', 'South Korea', 'South Korea', 112, 1, 'Compass-USA\Data Conversion', GetDate()),
('KW', 'Kuwait', 'Kuwait', 113, 1, 'Compass-USA\Data Conversion', GetDate()),
('KY', 'Cayman Islands', 'Cayman Islands', 114, 1, 'Compass-USA\Data Conversion', GetDate()),
('KZ', 'Kazakhstan', 'Kazakhstan', 115, 1, 'Compass-USA\Data Conversion', GetDate()),
('LA', 'Laos', 'Laos', 116, 1, 'Compass-USA\Data Conversion', GetDate()),
('LB', 'Lebanon', 'Lebanon', 117, 1, 'Compass-USA\Data Conversion', GetDate()),
('LC', 'St. Lucia', 'St. Lucia', 118, 1, 'Compass-USA\Data Conversion', GetDate()),
('LI', 'Liechtenstein', 'Liechtenstein', 119, 1, 'Compass-USA\Data Conversion', GetDate()),
('LK', 'Sri Lanka', 'Sri Lanka', 120, 1, 'Compass-USA\Data Conversion', GetDate()),
('LR', 'Liberia', 'Liberia', 121, 1, 'Compass-USA\Data Conversion', GetDate()),
('LS', 'Lesotho', 'Lesotho', 122, 1, 'Compass-USA\Data Conversion', GetDate()),
('LT', 'Lithuania', 'Lithuania', 123, 1, 'Compass-USA\Data Conversion', GetDate()),
('LU', 'Luxembourg', 'Luxembourg', 124, 1, 'Compass-USA\Data Conversion', GetDate()),
('LV', 'Latvia', 'Latvia', 125, 1, 'Compass-USA\Data Conversion', GetDate()),
('LY', 'Libya', 'Libya', 126, 1, 'Compass-USA\Data Conversion', GetDate()),
('MA', 'Morocco', 'Morocco', 127, 1, 'Compass-USA\Data Conversion', GetDate()),
('MC', 'Monaco', 'Monaco', 128, 1, 'Compass-USA\Data Conversion', GetDate()),
('MD', 'Moldavia', 'Moldavia', 129, 1, 'Compass-USA\Data Conversion', GetDate()),
('MG', 'Madagascar', 'Madagascar', 130, 1, 'Compass-USA\Data Conversion', GetDate()),
('MH', 'Marshall Islnds', 'Marshall Islnds', 131, 1, 'Compass-USA\Data Conversion', GetDate()),
('MK', 'Macedonia', 'Macedonia', 132, 1, 'Compass-USA\Data Conversion', GetDate()),
('ML', 'Mali', 'Mali', 133, 1, 'Compass-USA\Data Conversion', GetDate()),
('MM', 'Myanmar', 'Myanmar', 134, 1, 'Compass-USA\Data Conversion', GetDate()),
('MN', 'Mongolia', 'Mongolia', 135, 1, 'Compass-USA\Data Conversion', GetDate()),
('MO', 'Macau', 'Macau', 136, 1, 'Compass-USA\Data Conversion', GetDate()),
('MP', 'N.Mariana Islnd', 'N.Mariana Islnd', 137, 1, 'Compass-USA\Data Conversion', GetDate()),
('MQ', 'Martinique', 'Martinique', 138, 1, 'Compass-USA\Data Conversion', GetDate()),
('MR', 'Mauretania', 'Mauretania', 139, 1, 'Compass-USA\Data Conversion', GetDate()),
('MS', 'Montserrat', 'Montserrat', 140, 1, 'Compass-USA\Data Conversion', GetDate()),
('MT', 'Malta', 'Malta', 141, 1, 'Compass-USA\Data Conversion', GetDate()),
('MU', 'Mauritius', 'Mauritius', 142, 1, 'Compass-USA\Data Conversion', GetDate()),
('MV', 'Maldives', 'Maldives', 143, 1, 'Compass-USA\Data Conversion', GetDate()),
('MW', 'Malawi', 'Malawi', 144, 1, 'Compass-USA\Data Conversion', GetDate()),
('MX', 'Mexico', 'Mexico', 145, 1, 'Compass-USA\Data Conversion', GetDate()),
('MY', 'Malaysia', 'Malaysia', 146, 1, 'Compass-USA\Data Conversion', GetDate()),
('MZ', 'Mozambique', 'Mozambique', 147, 1, 'Compass-USA\Data Conversion', GetDate()),
('NA', 'Namibia', 'Namibia', 148, 1, 'Compass-USA\Data Conversion', GetDate()),
('NC', 'New Caledonia', 'New Caledonia', 149, 1, 'Compass-USA\Data Conversion', GetDate()),
('NE', 'Niger', 'Niger', 150, 1, 'Compass-USA\Data Conversion', GetDate()),
('NF', 'Norfolk Island', 'Norfolk Island', 151, 1, 'Compass-USA\Data Conversion', GetDate()),
('NG', 'Nigeria', 'Nigeria', 152, 1, 'Compass-USA\Data Conversion', GetDate()),
('NI', 'Nicaragua', 'Nicaragua', 153, 1, 'Compass-USA\Data Conversion', GetDate()),
('NL', 'Netherlands', 'Netherlands', 154, 1, 'Compass-USA\Data Conversion', GetDate()),
('NO', 'Norway', 'Norway', 155, 1, 'Compass-USA\Data Conversion', GetDate()),
('NP', 'Nepal', 'Nepal', 156, 1, 'Compass-USA\Data Conversion', GetDate()),
('NR', 'Nauru', 'Nauru', 157, 1, 'Compass-USA\Data Conversion', GetDate()),
('NU', 'Niue Islands', 'Niue Islands', 158, 1, 'Compass-USA\Data Conversion', GetDate()),
('NZ', 'New Zealand', 'New Zealand', 159, 1, 'Compass-USA\Data Conversion', GetDate()),
('OM', 'Oman', 'Oman', 160, 1, 'Compass-USA\Data Conversion', GetDate()),
('PA', 'Panama', 'Panama', 161, 1, 'Compass-USA\Data Conversion', GetDate()),
('PE', 'Peru', 'Peru', 162, 1, 'Compass-USA\Data Conversion', GetDate()),
('PF', 'Frenc.Polynesia', 'Frenc.Polynesia', 163, 1, 'Compass-USA\Data Conversion', GetDate()),
('PG', 'Pap. New Guinea', 'Pap. New Guinea', 164, 1, 'Compass-USA\Data Conversion', GetDate()),
('PH', 'Philippines', 'Philippines', 165, 1, 'Compass-USA\Data Conversion', GetDate()),
('PK', 'Pakistan', 'Pakistan', 166, 1, 'Compass-USA\Data Conversion', GetDate()),
('PL', 'Poland', 'Poland', 167, 1, 'Compass-USA\Data Conversion', GetDate()),
('PM', 'St.Pier,Miquel.', 'St.Pier,Miquel.', 168, 1, 'Compass-USA\Data Conversion', GetDate()),
('PN', 'Pitcairn Islnds', 'Pitcairn Islnds', 169, 1, 'Compass-USA\Data Conversion', GetDate()),
('PR', 'Puerto Rico', 'Puerto Rico', 170, 1, 'Compass-USA\Data Conversion', GetDate()),
('PT', 'Portugal', 'Portugal', 171, 1, 'Compass-USA\Data Conversion', GetDate()),
('PW', 'Palau', 'Palau', 172, 1, 'Compass-USA\Data Conversion', GetDate()),
('PY', 'Paraguay', 'Paraguay', 173, 1, 'Compass-USA\Data Conversion', GetDate()),
('QA', 'Qatar', 'Qatar', 174, 1, 'Compass-USA\Data Conversion', GetDate()),
('RE', 'Reunion', 'Reunion', 175, 1, 'Compass-USA\Data Conversion', GetDate()),
('RO', 'Rumania', 'Rumania', 176, 1, 'Compass-USA\Data Conversion', GetDate()),
('RU', 'Russian Fed.', 'Russian Fed.', 177, 1, 'Compass-USA\Data Conversion', GetDate()),
('RW', 'Rwanda', 'Rwanda', 178, 1, 'Compass-USA\Data Conversion', GetDate()),
('SA', 'Saudi Arabia', 'Saudi Arabia', 179, 1, 'Compass-USA\Data Conversion', GetDate()),
('SB', 'Solomon Islands', 'Solomon Islands', 180, 1, 'Compass-USA\Data Conversion', GetDate()),
('SC', 'Seychelles', 'Seychelles', 181, 1, 'Compass-USA\Data Conversion', GetDate()),
('SD', 'Sudan', 'Sudan', 182, 1, 'Compass-USA\Data Conversion', GetDate()),
('SE', 'Sweden', 'Sweden', 183, 1, 'Compass-USA\Data Conversion', GetDate()),
('SG', 'Singapore', 'Singapore', 184, 1, 'Compass-USA\Data Conversion', GetDate()),
('SH', 'St. Helena', 'St. Helena', 185, 1, 'Compass-USA\Data Conversion', GetDate()),
('SI', 'Slovenia', 'Slovenia', 186, 1, 'Compass-USA\Data Conversion', GetDate()),
('SJ', 'Svalbard', 'Svalbard', 187, 1, 'Compass-USA\Data Conversion', GetDate()),
('SK', 'Slovakia', 'Slovakia', 188, 1, 'Compass-USA\Data Conversion', GetDate()),
('SL', 'Sierra Leone', 'Sierra Leone', 189, 1, 'Compass-USA\Data Conversion', GetDate()),
('SM', 'San Marino', 'San Marino', 190, 1, 'Compass-USA\Data Conversion', GetDate()),
('SN', 'Senegal', 'Senegal', 191, 1, 'Compass-USA\Data Conversion', GetDate()),
('SO', 'Somalia', 'Somalia', 192, 1, 'Compass-USA\Data Conversion', GetDate()),
('SR', 'Suriname', 'Suriname', 193, 1, 'Compass-USA\Data Conversion', GetDate()),
('ST', 'S.Tome,Principe', 'S.Tome,Principe', 194, 1, 'Compass-USA\Data Conversion', GetDate()),
('STL', 'stateless', 'stateless', 195, 1, 'Compass-USA\Data Conversion', GetDate()),
('SV', 'El Salvador', 'El Salvador', 196, 1, 'Compass-USA\Data Conversion', GetDate()),
('SY', 'Syria', 'Syria', 197, 1, 'Compass-USA\Data Conversion', GetDate()),
('SZ', 'Swaziland', 'Swaziland', 198, 1, 'Compass-USA\Data Conversion', GetDate()),
('TC', 'Turksh Caicosin', 'Turksh Caicosin', 199, 1, 'Compass-USA\Data Conversion', GetDate()),
('TD', 'Chad', 'Chad', 200, 1, 'Compass-USA\Data Conversion', GetDate()),
('TG', 'Togo', 'Togo', 201, 1, 'Compass-USA\Data Conversion', GetDate()),
('TH', 'Thailand', 'Thailand', 202, 1, 'Compass-USA\Data Conversion', GetDate()),
('TJ', 'Tadzhikistan', 'Tadzhikistan', 203, 1, 'Compass-USA\Data Conversion', GetDate()),
('TK', 'Tokelau Islands', 'Tokelau Islands', 204, 1, 'Compass-USA\Data Conversion', GetDate()),
('TM', 'Turkmenistan', 'Turkmenistan', 205, 1, 'Compass-USA\Data Conversion', GetDate()),
('TN', 'Tunisia', 'Tunisia', 205, 1, 'Compass-USA\Data Conversion', GetDate()),
('TO', 'Tonga', 'Tonga', 206, 1, 'Compass-USA\Data Conversion', GetDate()),
('TP', 'East Timor', 'East Timor', 207, 1, 'Compass-USA\Data Conversion', GetDate()),
('TR', 'Turkey', 'Turkey', 208, 1, 'Compass-USA\Data Conversion', GetDate()),
('TT', 'Trinidad,Tobago', 'Trinidad,Tobago', 209, 1, 'Compass-USA\Data Conversion', GetDate()),
('TV', 'Tuvalu', 'Tuvalu', 210, 1, 'Compass-USA\Data Conversion', GetDate()),
('TW', 'Taiwan', 'Taiwan', 211, 1, 'Compass-USA\Data Conversion', GetDate()),
('TZ', 'Tanzania', 'Tanzania', 212, 1, 'Compass-USA\Data Conversion', GetDate()),
('UA', 'Ukraine', 'Ukraine', 213, 1, 'Compass-USA\Data Conversion', GetDate()),
('UG', 'Uganda', 'Uganda', 214, 1, 'Compass-USA\Data Conversion', GetDate()),
('UM', 'Minor Outl.Isl.', 'Minor Outl.Isl.', 215, 1, 'Compass-USA\Data Conversion', GetDate()),
('US', 'USA', 'USA', 216, 1, 'Compass-USA\Data Conversion', GetDate()),
('UY', 'Uruguay', 'Uruguay', 217, 1, 'Compass-USA\Data Conversion', GetDate()),
('UZ', 'Uzbekistan', 'Uzbekistan', 218, 1, 'Compass-USA\Data Conversion', GetDate()),
('VA', 'Vatican City', 'Vatican City', 219, 1, 'Compass-USA\Data Conversion', GetDate()),
('VC', 'St. Vincent', 'St. Vincent', 220, 1, 'Compass-USA\Data Conversion', GetDate()),
('VE', 'Venezuela', 'Venezuela', 221, 1, 'Compass-USA\Data Conversion', GetDate()),
('VG', 'Brit.Virgin Is.', 'Brit.Virgin Is.', 222, 1, 'Compass-USA\Data Conversion', GetDate()),
('VI', 'Amer.Virgin Is.', 'Amer.Virgin Is.', 223, 1, 'Compass-USA\Data Conversion', GetDate()),
('VN', 'Vietnam', 'Vietnam', 224, 1, 'Compass-USA\Data Conversion', GetDate()),
('VU', 'Vanuatu', 'Vanuatu', 225, 1, 'Compass-USA\Data Conversion', GetDate()),
('WF', 'Wallis,Futuna', 'Wallis,Futuna', 226, 1, 'Compass-USA\Data Conversion', GetDate()),
('WS', 'Western Samoa', 'Western Samoa', 227, 1, 'Compass-USA\Data Conversion', GetDate()),
('YE', 'Yemen', 'Yemen', 228, 1, 'Compass-USA\Data Conversion', GetDate()),
('YT', 'Mayotte', 'Mayotte', 229, 1, 'Compass-USA\Data Conversion', GetDate()),
('YU', 'Yugoslavia', 'Yugoslavia', 230, 1, 'Compass-USA\Data Conversion', GetDate()),
('ZA', 'South Africa', 'South Africa', 231, 1, 'Compass-USA\Data Conversion', GetDate()),
('ZM', 'Zambia', 'Zambia', 232, 1, 'Compass-USA\Data Conversion', GetDate()),
('ZR', 'Zaire', 'Zaire', 233, 1, 'Compass-USA\Data Conversion', GetDate()),
('ZW', 'Zimbabwe', 'Zimbabwe', 234, 1, 'Compass-USA\Data Conversion', GetDate())
--('VN', 'Vietnam', 'Vietnam', 235, 1, 'Compass-USA\Data Conversion', GetDate()),
--('VU', 'Vanuatu', 'Vanuatu', 236, 1, 'Compass-USA\Data Conversion', GetDate()),
--('WF', 'Wallis,Futuna', 'Wallis,Futuna', 237, 1, 'Compass-USA\Data Conversion', GetDate()),
--('WS', 'Western Samoa', 'Western Samoa', 238, 1, 'Compass-USA\Data Conversion', GetDate()),
--('YE', 'Yemen', 'Yemen', 239, 1, 'Compass-USA\Data Conversion', GetDate()),
--('YT', 'Mayotte', 'Mayotte', 240, 1, 'Compass-USA\Data Conversion', GetDate()),
--('YU', 'Yugoslavia', 'Yugoslavia', 241, 1, 'Compass-USA\Data Conversion', GetDate()),
--('ZA', 'South Africa', 'South Africa', 242, 1, 'Compass-USA\Data Conversion', GetDate())

Update EsmV2.dbo.AppCountryTypes Set AppCoutDisplayOrder = AppCountryType
Select * From Esmv2.dbo.AppCountryTypes
Select Count(AppCountryType), AppCoutBrief From EsmV2.dbo.AppCountryTypes group by AppCoutBrief Having Count(AppCoutBrief) > 1


INSERT INTO dbo.HcmJobIndustryTypes(HcmJobitBrief, HcmJobitTitle, HcmJobitDescription, HcmJobitDisplayOrder, HcmJobitActive, HcmJobitModBy, HcmJobitModAt)
VALUES ('00', 'Overhead', 'Overhead', 1, 1, 'Compass-USA\Data Conversion', GetDate()),
('0001', 'Industry 0001', 'Industry 0001', 2, 1, 'Compass-USA\Data Conversion', GetDate()),
('0002', 'Industry 0002', 'Industry 0002', 3, 1, 'Compass-USA\Data Conversion', GetDate()),
('0003', 'Industry 0003', 'Industry 0003', 4, 1, 'Compass-USA\Data Conversion', GetDate()),
('0100', 'Agricult Production', 'Agricult Production', 5, 1, 'Compass-USA\Data Conversion', GetDate()),
('0200', 'Automotive & Related', 'Automotive & Related', 6, 1, 'Compass-USA\Data Conversion', GetDate()),
('0300', 'Bldg Construction', 'Bldg Construction', 7, 1, 'Compass-USA\Data Conversion', GetDate()),
('0400', 'Chemical & Pharmaceu', 'Chemical & Pharmaceu', 8, 1, 'Compass-USA\Data Conversion', GetDate()),
('0500', 'Communications', 'Communications', 9, 1, 'Compass-USA\Data Conversion', GetDate()),
('0600', 'Consumer Goods Manuf', 'Consumer Goods Manuf', 10, 1, 'Compass-USA\Data Conversion', GetDate()),
('0700', 'Correctional Facilit', 'Correctional Facilit', 11, 1, 'Compass-USA\Data Conversion', GetDate()),
('0800', 'Defense Industry', 'Defense Industry', 12, 1, 'Compass-USA\Data Conversion', GetDate()),
('0900', 'Educ Inst K-12', 'Educ Inst K-12', 13, 1, 'Compass-USA\Data Conversion', GetDate()),
('1000', 'Educ Inst Col & Univ', 'Educ Inst Col & Univ', 14, 1, 'Compass-USA\Data Conversion', GetDate()),
('1100', 'Electronic Manufactu', 'Electronic Manufactu', 15, 1, 'Compass-USA\Data Conversion', GetDate()),
('1200', 'Equip/Wholesale Manu', 'Equip/Wholesale Manu', 16, 1, 'Compass-USA\Data Conversion', GetDate()),
('1300', 'Finance/Insurance', 'Finance/Insurance', 17, 1, 'Compass-USA\Data Conversion', GetDate()),
('1400', 'Food/Bev Process & P', 'Food/Bev Process & P', 18, 1, 'Compass-USA\Data Conversion', GetDate()),
('1500', 'Govt/Post Office', 'Govt/Post Office', 19, 1, 'Compass-USA\Data Conversion', GetDate()),
('1600', 'Health Care-Hospital', 'Health Care-Hospital', 20, 1, 'Compass-USA\Data Conversion', GetDate()),
('1700', 'Health Care-Snr Food', 'Health Care-Snr Food', 21, 1, 'Compass-USA\Data Conversion', GetDate()),
('1800', 'Legal/Acct Services', 'Legal/Acct Services', 22, 1, 'Compass-USA\Data Conversion', GetDate()),
('1900', 'Misc Services', 'Misc Services', 23, 1, 'Compass-USA\Data Conversion', GetDate()),
('2000', 'Raw Material Process', 'Raw Material Process', 24, 1, 'Compass-USA\Data Conversion', GetDate()),
('2100', 'Retail', 'Retail', 25, 1, 'Compass-USA\Data Conversion', GetDate()),
('2200', 'Text/Apparel/Furnitu', 'Text/Apparel/Furnitu', 26, 1, 'Compass-USA\Data Conversion', GetDate()),
('2300', 'Transportation', 'Transportation', 27, 1, 'Compass-USA\Data Conversion', GetDate()),
('2400', 'Utilities', 'Utilities', 28, 1, 'Compass-USA\Data Conversion', GetDate()),
('2500', 'Local Government', 'Local Government', 29, 1, 'Compass-USA\Data Conversion', GetDate()),
('2600', 'Religious Orgs', 'Religious Orgs', 30, 1, 'Compass-USA\Data Conversion', GetDate()),
('2700', 'Arts&Entertainment', 'Arts&Entertainment', 31, 1, 'Compass-USA\Data Conversion', GetDate()),
('2800', 'Sports & Entertain', 'Sports & Entertain', 32, 1, 'Compass-USA\Data Conversion', GetDate()),
('4002', 'Vending Mach & Parts', 'Vending Mach & Parts', 33, 1, 'Compass-USA\Data Conversion', GetDate()),
('4004', 'Equipment, Kitchen', 'Equipment, Kitchen', 34, 1, 'Compass-USA\Data Conversion', GetDate()),
('4010', 'Computer Equipment', 'Computer Equipment', 35, 1, 'Compass-USA\Data Conversion', GetDate()),
('7901', 'Taxing Auth, Federal', 'Taxing Auth, Federal', 36, 1, 'Compass-USA\Data Conversion', GetDate()),
('7902', 'Taxing Auth, State', 'Taxing Auth, State', 37, 1, 'Compass-USA\Data Conversion', GetDate()),
('7903', 'Taxing Auth, Local', 'Taxing Auth, Local', 38, 1, 'Compass-USA\Data Conversion', GetDate()),
('8002', 'Labor Union Organ', 'Labor Union Organ', 39, 1, 'Compass-USA\Data Conversion', GetDate()),
('8004', 'Employee Garnishment', 'Employee Garnishment', 40, 1, 'Compass-USA\Data Conversion', GetDate()),
('8101', 'Emp Ben/Work Comp/EU', 'Emp Ben/Work Comp/EU', 41, 1, 'Compass-USA\Data Conversion', GetDate()),
('8905', 'Insur Accid & Life', 'Insur Accid & Life', 42, 1, 'Compass-USA\Data Conversion', GetDate())


INSERT INTO dbo.PayWageTypes (PayWagtBrief, PayWagtTitle, PayWagtDescription, PayWagtDisplayOrder, PayWagtActive, PayWagtModBy, PayWagtModAt) 
VALUES ('1001', 'Base Pay-Field Non-Salary', 'Base Pay-Field Non-Salary', 1, 1, 'Compass-USA\Data Conversion', GetDate()),
('1002', 'Commission Payment', 'Commission Payment', 2, 1, 'Compass-USA\Data Conversion', GetDate()),
('1007', 'Holiday Pay - Hours', 'Holiday Pay - Hours', 3, 1, 'Compass-USA\Data Conversion', GetDate()),
('1011', 'Vacation Pay - Hours', 'Vacation Pay - Hours', 4, 1, 'Compass-USA\Data Conversion', GetDate()),
('1014', 'Miscellaneous Pay', 'Miscellaneous Pay', 5, 1, 'Compass-USA\Data Conversion', GetDate()),
('1015', 'Severence Pay - Amount', 'Severence Pay - Amount', 6, 1, 'Compass-USA\Data Conversion', GetDate()),
('1017', 'Regular Sick Pay - Hours', 'Regular Sick Pay - Hours', 7, 1, 'Compass-USA\Data Conversion', GetDate()),
('1021', 'Meal / Break Premium', 'Meal / Break Premium', 8, 1, 'Compass-USA\Data Conversion', GetDate()),
('1024', 'Relo: Cash NonTaxable', 'Relo: Cash NonTaxable', 9, 1, 'Compass-USA\Data Conversion', GetDate()),
('1028', 'Salary STD - Taxable', 'Salary STD - Taxable', 10, 1, 'Compass-USA\Data Conversion', GetDate()),
('1101', 'Misc. Bonus', 'Misc. Bonus', 11, 1, 'Compass-USA\Data Conversion', GetDate()),
('1112', 'Paid Days Off', 'Paid Days Off', 12, 1, 'Compass-USA\Data Conversion', GetDate()),
('1116', 'Bonus - Referral', 'Bonus - Referral', 13, 1, 'Compass-USA\Data Conversion', GetDate()),
('1120', 'Jury Duty', 'Jury Duty', 14, 1, 'Compass-USA\Data Conversion', GetDate()),
('1121', 'Bereavement', 'Bereavement', 15, 1, 'Compass-USA\Data Conversion', GetDate()),
('1151', 'Legal Settlement Pay Sup', 'Legal Settlement Pay Sup', 16, 1, 'Compass-USA\Data Conversion', GetDate()),
('1160', 'Shift Premium Hours', 'Shift Premium Hours', 17, 1, 'Compass-USA\Data Conversion', GetDate()),
('1161', 'Shift Premium OT Hours', 'Shift Premium OT Hours', 18, 1, 'Compass-USA\Data Conversion', GetDate()),
('1162', 'Overtime - No Multiplier', 'Overtime - No Multiplier', 19, 1, 'Compass-USA\Data Conversion', GetDate()),
('1163', 'Dbl Overtime-NoMultiplier', 'Dbl Overtime-NoMultiplier', 20, 1, 'Compass-USA\Data Conversion', GetDate()),
('1199', 'New Hire Bonus', 'New Hire Bonus', 21, 1, 'Compass-USA\Data Conversion', GetDate()),
('Earn', 'Generic Earning Placeholder', 'Generic Earning Placeholder', 22, 1, 'Compass-USA\Data Conversion', GetDate())


INSERT INTO dbo.HcmJobPaymentTerms(HcmJobptBrief, HcmJobptTitle, HcmJobptDescription, HcmJobptDisplayOrder, HcmJobptActive, HcmJobptModBy, HcmJobptModAt)
VALUES ('0001', 'ONE DAY 0.0%', 'ONE DAY 0.0%', 1, 1, 'Compass-USA\Data Conversion', GetDate()),
('0008', '8 DAYS 0.0% CASH DISCOUNT', '8 DAYS 0.0% CASH DISCOUNT', 2, 1, 'Compass-USA\Data Conversion', GetDate()),
('0013', 'THIRTEEN DAYS 0.0% CASH DISCOUNT', 'THIRTEEN DAYS 0.0% CASH DISCOUNT', 3, 1, 'Compass-USA\Data Conversion', GetDate()),
('0036', '0% VA 0% CD 36 Days', '0% VA 0% CD 36 Days', 4, 1, 'Compass-USA\Data Conversion', GetDate()),
('0090', '0% VA 0% CD 90 Days', '0% VA 0% CD 90 Days', 5, 1, 'Compass-USA\Data Conversion', GetDate()),
('0220', '20 DAYS 2% CASH DISCOUNT', '20 DAYS 2% CASH DISCOUNT', 6, 1, 'Compass-USA\Data Conversion', GetDate()),
('1007', '7 DAYS 10.0% DISCOUNT', '7 DAYS 10.0% DISCOUNT', 7, 1, 'Compass-USA\Data Conversion', GetDate()),
('1515', '15 DAYS 1.5% CASH DISCOUNT', '15 DAYS 1.5% CASH DISCOUNT', 8, 1, 'Compass-USA\Data Conversion', GetDate()),
('N400', '10% 15, Net 30', '10% 15, Net 30', 9, 1, 'Compass-USA\Data Conversion', GetDate()),
('N401', '10% 30, Net 45', '10% 30, Net 45', 10, 1, 'Compass-USA\Data Conversion', GetDate()),
('N402', '10% 45, Net 60', '10% 45, Net 60', 11, 1, 'Compass-USA\Data Conversion', GetDate()),
('N403', '10% 60, Net 75', '10% 60, Net 75', 12, 1, 'Compass-USA\Data Conversion', GetDate()),
('N404', '10% Net 70', '10% Net 70', 13, 1, 'Compass-USA\Data Conversion', GetDate()),
('N405', '11.6% 60, Net 70', '11.6% 60, Net 70', 14, 1, 'Compass-USA\Data Conversion', GetDate()),
('N406', '12% 30, Net 45', '12% 30, Net 45', 15, 1, 'Compass-USA\Data Conversion', GetDate()),
('N407', '12% 60, Net 75', '12% 60, Net 75', 16, 1, 'Compass-USA\Data Conversion', GetDate()),
('N408', '14% 60, Net 70', '14% 60, Net 70', 17, 1, 'Compass-USA\Data Conversion', GetDate()),
('N409', '15% 30, Net 45', '15% 30, Net 45', 18, 1, 'Compass-USA\Data Conversion', GetDate()),
('N410', '15% 45, Net 60', '15% 45, Net 60', 19, 1, 'Compass-USA\Data Conversion', GetDate()),
('N411', '15% 60, Net 75', '15% 60, Net 75', 20, 1, 'Compass-USA\Data Conversion', GetDate()),
('N412', '16% Net 21', '16% Net 21', 21, 1, 'Compass-USA\Data Conversion', GetDate()),
('N413', '18% 60, Net 75', '18% 60, Net 75', 22, 1, 'Compass-USA\Data Conversion', GetDate()),
('N414', '2% 36, Net 42', '2% 36, Net 42', 23, 1, 'Compass-USA\Data Conversion', GetDate()),
('N415', '2% 7, Net 8', '2% 7, Net 8', 24, 1, 'Compass-USA\Data Conversion', GetDate()),
('N416', '2.5% 7, Net 8', '2.5% 7, Net 8', 25, 1, 'Compass-USA\Data Conversion', GetDate()),
('N417', '3% 15, Net 30', '3% 15, Net 30', 26, 1, 'Compass-USA\Data Conversion', GetDate()),
('N418', '4% Net 30', '4% Net 30', 27, 1, 'Compass-USA\Data Conversion', GetDate()),
('N419', '5% 15, Net 30', '5% 15, Net 30', 28, 1, 'Compass-USA\Data Conversion', GetDate()),
('N420', '5% 30, Net 45', '5% 30, Net 45', 29, 1, 'Compass-USA\Data Conversion', GetDate()),
('N421', '5% 30, Net 60', '5% 30, Net 60', 30, 1, 'Compass-USA\Data Conversion', GetDate()),
('N422', '5.5% 17, Net 25', '5.5% 17, Net 25', 31, 1, 'Compass-USA\Data Conversion', GetDate()),
('N423', '6% 30, Net 45', '6% 30, Net 45', 32, 1, 'Compass-USA\Data Conversion', GetDate()),
('N424', '6% 60, Net 72', '6% 60, Net 72', 33, 1, 'Compass-USA\Data Conversion', GetDate()),
('N425', '6% Net 70', '6% Net 70', 34, 1, 'Compass-USA\Data Conversion', GetDate()),
('N426', '6.5% 21, Net 30', '6.5% 21, Net 30', 35, 1, 'Compass-USA\Data Conversion', GetDate()),
('N427', '7% 45, Net 60', '7% 45, Net 60', 36, 1, 'Compass-USA\Data Conversion', GetDate()),
('N428', '7% 60, Net 75', '7% 60, Net 75', 37, 1, 'Compass-USA\Data Conversion', GetDate()),
('N429', '8% 15, Net 30', '8% 15, Net 30', 38, 1, 'Compass-USA\Data Conversion', GetDate()),
('N430', '8% 20, Net 30', '8% 20, Net 30', 39, 1, 'Compass-USA\Data Conversion', GetDate()),
('N431', '8% 30, Net 45', '8% 30, Net 45', 40, 1, 'Compass-USA\Data Conversion', GetDate()),
('N432', '8% 45, Net 60', '8% 45, Net 60', 41, 1, 'Compass-USA\Data Conversion', GetDate()),
('N433', '8% 60, Net 75', '8% 60, Net 75', 42, 1, 'Compass-USA\Data Conversion', GetDate()),
('N434', '8.68% Net 7', '8.68% Net 7', 43, 1, 'Compass-USA\Data Conversion', GetDate()),
('N435', '9% 21, Net 30', '9% 21, Net 30', 44, 1, 'Compass-USA\Data Conversion', GetDate()),
('N436', '9% 60, Net 75', '9% 60, Net 75', 45, 1, 'Compass-USA\Data Conversion', GetDate()),
('N437', '5% 60, Net 70', '5% 60, Net 70', 46, 1, 'Compass-USA\Data Conversion', GetDate()),
('N438', '7.5% , Net 70', '7.5% , Net 70', 47, 1, 'Compass-USA\Data Conversion', GetDate()),
('N439', '5% 60, Net 75', '5% 60, Net 75', 48, 1, 'Compass-USA\Data Conversion', GetDate()),
('N440', '1% 10, Net 30', '1% 10, Net 30', 49, 1, 'Compass-USA\Data Conversion', GetDate()),
('N441', '2% 10, Net 30', '2% 10, Net 30', 50, 1, 'Compass-USA\Data Conversion', GetDate()),
('T230', '0% VA, 2% CD, 30 Days', '0% VA, 2% CD, 30 Days', 51, 1, 'Compass-USA\Data Conversion', GetDate()),
('V112', '2% VA 4% CD 45 DAYS', '2% VA 4% CD 45 DAYS', 52, 1, 'Compass-USA\Data Conversion', GetDate()),
('V118', '11.5% VA 0% CD 30 DAYS', '11.5% VA 0% CD 30 DAYS', 53, 1, 'Compass-USA\Data Conversion', GetDate()),
('V119', '2% VA 1% CD 30 DAYS', '2% VA 1% CD 30 DAYS', 54, 1, 'Compass-USA\Data Conversion', GetDate()),
('Z888', 'Z888 DAYS 0.0 DISCOUNT', 'Z888 DAYS 0.0 DISCOUNT', 55, 1, 'Compass-USA\Data Conversion', GetDate()),
('N000', 'Net Due Immediately', 'Net Due Immediately', 56, 1, 'Compass-USA\Data Conversion', GetDate()),
('N005', 'Due Net 5 Days', 'Due Net 5 Days', 57, 1, 'Compass-USA\Data Conversion', GetDate()),
('N007', 'Due Net 7 Days', 'Due Net 7 Days', 58, 1, 'Compass-USA\Data Conversion', GetDate()),
('N010', 'Due Net 10 Days', 'Due Net 10 Days', 59, 1, 'Compass-USA\Data Conversion', GetDate()),
('N014', 'Due Net 14 Days', 'Due Net 14 Days', 60, 1, 'Compass-USA\Data Conversion', GetDate()),
('N015', 'Due Net 15 Days', 'Due Net 15 Days', 61, 1, 'Compass-USA\Data Conversion', GetDate()),
('N016', 'Due Net 16 Days', 'Due Net 16 Days', 62, 1, 'Compass-USA\Data Conversion', GetDate()),
('N020', 'Due Net 20 Days', 'Due Net 20 Days', 63, 1, 'Compass-USA\Data Conversion', GetDate()),
('N021', 'Due Net 21 Days', 'Due Net 21 Days', 64, 1, 'Compass-USA\Data Conversion', GetDate()),
('N022', 'Due Net 22 Days', 'Due Net 22 Days', 65, 1, 'Compass-USA\Data Conversion', GetDate()),
('N025', 'Due Net 25 Days', 'Due Net 25 Days', 66, 1, 'Compass-USA\Data Conversion', GetDate()),
('N027', 'Due Net 27 Days', 'Due Net 27 Days', 67, 1, 'Compass-USA\Data Conversion', GetDate()),
('N028', 'Due Net 28 Days', 'Due Net 28 Days', 68, 1, 'Compass-USA\Data Conversion', GetDate()),
('N030', 'Due Net 30 Days', 'Due Net 30 Days', 69, 1, 'Compass-USA\Data Conversion', GetDate()),
('N035', 'Due Net 35 Days', 'Due Net 35 Days', 70, 1, 'Compass-USA\Data Conversion', GetDate()),
('N040', 'Due Net 40 Days', 'Due Net 40 Days', 71, 1, 'Compass-USA\Data Conversion', GetDate()),
('N042', 'Due Net 42 Days', 'Due Net 42 Days', 72, 1, 'Compass-USA\Data Conversion', GetDate()),
('N045', 'Due Net 45 Days', 'Due Net 45 Days', 73, 1, 'Compass-USA\Data Conversion', GetDate()),
('N050', 'Due Net 50 Days', 'Due Net 50 Days', 74, 1, 'Compass-USA\Data Conversion', GetDate()),
('N052', 'Due Net 52 Days', 'Due Net 52 Days', 75, 1, 'Compass-USA\Data Conversion', GetDate()),
('N054', 'Due Net 54 Days', 'Due Net 54 Days', 76, 1, 'Compass-USA\Data Conversion', GetDate()),
('N060', 'Due Net 60 Days', 'Due Net 60 Days', 77, 1, 'Compass-USA\Data Conversion', GetDate()),
('N065', 'Due Net 65 Days', 'Due Net 65 Days', 78, 1, 'Compass-USA\Data Conversion', GetDate()),
('N070', 'Due Net 70 Days', 'Due Net 70 Days', 79, 1, 'Compass-USA\Data Conversion', GetDate()),
('N075', 'Due Net 75 Days', 'Due Net 75 Days', 80, 1, 'Compass-USA\Data Conversion', GetDate()),
('N090', 'Due Net 90 Days', 'Due Net 90 Days', 81, 1, 'Compass-USA\Data Conversion', GetDate()),
('N110', '1% 10, Net 45', '1% 10, Net 45', 82, 1, 'Compass-USA\Data Conversion', GetDate()),
('N111', '1% 10, Net 11', '1% 10, Net 11', 83, 1, 'Compass-USA\Data Conversion', GetDate()),
('N115', '1% 15, Net 60', '1% 15, Net 60', 84, 1, 'Compass-USA\Data Conversion', GetDate()),
('N120', 'Due Net  120 Days', 'Due Net  120 Days', 85, 1, 'Compass-USA\Data Conversion', GetDate()),
('N130', '1% 15, Net 30', '1% 15, Net 30', 86, 1, 'Compass-USA\Data Conversion', GetDate()),
('N140', '1% 15, Net 40', '1% 15, Net 40', 87, 1, 'Compass-USA\Data Conversion', GetDate()),
('N145', '1% 20, Net 45', '1% 20, Net 45', 88, 1, 'Compass-USA\Data Conversion', GetDate()),
('N150', '1% 10, Net 30', '1% 10, Net 30', 89, 1, 'Compass-USA\Data Conversion', GetDate()),
('N175', '1% 15, Net 75', '1% 15, Net 75', 90, 1, 'Compass-USA\Data Conversion', GetDate()),
('N180', 'Due Net  180 Days', 'Due Net  180 Days', 91, 1, 'Compass-USA\Data Conversion', GetDate()),
('N210', '2% 10, Net 30', '2% 10, Net 30', 92, 1, 'Compass-USA\Data Conversion', GetDate()),
('N215', '2% 15, Net 16', '2% 15, Net 16', 93, 1, 'Compass-USA\Data Conversion', GetDate()),
('N220', '2% 20, Net 60', '2% 20, Net 60', 94, 1, 'Compass-USA\Data Conversion', GetDate()),
('N221', '2% 10, Net 20', '2% 10, Net 20', 95, 1, 'Compass-USA\Data Conversion', GetDate()),
('N222', '2% 10, Net 10', '2% 10, Net 10', 96, 1, 'Compass-USA\Data Conversion', GetDate()),
('N305', 'Due 15 Days after Month End', 'Due 15 Days after Month End', 97, 1, 'Compass-USA\Data Conversion', GetDate()),
('N315', '3% 15 Days, Net 120', '3% 15 Days, Net 120', 98, 1, 'Compass-USA\Data Conversion', GetDate()),
('N365', 'Due Net 365 Days', 'Due Net 365 Days', 99, 1, 'Compass-USA\Data Conversion', GetDate()),
('N510', '0.5% 10, Net 30', '0.5% 10, Net 30', 100, 1, 'Compass-USA\Data Conversion', GetDate()),
('N525', '0.5% 25, Net 30', '0.5% 25, Net 30', 101, 1, 'Compass-USA\Data Conversion', GetDate())


Insert Into dbo.AppIECategories(AppIECategory, AppIEcBrief, AppIEcTitle, AppIEcDescription, AppIEcDisplayOrder, AppIEcActive, AppIEcModBy, AppIEcModAt)
Values (1, 'GLAccountImport', 'GL Accounts Import', 'GL Accounts Import', 1, 1, 'Compass-USA\Data Conversion', GetDate()),
(2, 'VendorImport', 'Vendors Import', 'Vendors Import', 2, 1, 'Compass-USA\Data Conversion', GetDate()),
(3, 'HouseCodeImport', 'House Codes Import', 'House Codes Import', 3, 1, 'Compass-USA\Data Conversion', GetDate()),
(4, 'GLTransactionImport', 'GL Transactions Import', 'GL Transactions Import', 4, 1, 'Compass-USA\Data Conversion', GetDate()),
(5, 'EmployeeImport', 'Employees Import', 'Employees Import', 5, 1, 'Compass-USA\Data Conversion', GetDate()),
(6, 'LinenMasterImport', 'Linen Master Invoices Import', 'Linen Master Invoices Import', 6, 1, 'Compass-USA\Data Conversion', GetDate()),
(7, 'MCPOImport', 'Maintenance Connection PO Import', 'Maintenance Connection PO Import', 7, 1, 'Compass-USA\Data Conversion', GetDate()),
(8, 'APInvoiceImport', 'AP Invoices Import', 'AP Invoices Import', 8, 1, 'Compass-USA\Data Conversion', GetDate()),
(9, 'APCheckImport', 'AP Check Import', 'AP Check Import', 9, 1, 'Compass-USA\Data Conversion', GetDate()),
(10, 'ARBalanceImport', 'AR Balance Import', 'AR Balance Import', 10, 1, 'Compass-USA\Data Conversion', GetDate()),
(11, 'ARUnappliedCashImport', 'AR Unapplied Cash Import', 'AR Unapplied Cash Import', 11, 1, 'Compass-USA\Data Conversion', GetDate()),
(12, 'CustomerTermsCodeImport', 'Customer Terms Code Import', 'Customer Terms Code Import', 12, 1, 'Compass-USA\Data Conversion', GetDate()),
(13, 'CustomerExport', 'Customers Export', 'Customers Export', 13, 1, 'Compass-USA\Data Conversion', GetDate()),
(14, 'CheckRequestExport', 'Check Requests Export', 'Check Requests Export', 14, 1, 'Compass-USA\Data Conversion', GetDate()),
(15, 'InvoiceExport', 'AR Invoices Export', 'AR Invoices Export', 15, 1, 'Compass-USA\Data Conversion', GetDate()),
(16, 'ForecastExport', 'Budget WOR Forecast Export', 'Budget WOR Forecast Export', 16, 1, 'Compass-USA\Data Conversion', GetDate()),
(17, 'PTOBalanceExport', 'Employee PTO Balance Export', 'Employee PTO Balance  Export', 17, 1, 'Compass-USA\Data Conversion', GetDate()),
(18, 'POLaserficheExport', 'Purchase Orders to Laserfiche Export', 'Purchase Orders to Laserfiche Export', 18, 1, 'Compass-USA\Data Conversion', GetDate()),
(19, 'EPayBatchImport', 'EPay Batch Import ', 'EPay Batch Import', 19, 1, 'Compass-USA\Data Conversion', GetDate())

Select * From dbo.AppIECategories

INSERT INTO dbo.PurPOSendMethodTypes(PurPOsmtBrief, PurPOsmtTitle, PurPOsmtDescription, PurPOsmtDisplayOrder, PurPOsmtActive, PurPOsmtModBy, PurPOsmtModAt)
VALUES ('None', 'None', 'None', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Select * From dbo.PurPOSendMethodTypes
Update dbo.PurPOSendMethodTypes Set PurPOsmtActive = 0 Where PurPOSendMethodType = 3
Update dbo.PurPOSendMethodTypes Set PurPOsmtDisplayOrder = 2 Where PurPOSendMethodType = 1
Update dbo.PurPOSendMethodTypes Set PurPOsmtDisplayOrder = 3 Where PurPOSendMethodType = 2
Update dbo.PurPOSendMethodTypes Set PurPOsmtDisplayOrder = 4 Where PurPOSendMethodType = 3
Update dbo.PurPOSendMethodTypes Set PurPOsmtDisplayOrder = 1 Where PurPOSendMethodType = 4 

Select * From dbo.HcmJobTypes
Update dbo.HcmJobTypes Set HcmJobtActive = 0 Where HcmJobType = 5

/*
Select * From PurVendors Where PurVenActive = 0 And AppTransactionStatusType = 2 And PurVenBlockCentralPosting = 0 And PurVenBlockPayment = 0 And PurVenBlockPostingCompanyCode = 0
Select * From PurVendors Where PurVenActive = 0 And AppTransactionStatusType = 2 And (PurVenBlockCentralPosting = 1 Or PurVenBlockPayment = 1 Or PurVenBlockPostingCompanyCode = 1)

Update dbo.PurVendors Set PurVenActive = 1, AppTransactionStatusType = 8 Where PurVenActive = 0 And AppTransactionStatusType = 2 And PurVenBlockCentralPosting = 0 And PurVenBlockPayment = 0 And PurVenBlockPostingCompanyCode = 0
Update dbo.PurVendors Set AppTransactionStatusType = 6 Where PurVenActive = 0 And AppTransactionStatusType = 2 And (PurVenBlockCentralPosting = 1 Or PurVenBlockPayment = 1 Or PurVenBlockPostingCompanyCode = 1)
*/

-- No need to insert the data into FscAccountCategories table.
INSERT INTO dbo.FscAccountCategories(FscAcccBrief, FscAcccTitle, FscAcccDescription, FscAcccDisplayOrder, FscAcccActive, FscAcccModBy, FscAcccModAt)
VALUES('ARRC', 'Account Receivable recon. acct', 'Account Receivable recon. acct', 1, 1, 'Compass-UsA\Data Conversion', GetDate()),
('AS', 'Fixed assets accounts', 'Fixed assets accounts', 2, 1, 'Compass-UsA\Data Conversion', GetDate()),
('ASST', 'Assets - General', 'Assets - General', 3, 1, 'Compass-UsA\Data Conversion', GetDate()),
('BUDG', 'Budget account ranges', 'Budget account ranges', 4, 1, 'Compass-UsA\Data Conversion', GetDate()),
('CASH', 'Liquid funds accounts', 'Liquid funds accounts', 5, 1, 'Compass-UsA\Data Conversion', GetDate()),
('CLER', 'Clearing Default Accounts', 'Clearing Default Accounts', 6, 1, 'Compass-UsA\Data Conversion', GetDate()),
('GAEX', 'G&A Expense Accounts', 'G&A Expense Accounts', 7, 1, 'Compass-UsA\Data Conversion', GetDate()),
('GL', 'General G/L accounts', 'General G/L accounts', 8, 1, 'Compass-UsA\Data Conversion', GetDate()),
('INCO', 'Intercompany Accounts', 'Intercompany Accounts', 9, 1, 'Compass-UsA\Data Conversion', GetDate()),
('LIAB', 'Liabilities - General', 'Liabilities - General', 10, 1, 'Compass-UsA\Data Conversion', GetDate()),
('MAT', 'Materials management accounts', 'Materials management accounts', 11, 1, 'Compass-UsA\Data Conversion', GetDate()),
('OPEX', 'Operating Expenses', 'Operating Expenses', 12, 1, 'Compass-UsA\Data Conversion', GetDate()),
('ORBP', 'Orbian Accounts Payable', 'Orbian Accounts Payable', 13, 1, 'Compass-UsA\Data Conversion', GetDate()),
('PL', 'Income statement accounts', 'Income statement accounts', 14, 1, 'Compass-UsA\Data Conversion', GetDate()),
('REVE', 'Revenue Accounts', 'Revenue Accounts', 15, 1, 'Compass-UsA\Data Conversion', GetDate()),
('STAT', 'Statistical Accounts', 'Statistical Accounts', 16, 1, 'Compass-UsA\Data Conversion', GetDate())
Select * From dbo.FscAccountCategories

Select * From dbo.AppSystemVariables

Update dbo.AppSystemVariables Set AppSysVariableName = 'LaserficheURL', AppSysVariableValue = 'https://lf-test.compass-usa.com/weblink/DocView.aspx?id=' Where AppSysVariableName = 'ScerISWebURL'

INSERT INTO dbo.AppSystemVariables(AppSysVariableName, AppSysVariableValue, AppSysActive, AppSysModBy, AppSysModAt)
VALUES('TeamFinV2URL', 'https://fin.crothall.com', 1, 'Compass-UsA\Data Conversion', GetDate()),
('CPMWebURL', 'https://cpm.compassmanager.com', 1, 'Compass-UsA\Data Conversion', GetDate())


-- HouseCodes --> Activate House Codes Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 705
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Activate House Codes' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/hcm/activateHouseCode/usr/markup.htm'
	, @HirNodeParent
	
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup%' Order By HirNode

Update EsmV2.dbo.AppMenuItems Set AppMeniBrief = 'Activate HC', AppMeniID = 'ActivateHC' Where AppMenuItem = 5143
Update EsmV2.dbo.HirNodes Set HirNodBrief = 'ActivateHC', HirNodTitle = 'Activate House Codes' Where HirNode = 73179
-- HouseCodes --> Activate House Codes Menu Insert [End] 

-- Setup --> CPM Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 801
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'CPM' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/emp/cpm/usr/markup.htm'
	, @HirNodeParent
	
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup%' Order By HirNode
-- Setup --> CPM Menu Insert  [End] 


-- Setup --> Users Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 801
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Users' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/emp/userSearch/usr/markup.htm'
	, @HirNodeParent
	
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup%' Order By HirNode
-- Setup --> Users Menu Insert  [End] 

-- Payroll --> Epay Menu Insert [Begin]
Declare @DisplayOrderMenu Int = 306
	, @HirNodeParent Int
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Epay' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/pay/ePay/usr/markup.htm?redirectURL=https://www.blueforce.com/login/'
	, @HirNodeParent
	
Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Payroll%' Order By HirNode
-- Payroll --> Epay Menu Insert  [End] 


/*
-- Increased HcmJobBrief column in HcmJobs table from Varchar(8) to Varchar(16) - [Begin]
Tables

EPaySiteTasks
HcmJobs
RevInvoices
RevUnappliedCashes
WomWorkOrders

Stored Procedures

EpaySiteTasksSelect
HcmHouseCodeJobsAssignCustomer
RevInvoiceBulkImportValidate
RevInvoiceInsert
RevInvoiceItemUpdateFromBulkImport
RevInvoiceUpdate
RevInvoiceUpdateFromWorkOrder
RevInvoiceItemDelete
RevInvoiceItemSalesTaxUpdateAll
RevInvoiceItemUpdate
RevInvoiceItemUpdateFromBulkImport
RevInvoiceItemUpdateFromClone
RevTaxRatesSelect
WomWorkOrderUpdate

Functions
RevHcmHouseCodeJobsSelect
-- Increased HcmJobBrief column in HcmJobs table from Varchar(8) to Varchar(16) - [End]
*/

/*

ALTER TABLE HcmJobs ALTER COLUMN HcmJobBrief VARCHAR(16)
ALTER TABLE EPaySiteTasks ALTER COLUMN HcmJobBrief VARCHAR(16)
ALTER TABLE EPaySiteTasks ALTER COLUMN JobSiteID VARCHAR(16)
ALTER TABLE RevInvoices ALTER COLUMN HcmJobBrief VARCHAR(16)
ALTER TABLE RevInvoices ALTER COLUMN RevInvServiceLocationBrief VARCHAR(16)
ALTER TABLE RevUnappliedCashes ALTER COLUMN HcmJobBrief VARCHAR(16)
ALTER TABLE WomWorkOrders ALTER COLUMN WomwoServiceLocationBrief VARCHAR(16)
ALTER TABLE WomWorkOrders ALTER COLUMN WomwoCustomerBrief VARCHAR(16)

ALTER TABLE [dbo].[EmpPTOPlanTypes] DROP COLUMN EmpStatusCategoryType

ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucCPIPercentage
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucCPIAmount
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucCPIDate
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucCPIECIWaived
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucCPIEnteredBy
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucCPIEnteredAt
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevCPIPercentage
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevCPIAmount
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevCPIDate
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevCPIECIWaived
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevCPIEnteredBy
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevCPIEnteredAt
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevPrevCPIPercentage
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevPrevCPIAmount
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevPrevCPIDate
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevPrevCPIECIWaived
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevPrevCPIEnteredBy
ALTER TABLE [dbo].[HcmHouseCodes] DROP COLUMN HcmHoucPrevPrevCPIEnteredAt

ALTER TABLE dbo.LMInvoiceDetails ADD LMID VARCHAR(10)

ALTER TABLE dbo.RevUnappliedCashes ADD RevUnacDocumentType VARCHAR(2) NULL
ALTER TABLE dbo.RevUnappliedCashes ADD RevUnacMatchingDoc VARCHAR(10) NULL
ALTER TABLE dbo.RevUnappliedCashes ADD RevUnacInvoiceDate DATETIME NULL
ALTER TABLE dbo.RevUnappliedCashes ADD RevUnacDueDate DATETIME NULL
ALTER TABLE dbo.RevUnappliedCashes ADD RevUnacCustomerName VARCHAR(30) NULL
ALTER TABLE dbo.RevUnappliedCashes ADD RevUnacCostCenterName VARCHAR(30) NULL

ALTER TABLE dbo.RevInvoices ADD RevInvDocumentNumber VARCHAR(10) NULL
ALTER TABLE dbo.RevAccountReceivablePaidImports ADD RevAccrpiInvoiceNumber BIGINT NULL
ALTER TABLE dbo.RevAccountReceivablePaidImports ALTER COLUMN RevAccrpiDocumentNumber BIGINT
ALTER TABLE dbo.PurPurchaseOrders ADD PurPuroHouseCodePONumber VARCHAR(32) NULL
ALTER TABLE dbo.PurPurchaseOrders ADD PurPuroMiscPurchaseOrder BIT NULL
ALTER TABLE dbo.PurPurchaseOrders ALTER COLUMN PurVendor INT NULL
ALTER TABLE dbo.RevAccountPayableInvoices ADD RevApiLaserficheDocID VARCHAR(25)
ALTER TABLE dbo.PurPurchaseOrderDetails ALTER COLUMN PurCatalogItem INT NULL
ALTER TABLE dbo.PurPurchaseOrderDetails ADD FscAccount INT NULL
ALTER TABLE dbo.PurPurchaseOrderDetails ADD PurPurodItemNumber VARCHAR(256) NULL
ALTER TABLE dbo.PurPurchaseOrderDetails ADD PurPurodDescription VARCHAR(256) NULL
ALTER TABLE dbo.PurPurchaseOrderDetails ADD PurPurodUom VARCHAR(256) NULL
ALTER TABLE dbo.RevAccountPayableChecks ALTER COLUMN RevApcCheckNumber BIGINT
ALTER TABLE dbo.RevAccountPayableChecks ALTER COLUMN RevApcDocNumber BIGINT
ALTER TABLE dbo.RevAccountPayableChecks ALTER COLUMN RevApcVendorNumber BIGINT
ALTER TABLE dbo.RevAccountPayableChecks ADD RevApcCheckAmount Decimal(18, 2) NULL

ALTER TABLE dbo.PurPurchaseOrders ADD PurPORequisition INT NULL
ALTER TABLE dbo.FscAccountCategories ADD FscAcccBrief VARCHAR(16) NULL
ALTER TABLE dbo.FscAccountCategories ADD FscAcccDescription VARCHAR(256) NULL

ALTER TABLE dbo.RevAccountPayableInvoices ALTER COLUMN RevApiVendorNumber BIGINT
ALTER TABLE dbo.RevAccountPayableInvoices ALTER COLUMN RevApiDocNumber BIGINT
ALTER TABLE dbo.RevAccountPayableInvoices ALTER COLUMN RevApiPONumber VARCHAR(10)
ALTER TABLE dbo.RevAccountPayableInvoices ALTER COLUMN RevApiTransmittalGLAccount VARCHAR(10)
ALTER TABLE dbo.LMInvoiceDetails ADD ExportedDate DateTime
ALTER TABLE dbo.RevAccountPayableInvoices ALTER COLUMN RevApiLaserficheDocID VARCHAR(12)
ALTER TABLE dbo.RevInvoices ADD HcmHouseCodeJob INT NULL
ALTER TABLE dbo.LMInvoiceDetails ALTER COLUMN AcctCode VARCHAR(16)

ALTER TABLE dbo.PurVendors ALTER COLUMN PurVenEmail VARCHAR(256)
ALTER TABLE dbo.AppJDEGLTransactionPendings ALTER COLUMN AppJDEtDocumentNo BIGINT
ALTER TABLE dbo.AppJDEGLTransactionPendings ALTER COLUMN AppJDEtPurchaseOrderNumber BIGINT
*/


--Drop and create the following 2 tables and execute the following scripts before deployment
1. AppIEExceptions
2. AppIETransactions

USE [TeamFinV2]
GO

/****** Object:  Table [dbo].[AppIEExceptions]    Script Date: 12/28/2017 7:51:07 PM ******/
DROP TABLE [dbo].[AppIEExceptions]
GO

/****** Object:  Table [dbo].[AppIEExceptions]    Script Date: 12/28/2017 7:51:07 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[AppIEExceptions](
	[AppIEException] [int] IDENTITY(1,1) NOT NULL,
	[AppIECategory] [int] NOT NULL,
	[AppIETransactionID] [uniqueidentifier] NULL,
	[AppIEeTitle] [varchar](256) NULL,
	[AppIEeContent] [varchar](8000) NULL,
	[AppIEeTime] [datetime] NULL,
 CONSTRAINT [PK_AppIEException] PRIMARY KEY CLUSTERED 
(
	[AppIEException] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO


USE [TeamFinV2]
GO

/****** Object:  Table [dbo].[AppIETransactions]    Script Date: 12/28/2017 7:51:33 PM ******/
DROP TABLE [dbo].[AppIETransactions]
GO

/****** Object:  Table [dbo].[AppIETransactions]    Script Date: 12/28/2017 7:51:33 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[AppIETransactions](
	[AppIETransaction] [int] IDENTITY(1,1) NOT NULL,
	[AppIECategory] [int] NOT NULL,
	[AppIETransactionID] [uniqueidentifier] NOT NULL,
	[AppIEtStartTime] [datetime] NULL,
	[AppIEtFinishTime] [datetime] NULL,
	[AppIEtTotalValidRecords] [int] NULL,
	[AppIEtTotalBadRecords] [int] NULL,
	[AppIEtTotalDuplicateRecords] [int] NULL,
 CONSTRAINT [PK_AppIETransaction] PRIMARY KEY CLUSTERED 
(
	[AppIETransaction] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

ALTER TABLE EPaySiteTasks ALTER COLUMN HcmJobBrief VARCHAR(16) 
ALTER TABLE EPaySiteTasks ALTER COLUMN JobSiteID VARCHAR(16)

USE [TeamFinv2]
GO

/****** Object:  Index [HouseCode]    Script Date: 11/21/2017 5:23:39 AM ******/
DROP INDEX [HouseCode] ON [dbo].[AppJDEGLTransactions]
GO

/****** Object:  Index [UniqueKey]    Script Date: 11/20/2017 8:51:59 AM ******/
DROP INDEX [UniqueKey] ON [dbo].[AppJDEGLTransactions]
GO

ALTER TABLE dbo.AppJDEGLTransactions ALTER COLUMN AppJDEtVendorNumber VARCHAR(16)
ALTER TABLE dbo.AppJDEGLTransactions ALTER COLUMN AppJDEtDocumentNo BIGINT
ALTER TABLE dbo.AppJDEGLTransactions ALTER COLUMN AppJDEtPurchaseOrderNumber BIGINT

USE [TeamFinv2]
GO

/****** Object:  Index [HouseCode]    Script Date: 11/21/2017 5:17:44 AM ******/
CREATE NONCLUSTERED INDEX [HouseCode] ON [dbo].[AppJDEGLTransactions]
(
	[HcmHouseCode] ASC,
	[FscAccount] ASC,
	[AppJDEtGLDate] ASC
)
INCLUDE ( 	[AppJDEtDocumentType],
	[AppJDEtDocumentNo],
	[AppJDEtAmount],
	[AppJDEtVendor]) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO

USE [TeamFinv2]
GO

/****** Object:  Index [UniqueKey]    Script Date: 11/21/2017 5:18:28 AM ******/
CREATE NONCLUSTERED INDEX [UniqueKey] ON [dbo].[AppJDEGLTransactions]
(
	[AppJDEtDocumentType] ASC,
	[AppJDEtDocumentNo] ASC,
	[AppJDEtLineNumber] ASC,
	[AppJDEtGLDate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
GO


--Update following 3 stored procedures manually on production server
EmpPTOBalanceUpdate
EmpPTOBalanceUpdateAccrural
EmpPTOEmpBalancePreserveAccrural

TRUNCATE TABLE SAPReference.dbo.ERROR_LOG
DROP TABLE SAPReference.dbo.AppUnits_Old
DROP TABLE SAPReference.dbo.AppUnitsTemp
DROP TABLE SAPReference.dbo.BudBudgetWORForecasts_STAGE
DROP TABLE SAPReference.dbo.BudBudgetWORForecastSnapshots_STAGE
DROP TABLE SAPReference.dbo.BudDetails_STAGE
DROP TABLE SAPReference.dbo.Details_TEST
DROP TABLE SAPReference.dbo.EmpEmployeeGenerals
DROP TABLE SAPReference.dbo.EmpTemp
DROP TABLE SAPReference.dbo.HirNodes_Old
DROP TABLE SAPReference.dbo.HirNodesTemp
DROP TABLE SAPReference.dbo.RevInvoiceItem_Old_FscAccount
DROP TABLE SAPReference.dbo.SAPCostCenterCrossReferenceOld
DROP TABLE SAPReference.dbo.SAPEmployeeNumberCrossReference_OLD
DROP TABLE SAPReference.dbo.stage_AppJDEGLTransactions
DROP TABLE SAPReference.dbo.stage_BudAdjustments
DROP TABLE SAPReference.dbo.stage_BudAnnualProjectionSnapshots
DROP TABLE SAPReference.dbo.stage_BudBudgetWORForecasts
DROP TABLE SAPReference.dbo.stage_BudBudgetWORForecastSnapshots
DROP TABLE SAPReference.dbo.stage_BudDetails
DROP TABLE SAPReference.dbo.stage_BudIncomeTypes
DROP TABLE SAPReference.dbo.stage_BudProjectedDetails
DROP TABLE SAPReference.dbo.stage_BudSummaryComments
DROP TABLE SAPReference.dbo.stage_BudSupplyExpenditures
DROP TABLE SAPReference.dbo.stage_EpayBatchHoursProcessedImports
DROP TABLE SAPReference.dbo.stage_EpayDailyTimeSheetsProcessedImports
DROP TABLE SAPReference.dbo.stage_EpayHoursProcessedImports
DROP TABLE SAPReference.dbo.stage_EpayMBAlertProcessedImports
DROP TABLE SAPReference.dbo.stage_EpayMealBreaksProcessedImports
DROP TABLE SAPReference.dbo.stage_EpayPunchAuditsProcessedImports
DROP TABLE SAPReference.dbo.stage_EpayPunchDatasProcessedImports
DROP TABLE SAPReference.dbo.stage_EPPUNCHMSEC
DROP TABLE SAPReference.dbo.stage_FscJDECompanies
DROP TABLE SAPReference.dbo.stage_InvInventoryItems
DROP TABLE SAPReference.dbo.stage_Laundry_Metric
DROP TABLE SAPReference.dbo.stage_Laundry_Product
DROP TABLE SAPReference.dbo.stage_LMInvoiceDetails
DROP TABLE SAPReference.dbo.stage_PurItems
DROP TABLE SAPReference.dbo.stage_PurPORequisitionDetails
DROP TABLE SAPReference.dbo.stage_RevAccountPayableChecks
DROP TABLE SAPReference.dbo.stage_RevAccountPayableInvoices
DROP TABLE SAPReference.dbo.stage_RevAccountReceivablePaidImports
DROP TABLE SAPReference.dbo.stage_RevInvoiceItems
DROP TABLE SAPReference.dbo.stage_RevUnappliedCashes
DROP TABLE SAPReference.dbo.stage_RptLaundryTargets
DROP TABLE SAPReference.dbo.stage_WomWorkOrderTasks
DROP TABLE SAPReference.dbo.VendTemp
DROP TABLE SAPReference.dbo.VendTemporig
DROP TABLE SAPReference.dbo.stage_HcmHouseCodeJobs
DROP TABLE SAPReference.dbo.stage_HcmHouseCodeJobs_SAPNumbers
DROP TABLE SAPReference.dbo.stage_HcmHouseCodes
DROP TABLE SAPReference.dbo.stage_HcmHouseCodes_SAPNumbers
DROP TABLE SAPReference.dbo.stage_RevInvoices


--Exec SAPReference.dbo.insert_NewFscAccountCategories
Exec SAPReference.dbo.insert_NewFscAccounts
Exec SAPReference.dbo.insert_NewPayPayCodes
Exec SAPReference.dbo.EmpEmployeeGenerals_EmpNumberUpdate
Exec SAPReference.dbo.Esmv2_HouseCodeInfo_Update
Exec SAPReference.dbo.PurVendors_VendNumberUpdate
Exec SAPReference.dbo.trans_AppJDEGLTransactions 'U'
Exec SAPReference.dbo.trans_BudAdjustments 'U'
Exec SAPReference.dbo.trans_BudAnnualProjectionSnapshots 'U'
Exec SAPReference.dbo.trans_BudBudgetWORForecasts 'U'
Exec SAPReference.dbo.trans_BudBudgetWORForecastSnapshots 'U'
Exec SAPReference.dbo.trans_BudDetails 'U'
Exec SAPReference.dbo.trans_BudIncomeTypes 'U'
Exec SAPReference.dbo.trans_BudProjectedDetails 'U'
Exec SAPReference.dbo.trans_BudSummaryComments 'U'
Exec SAPReference.dbo.trans_BudSupplyExpenditures 'U'
Exec SAPReference.dbo.trans_EpayBatchHoursProcessedImports 'U'
Exec SAPReference.dbo.trans_EpayDailyTimeSheetsProcessedImports 'U'
Exec SAPReference.dbo.trans_EpayHoursProcessedImports 'U'
Exec SAPReference.dbo.trans_EpayMBAlertProcessedImports 'U'
Exec SAPReference.dbo.trans_EpayMealBreaksProcessedImports 'U'
Exec SAPReference.dbo.trans_EpayPunchAuditsProcessedImports 'U'
Exec SAPReference.dbo.trans_EpayPunchDatasProcessedImports 'U'
Exec SAPReference.dbo.trans_EPPUNCHMSEC 'U'
Exec SAPReference.dbo.trans_FscJDECompanies 'U'
Exec SAPReference.dbo.trans_InvInventoryItems 'U'
Exec SAPReference.dbo.trans_Laundry_Metric 'U'
Exec SAPReference.dbo.trans_Laundry_Product 'U'
Exec SAPReference.dbo.trans_LMInvoiceDetails 'U'
Exec SAPReference.dbo.trans_PurItems 'U'
Exec SAPReference.dbo.trans_PurPORequisitionDetails 'U'
Exec SAPReference.dbo.trans_RevAccountPayableChecks 'U'
Exec SAPReference.dbo.trans_RevAccountPayableInvoices 'U'
Exec SAPReference.dbo.trans_RevAccountReceivablePaidImports 'U'
Exec SAPReference.dbo.trans_RevInvoiceItems 'U'
Exec SAPReference.dbo.trans_RevUnappliedCashes 'U'
Exec SAPReference.dbo.trans_RptLaundryTargets 'U'
Exec SAPReference.dbo.trans_WomWorkOrderTasks 'U'
Exec SAPReference.dbo.trans_HcmHouseCodes_HcmHouseCodeJobs 'U'
Exec SAPReference.dbo.trans_HcmHouseCodes_HcmHouseCodeJobs_SAPNumbers 'U'
Exec SAPReference.dbo.trans_RevInvoices 'U'


ALTER TABLE EmpPTOEmployeeBalanceHours ALTER COLUMN EmpPtoebhBalanceHours DECIMAL(12, 2)
ALTER TABLE EmpPTOEmployeeBalanceHours ALTER COLUMN EmpPtoebhPrevBalanceHours DECIMAL(12, 2)
ALTER TABLE dbo.PurMCPurchaseOrders ALTER COLUMN PurMCpoOrderNumber VARCHAR(15)

Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodActive = 1 And HirNodFullPath Like '\crothall\chimes\fin\Payroll\ProcessPayroll%'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ExportBatch'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\FinalizeBatch'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\PrepareBatch'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ReconcileBatch'
Select * From Esmv2.dbo.HirNodes Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ExportedBatch'

Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ExportBatch'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\FinalizeBatch'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\PrepareBatch'
Update Esmv2.dbo.HirNodes Set HirNodActive = 0 Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ReconcileBatch'
Update Esmv2.dbo.HirNodes Set HirNodBrief = 'ImportedBatch', HirNodTitle = 'Imported Batches', HirNodDescription = 'Imported Batches' 
, HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ImportedBatch', HirNodLevel6 = 'ImportedBatch'
Where HirHierarchy = 1 And HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll\ExportedBatch'


Select * from Esmv2.dbo.M_ENV_ENVIRONMENTS
-- Update it on LEGACY database
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_LOGOUT_URL = 'https://fin.crothall.com/fin/app/usr/closeBrowser.htm'
Where M_ENV_ENVIRONMENT = 4


-- Add Read/Write security nodes for newly added fields in Jobs [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\Jobs%' Order By HirNode

Update ESMV2.dbo.HirNodes Set HirNodBrief = 'Title', HirNodTitle = 'Title', HirNodDescription = 'Title', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Title', HirNodLevel6 = 'Title'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Description'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'Read', HirNodTitle = 'Read', HirNodDescription = 'Read', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Title\Read', HirNodLevel6 = 'Title'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Description\Read'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'Write', HirNodTitle = 'Write', HirNodDescription = 'Write', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Title\Write', HirNodLevel6 = 'Title'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Description\Write'

Update ESMV2.dbo.HirNodes Set HirNodBrief = 'ContactName', HirNodTitle = 'Contact Name', HirNodDescription = 'Contact Name', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactName', HirNodLevel6 = 'ContactName'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Contact'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'Read', HirNodTitle = 'Read', HirNodDescription = 'Read', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactName\Read', HirNodLevel6 = 'ContactName'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Contact\Read'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'Write', HirNodTitle = 'Write', HirNodDescription = 'Write', HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactName\Write', HirNodLevel6 = 'ContactName'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Contact\Write'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ContactPhone', 'Contact Phone', 'Contact Phone', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactPhone', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'ContactPhone', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactPhone'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactPhone\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'ContactPhone', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\ContactPhone\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'ContactPhone', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'County', 'County', 'County', @DisplayOrder + 4, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\County', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'County', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\County'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 5, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\County\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'County', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 6, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\County\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'County', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Country', 'Country', 'Country', @DisplayOrder + 7, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\Country', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'Country', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Country'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 8, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\Country\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'Country', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 9, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\Country\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'Country', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Industry', 'Industry', 'Industry', @DisplayOrder + 10, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\Industry', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'Industry', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\Industry'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 11, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\Industry\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'Industry', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 12, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\Industry\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'Industry', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PaymentTerm', 'Payment Term', 'Payment Term', @DisplayOrder + 13, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\PaymentTerm', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'PaymentTerm', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\PaymentTerm'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 14, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\PaymentTerm\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'PaymentTerm', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 15, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\PaymentTerm\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'PaymentTerm', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CustomerName', 'Customer Name', 'Customer Name', @DisplayOrder + 16, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerName', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'CustomerName', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerName'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 17, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerName\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'CustomerName', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 18, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerName\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'CustomerName', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'CustomerPhone', 'Customer Phone', 'Customer Phone', @DisplayOrder + 19, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerPhone', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'CustomerPhone', 'Compass-USA\Data Conversion', GetDate())
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerPhone'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 20, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerPhone\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'CustomerPhone', 'Read', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 21, 1, '\crothall\chimes\fin\HouseCodeSetup\Jobs\CustomerPhone\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'Jobs', 'CustomerPhone', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for newly added fields in Jobs [End]

/*
Last production release version 3.00.000 on 28th December 7PM EST
*/
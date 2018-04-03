/*
Last production release version 3.00.000 on 28th December, 2017 - 7PM EST
*/
Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS

Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '3.02.000', M_ENV_ENV_Database_Version = '3.02.000'
Where M_ENV_ENVIRONMENT = 4


-- GL Transactios Update [Begin]
Declare @FscYear Int
	, @FscYearTitle Int
	, @PriorFscYear Int
	, @PriorFscPeriod11 Int
	, @PriorFscPeriod12 Int
	, @MaxAppJDEGLTransaction Int

Select @FscYear = FY.FscYear
	, @FscYearTitle = Cast(FY.FscYeaTitle As Int)
From dbo.FscYears FY With (NoLock)
	Inner Join dbo.FscPeriods FP With (NoLock) On FP.FscYear = FY.FscYear
Where FscPerStartDate <= GetDate() And FscPerEndDate >= GetDate()

Select @PriorFscYear = FscYear From dbo.FscYears FY Where Cast(FY.FscYeaTitle As Int) = (@FscYearTitle - 1)
Select @PriorFscPeriod11 = FscPeriod From dbo.FscPeriods With (NoLock) Where FscYear = @PriorFscYear And FscPerTitle = '11'
Select @PriorFscPeriod12 = FscPeriod From dbo.FscPeriods With (NoLock) Where FscYear = @PriorFscYear And FscPerTitle = '12'
Update AppJDEGLTransactions Set AppJDEtBatchID = 0 Where FscYear = @FscYear And AppJDEtCrtdBy = 'Compass-USA/AutoImport'
--Select * From dbo.AppJDEGLTransactions Where FscYear = @FscYear Or (FscYear = @PriorFscYear And FscPeriod In (@PriorFscPeriod11, @PriorFscPeriod12)) Order By AppJDEGLTransaction
Select * From dbo.AppJDEGLTransactions Where FscYear = @FscYear And AppJDEtCrtdBy = 'Compass-USA/AutoImport'


1. Create AppIEBatches
2. ALTER TABLE dbo.AppJDEGLTransactions ADD AppJDEtBatchID INT NULL
3. SELECT AppJDEGLTransaction, AppJDEtDocumentType, AppJDEtDocumentNo, AppJDEtLineNumber, AppJDEtTeamFinId, AppJDEtTableType, HcmHouseCode, FscAccount, AppJDEtGLDate, AppJDEtPOST, AppJDEtAmount,  
          AppJDEtVendor, AppJDEtDescription, AppJDEtInvoiceNo, AppJDEtInvoiceDate, AppJDEtPurchaseOrderNumber, AppJDEtVendorNumber, FscPeriod, FscYear, AppJDEtCentury, AppJDEtDocumentCompany, 
          AppJDEtCrtdBy, AppJDEtCrtdAt, JDEId, HcmJob, HirNode 
FROM dbo.AppJDEGLTransactions 
WHERE (FscPeriod >= 101) AND (AppJDEtCrtdBy = 'Compass-usa/autoimport')

UPDATE dbo.AppJDEGLTransactions 
SET AppJDEtBatchID = 0 
WHERE (FscPeriod >= 101) AND (AppJDEtCrtdBy = 'Compass-usa/autoimport')

4. Update FscAccountImport from CT to Production
5. Update BudAnnualBudgetDelete from CT to DEV and Production


1. Stop the TeamFin Service
2. Uninstall the TeamFin Service
3. Take backup of old service exe and config file
4. Copy the new service from CT to Prod
5. Install the TeamFin Service
6. Start the TeamFin Service

CD C:\Windows\Microsoft.NET\Framework64\v4.0.30319
Uninstall the Service
installutil /u "E:\Sites\TeamFin\Service\crothall.chimes.fin.srv.TeamFinService.exe"
Install the Service
installutil "E:\Sites\TeamFin\Service\crothall.chimes.fin.srv.TeamFinService.exe"

-- GL Transactios Update [End]


-- Job Exported Info Update [Begin]
	
INSERT INTO [dbo].[HcmJobs_BeforeUpdate]
    ([HcmJob]
    ,[FscJDEJobCode]
    ,[HcmJobBrief]
    ,[HcmJobTitle]
    ,[HcmJobDescription]
    ,[HcmJobAddress1]
    ,[HcmJobCity]
    ,[AppStateType]
    ,[HcmJobPostalCode]
    ,[HcmJobDisplayOrder]
    ,[HcmJobActive]
    ,[HcmJobModBy]
    ,[HcmJobModAt]
    ,[HcmJobType]
    ,[HcmJobAddress2]
    ,[HcmJobContact]
    ,[HcmJobTaxId]
    ,[HcmJobOverrideSiteTax]
    ,[HcmJobGEOCode]
    ,[HcmEPayGroupType]
    ,[HcmJobServiceContract]
    ,[HcmJobGeneralLocationCode]
    ,[RevInvoiceTemplate]
    ,[AppCountryType]
    ,[HcmJobIndustryType]
    ,[HcmJobCrtdBy]
    ,[HcmJobCrtdAt]
    ,[HcmJobExported]
    ,[HcmJobExportedDate]
    ,[HcmJobPaymentTerm]
    ,[HcmJobContactPhone]
    ,[HcmJobCustomerName]
    ,[HcmJobCustomerPhone]
    ,[HcmJobCounty]
    ,[HcmJobBOLSReportType]
    ,[HcmJobCPIPercentage]
    ,[HcmJobCPIAmount]
    ,[HcmJobCPIDate]
    ,[HcmJobCPIECIWaived]
    ,[HcmJobCPIEnteredBy]
    ,[HcmJobCPIEnteredAt]
    ,[HcmJobPrevCPIPercentage]
    ,[HcmJobPrevCPIAmount]
    ,[HcmJobPrevCPIDate]
    ,[HcmJobPrevCPIECIWaived]
    ,[HcmJobPrevCPIEnteredBy]
    ,[HcmJobPrevCPIEnteredAt]
    ,[HcmJobPrevPrevCPIPercentage]
    ,[HcmJobPrevPrevCPIAmount]
    ,[HcmJobPrevPrevCPIDate]
    ,[HcmJobPrevPrevCPIECIWaived]
    ,[HcmJobPrevPrevCPIEnteredBy]
    ,[HcmJobPrevPrevCPIEnteredAt])
Select Distinct HJ.HcmJob,FscJDEJobCode
      ,[HcmJobBrief]
      ,[HcmJobTitle]
      ,[HcmJobDescription]
      ,[HcmJobAddress1]
      ,[HcmJobCity]
      ,[AppStateType]
      ,[HcmJobPostalCode]
      ,[HcmJobDisplayOrder]
      ,[HcmJobActive]
      ,[HcmJobModBy]
      ,[HcmJobModAt]
      ,[HcmJobType]
      ,[HcmJobAddress2]
      ,[HcmJobContact]
      ,[HcmJobTaxId]
      ,[HcmJobOverrideSiteTax]
      ,[HcmJobGEOCode]
      ,[HcmEPayGroupType]
      ,[HcmJobServiceContract]
      ,[HcmJobGeneralLocationCode]
      ,[RevInvoiceTemplate]
      ,[AppCountryType]
      ,[HcmJobIndustryType]
      ,[HcmJobCrtdBy]
      ,[HcmJobCrtdAt]
      ,[HcmJobExported]
      ,[HcmJobExportedDate]
      ,[HcmJobPaymentTerm]
      ,[HcmJobContactPhone]
      ,[HcmJobCustomerName]
      ,[HcmJobCustomerPhone]
      ,[HcmJobCounty]
      ,[HcmJobBOLSReportType]
      ,[HcmJobCPIPercentage]
      ,[HcmJobCPIAmount]
      ,[HcmJobCPIDate]
      ,[HcmJobCPIECIWaived]
      ,[HcmJobCPIEnteredBy]
      ,[HcmJobCPIEnteredAt]
      ,[HcmJobPrevCPIPercentage]
      ,[HcmJobPrevCPIAmount]
      ,[HcmJobPrevCPIDate]
      ,[HcmJobPrevCPIECIWaived]
      ,[HcmJobPrevCPIEnteredBy]
      ,[HcmJobPrevCPIEnteredAt]
      ,[HcmJobPrevPrevCPIPercentage]
      ,[HcmJobPrevPrevCPIAmount]
      ,[HcmJobPrevPrevCPIDate]
      ,[HcmJobPrevPrevCPIECIWaived]
      ,[HcmJobPrevPrevCPIEnteredBy]
      ,[HcmJobPrevPrevCPIEnteredAt]
From dbo.HcmJobs HJ With (NoLock)
	Inner Join dbo.HcmHouseCodeJobs HCJ With (NoLock) On HCJ.HcmJob = HJ.HcmJob
Where HcmJobType = 3 And HcmJobExported Is Null And HcmHoucjSAPCustomerNumber Is Not Null And HcmJobExportedDate Is Null

INSERT INTO [dbo].[HcmHouseCodeJobs_BeforeUpdate]
    ([HcmHouseCodeJob]
    ,[HcmHouseCode]
    ,[HcmJob]
    ,[HcmHoucjActive]
    ,[HcmHoucjModBy]
    ,[HcmHoucjModAt]
    ,[HirNode]
    ,[HcmHoucjLanguage1]
    ,[HcmHoucjLanguage2]
    ,[HcmHoucjLanguage3]
    ,[HcmHoucjDefaultHouseCode]
    ,[HcmHoucjSAPCustomerNumber]
    ,[HcmHoucjCrtdBy]
    ,[HcmHoucjCrtdAt]
    ,[HcmHoucjExported]
    ,[HcmHoucjExportedDate])
SELECT [HcmHouseCodeJob]
    ,[HcmHouseCode]
    ,HCJ.[HcmJob]
    ,[HcmHoucjActive]
    ,[HcmHoucjModBy]
    ,[HcmHoucjModAt]
    ,[HirNode]
    ,[HcmHoucjLanguage1]
    ,[HcmHoucjLanguage2]
    ,[HcmHoucjLanguage3]
    ,[HcmHoucjDefaultHouseCode]
    ,[HcmHoucjSAPCustomerNumber]
    ,[HcmHoucjCrtdBy]
    ,[HcmHoucjCrtdAt]
    ,[HcmHoucjExported]
    ,[HcmHoucjExportedDate]
FROM [dbo].[HcmHouseCodeJobs] HCJ 
Inner Join dbo.HcmJobs HJ On HJ.HcmJob =  HCJ.HcmJob 
Where HcmJobType = 3 And HcmHoucjExported Is Null And HcmHoucjSAPCustomerNumber Is Not Null

Select Distinct(HJ.HcmJob)
		From dbo.HcmJobs HJ With (NoLock)
		Inner Join dbo.HcmHouseCodeJobs HCJ With (NoLock) On HCJ.HcmJob = HJ.HcmJob
		Where HcmJobType = 3 And HcmJobExported Is Null And HcmHoucjSAPCustomerNumber Is Not Null

Update dbo.HcmJobs 
Set HcmJobExported = 1
	, HcmJobExportedDate = '01/01/2018'
Where HcmJob In
	(Select Distinct(HJ.HcmJob)
		From dbo.HcmJobs HJ With (NoLock)
		Inner Join dbo.HcmHouseCodeJobs HCJ With (NoLock) On HCJ.HcmJob = HJ.HcmJob
		Where HcmJobType = 3 And HcmJobExported Is Null And HcmHoucjSAPCustomerNumber Is Not Null
	)

--HcmHouseCodeJobs
Select HCJ.* From dbo.HcmHouseCodeJobs HCJ 
	Inner Join dbo.HcmJobs HJ On HJ.HcmJob =  HCJ.HcmJob 
Where HcmJobType = 3 And HcmHoucjExported Is Null And HcmHoucjSAPCustomerNumber Is Not Null

Update dbo.HcmHouseCodeJobs 
Set HcmHoucjExported = 1
	, HcmHoucjExportedDate = '01/01/2018'
Where HcmHouseCodeJob In 
	(Select HcmHouseCodeJob
		From dbo.HcmJobs HJ With (NoLock)
		Inner Join dbo.HcmHouseCodeJobs HCJ With (NoLock) On HCJ.HcmJob = HJ.HcmJob
		Where HcmJobType = 3 And HcmHoucjExported Is Null And HcmHoucjSAPCustomerNumber Is Not Null
	)

-- Job Exported Info Update [End]

--ALTER TABLE dbo.PurVendors ADD PurVenNameSelectBy VARCHAR(16) NULL
Update dbo.PurVendors Set PurVenNameSelectBy = 'PurVenTitle'

Select * From dbo.PayWageTypes

Update dbo.PayWageTypes Set PayWagtActive = 0 Where PayWagtBrief In ('1015', '1024', '1028', '1101', '1151', 'Earn')
Select * From dbo.PayWageTypes Where PayWagtBrief In ('1015', '1024', '1028', '1101', '1151', 'Earn')

INSERT INTO dbo.PayWageTypes (PayWagtBrief, PayWagtTitle, PayWagtDescription, PayWagtDisplayOrder, PayWagtActive, PayWagtModBy, PayWagtModAt) 
VALUES ('1150', 'Crothall Bonus', 'Crothall Bonus', 23, 1, 'Compass-USA\Data Conversion', GetDate()),
('7003', 'Regular Salary (Salary Exempt only)', 'Regular Salary (Salary Exempt only)', 24, 1, 'Compass-USA\Data Conversion', GetDate())

--ALTER TABLE dbo.RevInvoiceItems ADD RevInviExportedBatchID INT NULL
--ALTER TABLE dbo.LMInvoiceDetails ADD ExportedBatchID INT NULL
--ALTER TABLE dbo.EmpPTOTypePayCodes ADD EmpPtotpcActive Bit NULL
--ALTER TABLE dbo.AppJDEGLTransactions ADD AppJDEtBatchID INT NULL
--ALTER TABLE dbo.EmpPTOPlans ADD EmpPtopBalanceCarryover BIT NULL
--ALTER TABLE dbo.EmpPTOPlans ADD EmpPtopCarryoverLimit INT NULL
--ALTER TABLE dbo.PurVendors ADD PurVenName3 VARCHAR(35) NULL
--ALTER TABLE dbo.PurVendors ADD PurVenName4 VARCHAR(35) NULL
--ALTER TABLE dbo.LMInvoiceDetails ADD InvoiceType VARCHAR(16) NULL
--ALTER TABLE dbo.BudAnnualInformations ALTER COLUMN BudAnniGenLiabilityAccCodes VARCHAR(512)

ALTER TABLE dbo.PayPayCodes ADD PayPaycPTOType BIT NULL
Update dbo.PayPayCodes Set PayPaycPTOType = 0
Update dbo.PayPayCodes Set PayPaycPTOType = 1 Where PayPayCode >= 131
Update dbo.PayPayCodes Set PayPaycPTOType = 1 Where PayPayCode In(33, 34, 85, 114)
Update EmpPTOTypePayCodes Set EmpPtotpcActive = 1

Select * From dbo.PayPayCodes

/*
CT updated on 1st March, 2018 - 11PM EST
*/

 -- Add ReExport security nodes in AccountsReceivable - Invoicing/AR [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\AccountsReceivable\Invoicing/AR%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable\Invoicing/AR'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ReExport', 'Re-Export', 'Re-Export', @DisplayOrder + 1, 1, '\crothall\chimes\fin\AccountsReceivable\Invoicing/AR\ReExport', 'crothall', 'chimes', 'fin', 'AccountsReceivable', 'Invoicing/AR', 'ReExport', 'Compass-USA\Data Conversion', GetDate())
-- Add ReExport security nodes in AccountsReceivable - Invoicing/AR [End]


 -- Add OpenPO security nodes in Purchasing - PurchaseOrders [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Purchasing\PurchaseOrders%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PurchaseOrders'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'OpenPO', 'Open PO', 'Open PO', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PurchaseOrders\OpenPO', 'crothall', 'chimes', 'fin', 'Purchasing', 'PurchaseOrders', 'OpenPO', 'Compass-USA\Data Conversion', GetDate())
-- Add OpenPO security nodes in Purchasing - PurchaseOrders [End]


 -- Add OpenApproved security nodes in Purchasing - PORequisition [Begin]
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\Purchasing\PORequisition%'

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PORequisition'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeParent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'OpenApproved', 'Open - Approved Status', 'Open - Approved Status', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PORequisition\OpenApproved', 'crothall', 'chimes', 'fin', 'Purchasing', 'PORequisition', 'OpenApproved', 'Compass-USA\Data Conversion', GetDate())
-- Add OpenApproved security nodes in Purchasing - PORequisition [End]


<add key="GLTransactionImportDays" value="13" />

-- Update the following key in app->act and fsc->act web.config files
<httpRuntime requestValidationMode="2.0" maxUrlLength="8192" maxQueryStringLength="20480"/>
<security>
      <requestFiltering>
        <requestLimits maxUrl="8192" maxQueryString="20480"/>
      </requestFiltering>
</security>

/*
CT updated on 14th March, 2018 - 11PM EST
*/

-- Invoice Status Update [Begin]

Declare @FscAccountDescription Int
	, @RevInvoice Int
	, @InvInvoiceNumber Int
	, @InvoiceDate DateTime
	, @TransactionStatusType Int
	, @Title Varchar(64)
	, @TotalAmount Decimal (18, 2)
	, @PaidAmount Decimal (18, 2)
	, @PaidOff Bit

CREATE TABLE [dbo].[RevInvoices_Temp](
	[RevInvoice] [int] NULL,
	[AppTransactionStatusType] [int] NULL,
	[RevInvPaidOff] [bit] NULL,
	[RevInvModBy] [varchar](50) NULL,
	[RevInvModAt] [datetime] NULL
) ON [PRIMARY]

CREATE TABLE [dbo].[RevInvoiceItems_Temp](
    [RevInvoiceItem] [int] NULL,
	[RevInvoice] [int] NULL,
	[AppTransactionStatusType] [int] NULL,
	[RevInviModBy] [varchar](50) NULL,
	[RevInviModAt] [datetime] NULL
) ON [PRIMARY]

CREATE TABLE [dbo].[RevAccountReceivables_Temp](
    [RevAccountReceivable] [int] NULL,
	[RevInvoice] [int] NULL,
	[AppTransactionStatusType] [int] NULL,
	[RevAccrModBy] [varchar](50) NULL,
	[RevAccrModAt] [datetime] NULL
) ON [PRIMARY]

Select @FscAccountDescription = FscAccount From dbo.FscAccounts With (NoLock) Where FscAccCode = '0000'

Declare curRevInvoice Cursor For

Select * From (
	Select RevInvoice
		, RevInvInvoiceNumber
		, RevInvInvoiceDate
		, RI.AppTransactionStatusType
		, AppTrastTitle
		, (Select Sum(IsNull(RevInviAmount, 0)) * -1
								From dbo.RevInvoiceItems With (NoLock)
								Where RevInvoice = RI.RevInvoice And IsNull(FscAccount, 0) <> @FscAccountDescription And IsNull(RevAccountReceivable, 0) <= 0) As TotalAmount
		, (Select Sum(IsNull(RevAccrAmount, 0))
								From dbo.RevAccountReceivables With (NoLock)
								Where RevInvoice = RI.RevInvoice And RevAccrCheckNumber != '(CM)') As PaidAmount
		, PaidOff =
				Case
						When ((Select Sum(IsNull(RevInviAmount, 0)) * -1
								From dbo.RevInvoiceItems With (NoLock)
								Where RevInvoice = RI.RevInvoice And IsNull(FscAccount, 0) <> @FscAccountDescription And IsNull(RevAccountReceivable, 0) <= 0) - 
								(Select Sum(IsNull(RevAccrAmount, 0))
								From dbo.RevAccountReceivables With (NoLock)
								Where RevInvoice = RI.RevInvoice And RevAccrCheckNumber != '(CM)')) <= 0 
						Then 1
						Else 0
				End
	From dbo.RevInvoices RI With (NoLock)
		Inner Join dbo.AppTransactionStatusTypes ATS With (NoLock) On ATS.AppTransactionStatusType = RI.AppTransactionStatusType
	Where RI.AppTransactionStatusType = 2) As Results 
Where Results.PaidOff = 1
Order By RevInvInvoiceDate

Open curRevInvoice

While 1=1
Begin
	Set @RevInvoice = Null
	Set @PaidOff = Null

	Fetch Next From curRevInvoice Into @RevInvoice, @InvInvoiceNumber, @InvoiceDate, @TransactionStatusType, @Title, @TotalAmount, @PaidAmount, @PaidOff

	Insert Into dbo.RevInvoices_Temp
		( RevInvoice
		, AppTransactionStatusType
		, RevInvPaidOff
		, RevInvModBy
		, RevInvModAt
		)
	Select RevInvoice
		, AppTransactionStatusType
		, RevInvPaidOff
		, RevInvModBy
		, RevInvModAt
	From dbo.RevInvoices Where RevInvoice = @RevInvoice

	Insert Into dbo.RevInvoiceItems_Temp
		( RevInvoiceItem
		, RevInvoice
		, AppTransactionStatusType
		, RevInviModBy
		, RevInviModAt
		)
	Select RevInvoiceItem
		, RevInvoice
		, AppTransactionStatusType
		, RevInviModBy
		, RevInviModAt
	From dbo.RevInvoiceItems Where RevInvoice = @RevInvoice

	Insert Into dbo.RevAccountReceivables_Temp
		( RevAccountReceivable
		, RevInvoice
		, AppTransactionStatusType
		, RevAccrModBy
		, RevAccrModAt
		)
	Select RevAccountReceivable
		, RevInvoice
		, AppTransactionStatusType
		, RevAccrModBy
		, RevAccrModAt
	From dbo.RevAccountReceivables Where RevInvoice = @RevInvoice

	Update dbo.RevInvoices
	Set RevInvPaidOff = 1
		, AppTransactionStatusType = 5
	Where RevInvoice = @RevInvoice

	Exec dbo.RevInvoiceStatusUpdate @RevInvoice, 5, 'Compass-USA\AutoUpdate'
	
	If @@Fetch_Status <> 0 Break
End

Close curRevInvoice
Deallocate curRevInvoice

Select * From dbo.RevInvoices_Temp
Select * From dbo.RevInvoiceItems_Temp
Select * From dbo.RevAccountReceivables_Temp

Update RI
Set RI.RevInvPaidOff = RIT.RevInvPaidOff
	, RI.AppTransactionStatusType = RIT.AppTransactionStatusType
	, RI.RevInvModBy = RIT.RevInvModBy
	, RI.RevInvModAt = RIT.RevInvModAt
From dbo.RevInvoices As RI Inner Join dbo.RevInvoices_Temp As RIT On RIT.RevInvoice = RI.RevInvoice

Update RIT
Set RIT.AppTransactionStatusType = RITT.AppTransactionStatusType
	, RIT.RevInviModBy = RITT.RevInviModBy
	, RIT.RevInviModAt = RITT.RevInviModAt
From dbo.RevInvoiceItems As RIT Inner Join dbo.RevInvoiceItems_Temp As RITT On RITT.RevInvoiceItem = RIT.RevInvoiceItem

Update RAC
Set RAC.AppTransactionStatusType = RACT.AppTransactionStatusType
	, RAC.RevAccrModBy = RACT.RevAccrModBy
	, RAC.RevAccrModAt = RACT.RevAccrModAt
From dbo.RevAccountReceivables As RAC Inner Join dbo.RevAccountReceivables_Temp As RACT On RACT.RevAccountReceivable = RAC.RevAccountReceivable

drop table dbo.RevInvoices_Temp
drop table dbo.RevInvoiceItems_Temp
drop table dbo.RevAccountReceivables_Temp

-- Invoice Status Update [End]

/*
Last production release version 3.02.000 on 28th March, 2018 - 11PM EST
*/
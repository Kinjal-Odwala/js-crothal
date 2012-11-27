Update Brief

Use Esmv2
Go

Select top 200 * from hirNodes Where hirNodfullPath like '%\crothall\chimes\fin%'

---Fiscal
--AccountsReceivable
Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\Fiscal\JDECompanies'
Where HirNodFullPath = '\crothall\chimes\fin\Fiscal\JDE Companies'
--AccountsReceivable
Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\Fiscal\ChartOfAccounts'
Where HirNodFullPath = '\crothall\chimes\fin\Fiscal\Chart Of Accounts'
-------------------------------------
--AccountsReceivable
Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\AccountsReceivable'
Where HirNodFullPath = '\crothall\chimes\fin\Accounts Receivable'

Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\AccountsReceivable\Invoicing/AR'
Where HirNodFullPath = '\crothall\chimes\fin\Accounts Receivable\Invoicing / AR'

Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\AccountsReceivable\ConvertWOtoInvoice'
Where HirNodFullPath = '\crothall\chimes\fin\Accounts Receivable\Convert WO to Invoice'

Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\AccountsReceivable\BulkInvoiceImport'
Where HirNodFullPath = '\crothall\chimes\fin\Accounts Receivable\Bulk Invoice Import'

Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\AccountsReceivable\InvoiceSearch'
Where HirNodFullPath = '\crothall\chimes\fin\Accounts Receivable\Invoice Search'
-----------------------------
-- Work Orders
Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\WorkOrders'
Where HirNodFullPath = '\crothall\chimes\fin\Work Orders'

Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\WorkOrders\WorkOrders'
Where HirNodFullPath = '\crothall\chimes\fin\Work Orders\Work Orders'

Update HirNodes Set hirNodfullPath = '\crothall\chimes\fin\WorkOrders\CompleteWorkOrders'
Where HirNodFullPath = '\crothall\chimes\fin\Work Orders\Complete Work Orders'
---------------------------

--purchase
----------------

update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Purchasing\PurchaseOrders'
Where HirNodFullPath='\crothall\chimes\fin\Purchasing\Purchase Orders'

--------------------
--Payroll
--------------------------
Update HirNodes Set HirNodBrief = 'Salary Wages', HirNodTitle='Salary Wages', HirNodDescription = 'Salary Wages',
HirNodFullPath = '\crothall\chimes\fin\Payroll\SalaryWages'
Where HirNodFullPath = '\crothall\chimes\fin\Payroll\Salary & Wages'


Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Payroll\CeridianCompanies'
Where HirNodFullPath = '\crothall\chimes\fin\Payroll\Ceridian Companies'
-------------------------
-- General Ledger
Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\GeneralLedger'
Where HirNodFullPath = '\crothall\chimes\fin\General Ledger'


Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\GeneralLedger\RecurringExpenses'
Where HirNodFullPath = '\crothall\chimes\fin\General Ledger\Recurring Expenses'

Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\GeneralLedger\JournalEntry'
Where HirNodFullPath = '\crothall\chimes\fin\General Ledger\Journal Entry'

Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\GeneralLedger\TransactionSummary'
Where HirNodFullPath = '\crothall\chimes\fin\General Ledger\Transaction Summary'

--------------------
--HouseCodeSetup\Remit To Locations
Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\RemitToLocations'
Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Remit To Locations'
------------------
--Setup\System Variable
Update HirNodes Set HirNodFullPath = '\crothall\chimes\fin\Setup\SystemVariable'
Where HirNodFullPath = '\crothall\chimes\fin\Setup\System Variable'
--------------

--Check Display order 
Update HirNodes Set HirNodDisplayOrder = 52 Where hirNode = 10601

exec sp_executesql N'Exec hirNodeChildrensSelect @p0, @p1',N'@p0 bigint,@p1 int',@p0=7,@p1=0




Use Esmv2
Go
Drop table HirNodeSecuritySetupSources
--select * from hirnodes where hirnodfullpath like '%read ssn%'
--delete from hirnodes where hirnodfullpath like '%read ssn%'

Create table HirNodeSecuritySetupSources
(
      HirNodeSecuritySetupSource Int Not Null 
            Constraint Id_HirNodeSecuritySetupSource Identity(-1,-1),
      HirNodsssBrief Varchar(16) Not Null,
      HirNodsssTitle Varchar(64) Not Null,
      HirNodsssDescription Varchar(256) Not Null,
      HirHierarchy Int Not Null,
      HirLevel Int Not Null,
      HirNodeParentFullPath Varchar(250),
      HirNodsssDisplayOrder Int Not Null
      Constraint Pk_HirNodeSecuritySetupSource Primary Key (HirNodeSecuritySetupSource)
)
/*
Select * from HirNodeSecuritySetupSources order by HirNodeSecuritySetupSource desc
Select top 270 * from Hirnodes order by hirnode desc
Select max(hirnode) from Hirnodes order by hirnode desc
Truncate table HirNodeSecuritySetupSources 
*/

Truncate table HirNodeSecuritySetupSources 

Declare @HirNodeIdentity Int
Select @HirNodeIdentity = Max(HirNode) From Esmv2.dbo.HirNodes
Set @HirNodeIdentity = @HirNodeIdentity + 1
Print @HirNodeIdentity

--Delete From HirNodes Where HirNode > 13212  And HirLevel = 9 And HirHierarchy = 1
--select top 500 * From HirNodes Where HirNode > 13212  And HirLevel = 9 And HirHierarchy = 1 order by hirNodDisplayOrder desc --Where HirNode > 14393

--Budgeting\AnnualizedBudget
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualizedBudget', @HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualizedBudget', (-@@Identity)+@HirNodeIdentity)

--Budgeting\BudgetSummary
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetSummary', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetSummary', (-@@Identity)+@HirNodeIdentity)

--Budgeting\AnnualProjections\ByPeriod
      Insert Into HirNodeSecuritySetupSources
      values('byPeriod', 'ByPeriod', 'byPeriod', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\ByPeriod', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\ByPeriod', (-@@Identity)+@HirNodeIdentity)
--Budgeting\AnnualProjections\WORForecast
      Insert Into HirNodeSecuritySetupSources
      values('worForecast', 'WORForecast', 'worForecast', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\WORForecast', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\AnnualProjections\WORForecast', (-@@Identity)+@HirNodeIdentity)

--Budgeting\BudgetAdministration\AnnualInformation
      Insert Into HirNodeSecuritySetupSources
      values('annualInfo', 'AnnualInformation', 'annualInformation', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\AnnualInformation', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\AnnualInformation', (-@@Identity)+@HirNodeIdentity)
--Budgeting\BudgetAdministration\ApproveBudget
      Insert Into HirNodeSecuritySetupSources
      values('approveBudget', 'ApproveBudget', 'approveBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('approve', 'Approve', 'approve', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('reject', 'Reject', 'reject', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ApproveBudget', (-@@Identity)+@HirNodeIdentity)
--Budgeting\BudgetAdministration\DeleteBudget
      Insert Into HirNodeSecuritySetupSources
      values('deleteBudget', 'DeleteBudget', 'deleteBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\DeleteBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\DeleteBudget', (-@@Identity)+@HirNodeIdentity)
--Budgeting\BudgetAdministration\ExportBudget
      Insert Into HirNodeSecuritySetupSources
      values('exportBudget', 'ExportBudget', 'exportBudget', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ExportBudget', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Budgeting\BudgetAdministration\ExportBudget', (-@@Identity)+@HirNodeIdentity)

--GeneralLedger\RecurringExpenses
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\GeneralLedger\RecurringExpenses', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\GeneralLedger\RecurringExpenses', (-@@Identity)+@HirNodeIdentity)
--GeneralLedger\JournalEntry
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\GeneralLedger\JournalEntry', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\GeneralLedger\JournalEntry', (-@@Identity)+@HirNodeIdentity)  
--GeneralLedger\TransactionSummary
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\GeneralLedger\TransactionSummary', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\GeneralLedger\TransactionSummary', (-@@Identity)+@HirNodeIdentity)  
      
--Payroll\Calendar
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Payroll\Calendar',  (-@@Identity)+@HirNodeIdentity) 
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Payroll\Calendar', (-@@Identity)+@HirNodeIdentity)
--Payroll\CeridianCompanies
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Payroll\CeridianCompanies', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Payroll\CeridianCompanies', (-@@Identity)+@HirNodeIdentity)   
--Payroll\SalaryWages
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Payroll\SalaryWages', (-@@Identity)+@HirNodeIdentity) 
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Payroll\SalaryWages', (-@@Identity)+@HirNodeIdentity)

      
--Purchasing\Vendors
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Purchasing\Vendors', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Purchasing\Vendors', (-@@Identity)+@HirNodeIdentity) 
--Purchasing\Catalogs
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Purchasing\Catalogs', (-@@Identity)+@HirNodeIdentity) 
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Purchasing\Catalogs', (-@@Identity)+@HirNodeIdentity)
--Purchasing\Items
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Purchasing\Items', (-@@Identity)+@HirNodeIdentity) 
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Purchasing\Items', (-@@Identity)+@HirNodeIdentity)
--Purchasing\PurchaseOrders
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Purchasing\PurchaseOrders', (-@@Identity)+@HirNodeIdentity)     
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Purchasing\PurchaseOrders', (-@@Identity)+@HirNodeIdentity)

--WorkOrders\WorkOrders
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\WorkOrders\WorkOrders', (-@@Identity)+@HirNodeIdentity)
--WorkOrders\writeNoApprove
      Insert Into HirNodeSecuritySetupSources
      values('writeNoApprove', 'WriteNoApprove', 'writeNoApprove', 1, 9, '\crothall\chimes\fin\WorkOrders\WorkOrders', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('writeApprove', 'WriteApprove', 'writeApprove', 1, 9, '\crothall\chimes\fin\WorkOrders\WorkOrders', (-@@Identity)+@HirNodeIdentity)
--WorkOrders\CompleteWorkOrders
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\WorkOrders\CompleteWorkOrders', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\WorkOrders\CompleteWorkOrders', (-@@Identity)+@HirNodeIdentity)


--AccountsReceivable\Invoicing/AR
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\AccountsReceivable\Invoicing/AR', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\AccountsReceivable\Invoicing/AR', (-@@Identity)+@HirNodeIdentity)

--Fiscal\Patterns
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Fiscal\Patterns', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Fiscal\Patterns', (-@@Identity)+@HirNodeIdentity)
--Fiscal\Calendar
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Fiscal\Calendar', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Fiscal\Calendar', (-@@Identity)+@HirNodeIdentity)
--Fiscal\JDECompanies
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Fiscal\JDECompanies', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Fiscal\JDECompanies', (-@@Identity)+@HirNodeIdentity)
--Fiscal\ChartOfAccounts
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Fiscal\ChartOfAccounts', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Fiscal\ChartOfAccounts', (-@@Identity)+@HirNodeIdentity)

--HouseCodeSetup\RemitToLocations
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\RemitToLocations', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\RemitToLocations', (-@@Identity)+@HirNodeIdentity)

--HouseCodeSetup\sites

            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites', (-@@Identity)+@HirNodeIdentity)
            -------------------------

            --sectionSites
            Insert Into HirNodeSecuritySetupSources
            values('sectionSites', 'SectionSites', 'sectionSites', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)


            --siteName
            Insert Into HirNodeSecuritySetupSources
            values('siteName', 'SiteName', 'siteName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\siteName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\siteName', (-@@Identity)+@HirNodeIdentity)

            --Address1
            Insert Into HirNodeSecuritySetupSources
            values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\address1', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\address1', (-@@Identity)+@HirNodeIdentity)

            --Address2
            Insert Into HirNodeSecuritySetupSources
            values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\address2', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\address2', (-@@Identity)+@HirNodeIdentity)

            --City
            Insert Into HirNodeSecuritySetupSources
            values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\city', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\city', (-@@Identity)+@HirNodeIdentity)

            --County
            Insert Into HirNodeSecuritySetupSources
            values('county', 'County', 'county', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\county', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\county', (-@@Identity)+@HirNodeIdentity)

            --State
            Insert Into HirNodeSecuritySetupSources
            values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\state', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\state', (-@@Identity)+@HirNodeIdentity)

            --PostalCode
            Insert Into HirNodeSecuritySetupSources
            values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\postalCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionSites\postalCode', (-@@Identity)+@HirNodeIdentity)

            --sectionDemograph
            Insert Into HirNodeSecuritySetupSources
            values('sectionDemograph', 'SectionDemograph', 'sectionDemograph', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)

            --IndustryType
            Insert Into HirNodeSecuritySetupSources
            values('industryType', 'IndustryType', 'industryType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\industryType', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\industryType', (-@@Identity)+@HirNodeIdentity)

            --PrimaryBusiness
            Insert Into HirNodeSecuritySetupSources
            values('primaryBusiness', 'PrimaryBusiness', 'primaryBusiness', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\primaryBusiness', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\primaryBusiness', (-@@Identity)+@HirNodeIdentity)

            --LocationType
            Insert Into HirNodeSecuritySetupSources
            values('locationType', 'LocationType', 'locationType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\locationType', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\locationType', (-@@Identity)+@HirNodeIdentity)

            --TraumaLevel
            Insert Into HirNodeSecuritySetupSources
            values('traumaLevel', 'TraumaLevel', 'traumaLevel', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\traumaLevel', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\traumaLevel', (-@@Identity)+@HirNodeIdentity)

            --ProfitDesignation
            Insert Into HirNodeSecuritySetupSources
            values('profitDesignatio', 'ProfitDesignation', 'profitDesignation', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\profitDesignation', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\profitDesignation', (-@@Identity)+@HirNodeIdentity)

            --GPO
            Insert Into HirNodeSecuritySetupSources
            values('gpo', 'GPO', 'gpo', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\gpo', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\gpo', (-@@Identity)+@HirNodeIdentity)

            --Ownership
            Insert Into HirNodeSecuritySetupSources
            values('ownership', 'Ownership', 'ownership', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\ownership', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\ownership', (-@@Identity)+@HirNodeIdentity)

            --SpecifyGPO
            Insert Into HirNodeSecuritySetupSources
            values('specifyGPO', 'SpecifyGPO', 'specifyGPO', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\specifyGPO', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\sites\sectionDemograph\specifyGPO', (-@@Identity)+@HirNodeIdentity)


--HouseCodeSetup\houseCodes

            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes', (-@@Identity)+@HirNodeIdentity)
            -------------------------
            --tabHouseCode
            Insert Into HirNodeSecuritySetupSources
            values('tabHouseCode', 'TabHouseCode', 'tabHouseCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode', (-@@Identity)+@HirNodeIdentity)

            --sectionHouseCode
            Insert Into HirNodeSecuritySetupSources
            values('sectionHouseCode', 'SectionHouseCode', 'sectionHouseCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)


            --jdeCompany
            Insert Into HirNodeSecuritySetupSources
            values('jdeCompany', 'JDECompany', 'jdeCompany', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\jdeCompany', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\jdeCompany', (-@@Identity)+@HirNodeIdentity)

            --site
            Insert Into HirNodeSecuritySetupSources
            values('site', 'Site', 'site', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\site', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\site', (-@@Identity)+@HirNodeIdentity)

            --houseCode
            Insert Into HirNodeSecuritySetupSources
            values('houseCode', 'HouseCode', 'houseCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\houseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\houseCode', (-@@Identity)+@HirNodeIdentity)


            --startDate
            Insert Into HirNodeSecuritySetupSources
            values('startDate', 'StartDate', 'startDate', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\startDate', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionHouseCode\startDate', (-@@Identity)+@HirNodeIdentity)

            --sectionServices
            Insert Into HirNodeSecuritySetupSources
            values('sectionServices', 'SectionServices', 'sectionServices', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)

            --primaryService
            Insert Into HirNodeSecuritySetupSources
            values('primaryService', 'PrimaryService', 'primaryService', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\primaryService', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\primaryService', (-@@Identity)+@HirNodeIdentity)

            --additionalServices
            Insert Into HirNodeSecuritySetupSources
            values('additionalSrv', 'AdditionalServices', 'additionalServices', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\additionalServices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\additionalServices', (-@@Identity)+@HirNodeIdentity)

            --enforceLaborControl
            Insert Into HirNodeSecuritySetupSources
            values('enforceLbrCtr', 'EnforceLaborControl', 'enforceLaborControl', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\enforceLaborControl', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\enforceLaborControl', (-@@Identity)+@HirNodeIdentity)

            --serviceLine
            Insert Into HirNodeSecuritySetupSources
            values('serviceLine', 'ServiceLine', 'serviceLine', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\serviceLine', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionServices\serviceLine', (-@@Identity)+@HirNodeIdentity)

            --sectionManager
            Insert Into HirNodeSecuritySetupSources
            values('sectionManager', 'SectionManager', 'sectionManager', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)

            --managerName
            Insert Into HirNodeSecuritySetupSources
            values('managerName', 'ManagerName', 'managerName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\managerName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\managerName', (-@@Identity)+@HirNodeIdentity)

            --phone
            Insert Into HirNodeSecuritySetupSources
            values('phone', 'Phone', 'phone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\phone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\phone', (-@@Identity)+@HirNodeIdentity)

            --fax
            Insert Into HirNodeSecuritySetupSources
            values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\fax', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\fax', (-@@Identity)+@HirNodeIdentity)

            --cellPhone
            Insert Into HirNodeSecuritySetupSources
            values('cellPhone', 'CellPhone', 'cellPhone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\cellPhone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\cellPhone', (-@@Identity)+@HirNodeIdentity)

            --pager 
            Insert Into HirNodeSecuritySetupSources
            values('pager', 'Pager', 'pager', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\pager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\pager', (-@@Identity)+@HirNodeIdentity)

            --assistantName
            Insert Into HirNodeSecuritySetupSources
            values('assistantName', 'AssistantName', 'assistantName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\assistantName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\assistantName', (-@@Identity)+@HirNodeIdentity)

            --assistantPhone
            Insert Into HirNodeSecuritySetupSources
            values('assistantPhone', 'AssistantPhone', 'assistantPhone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\assistantPhone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionManager\assistantPhone', (-@@Identity)+@HirNodeIdentity)

            --sectionClient 
            Insert Into HirNodeSecuritySetupSources
            values('sectionClient', 'SectionClient', 'sectionClient', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)

            --firstName 
            Insert Into HirNodeSecuritySetupSources
            values('firstName', 'FirstName', 'firstName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\firstName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\firstName', (-@@Identity)+@HirNodeIdentity)

            --lastName 
            Insert Into HirNodeSecuritySetupSources
            values('lastName', 'LastName', 'lastName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\lastName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\lastName', (-@@Identity)+@HirNodeIdentity)

            --title 
            Insert Into HirNodeSecuritySetupSources
            values('title', 'Title', 'title', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\title', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\title', (-@@Identity)+@HirNodeIdentity)

            --phone 
            Insert Into HirNodeSecuritySetupSources
            values('phone', 'Phone', 'phone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\phone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\phone', (-@@Identity)+@HirNodeIdentity)

            --fax 
            Insert Into HirNodeSecuritySetupSources
            values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\fax', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\fax', (-@@Identity)+@HirNodeIdentity)

            --assistantName 
            Insert Into HirNodeSecuritySetupSources
            values('assistantName', 'AssistantName', 'assistantName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\assistantName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\assistantName', (-@@Identity)+@HirNodeIdentity)

            --assistantPhone 
            Insert Into HirNodeSecuritySetupSources
            values('assistantPhone', 'AssistantPhone', 'assistantPhone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\assistantPhone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabHouseCode\sectionClient\assistantPhone', (-@@Identity)+@HirNodeIdentity)

            --------------------------------
            --tabStatistics
            Insert Into HirNodeSecuritySetupSources
            values('tabStatistics', 'TabStatistics', 'tabStatistics', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)

            --managedEmployees
            Insert Into HirNodeSecuritySetupSources
            values('managedEmployee', 'ManagedEmployees', 'managedEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\managedEmployees', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\managedEmployees', (-@@Identity)+@HirNodeIdentity)

            --crothallEmployees
            Insert Into HirNodeSecuritySetupSources
            values('crothallEmployee', 'CrothallEmployees', 'crothallEmployees', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\crothallEmployees', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\crothallEmployees', (-@@Identity)+@HirNodeIdentity)

            --bedsLicensed
            Insert Into HirNodeSecuritySetupSources
            values('bedsLicensed', 'BedsLicensed', 'bedsLicensed', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\bedsLicensed', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\bedsLicensed', (-@@Identity)+@HirNodeIdentity)

            --bedsActive
            Insert Into HirNodeSecuritySetupSources
            values('bedsActive', 'BedsActive', 'bedsActive', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\bedsActive', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\bedsActive', (-@@Identity)+@HirNodeIdentity)

            --patientDays
            Insert Into HirNodeSecuritySetupSources
            values('patientDays', 'PatientDays', 'patientDays', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\patientDays', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\patientDays', (-@@Identity)+@HirNodeIdentity)

            --adjustedPatientDays
            Insert Into HirNodeSecuritySetupSources
            values('adjPatientDays', 'AdjustedPatientDays', 'adjustedPatientDays', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\adjustedPatientDays', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\adjustedPatientDays', (-@@Identity)+@HirNodeIdentity)

            --dailyCensus
            Insert Into HirNodeSecuritySetupSources
            values('dailyCensus', 'DailyCensus', 'dailyCensus', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\dailyCensus', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\dailyCensus', (-@@Identity)+@HirNodeIdentity)

            --annualDischarges
            Insert Into HirNodeSecuritySetupSources
            values('annualDischarges', 'AnnualDischarges', 'annualDischarges', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\annualDischarges', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\annualDischarges', (-@@Identity)+@HirNodeIdentity)

            --annualTransfers
            Insert Into HirNodeSecuritySetupSources
            values('annualTransfers', 'AnnualTransfers', 'annualTransfers', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\annualTransfers', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\annualTransfers', (-@@Identity)+@HirNodeIdentity)

            --bedTurnaroundTime
            Insert Into HirNodeSecuritySetupSources
            values('bedTurnaroundTim', 'BedTurnaroundTime', 'bedTurnaroundTime', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\bedTurnaroundTime', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\bedTurnaroundTime', (-@@Identity)+@HirNodeIdentity)

            --cleanableSquareFeet
            Insert Into HirNodeSecuritySetupSources
            values('cleanSquareFeet', 'CleanableSquareFeet', 'cleanableSquareFeet', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\cleanableSquareFeet', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\cleanableSquareFeet', (-@@Identity)+@HirNodeIdentity)

            --annualTransports
            Insert Into HirNodeSecuritySetupSources
            values('annualTransports', 'AnnualTransports', 'annualTransports', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\annualTransports', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\annualTransports', (-@@Identity)+@HirNodeIdentity)

            --lundry 
            Insert Into HirNodeSecuritySetupSources
            values('lundry', 'Lundry', 'lundry', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\lundry', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabStatistics\lundry', (-@@Identity)+@HirNodeIdentity)

            ---------------------------------
            --tabFinancial
            Insert Into HirNodeSecuritySetupSources
            values('tabFinancial', 'TabFinancial', 'tabFinancial', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial', (-@@Identity)+@HirNodeIdentity)

            --sectionShipping
            Insert Into HirNodeSecuritySetupSources
            values('sectionShipping', 'SectionShipping', 'sectionShipping', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)

            --company
            Insert Into HirNodeSecuritySetupSources
            values('company', 'Company', 'company', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\company', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\company', (-@@Identity)+@HirNodeIdentity)

            --address1
            Insert Into HirNodeSecuritySetupSources
            values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\address1', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\address1', (-@@Identity)+@HirNodeIdentity)

            --address2
            Insert Into HirNodeSecuritySetupSources
            values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\address2', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\address2', (-@@Identity)+@HirNodeIdentity)

            --city
            Insert Into HirNodeSecuritySetupSources
            values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\city', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\city', (-@@Identity)+@HirNodeIdentity)

            --state
            Insert Into HirNodeSecuritySetupSources
            values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\state', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\state', (-@@Identity)+@HirNodeIdentity)

            --postalCode
            Insert Into HirNodeSecuritySetupSources
            values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\postalCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionShipping\postalCode', (-@@Identity)+@HirNodeIdentity)

            --sectionInvoices
            Insert Into HirNodeSecuritySetupSources
            values('sectionInvoices', 'SectionInvoices', 'sectionInvoices', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)

            --remitTo
            Insert Into HirNodeSecuritySetupSources
            values('remitTo', 'RemitTo', 'remitTo', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\remitTo', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\remitTo', (-@@Identity)+@HirNodeIdentity)

            --title
            Insert Into HirNodeSecuritySetupSources
            values('title', 'Title', 'title', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\title', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\title', (-@@Identity)+@HirNodeIdentity)

            --address1
            Insert Into HirNodeSecuritySetupSources
            values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\address1', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\address1', (-@@Identity)+@HirNodeIdentity)

            --address2
            Insert Into HirNodeSecuritySetupSources
            values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\address2', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\address2', (-@@Identity)+@HirNodeIdentity)

            --city
            Insert Into HirNodeSecuritySetupSources
            values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\city', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\city', (-@@Identity)+@HirNodeIdentity)

            --state
            Insert Into HirNodeSecuritySetupSources
            values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\state', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\state', (-@@Identity)+@HirNodeIdentity)

            --postalCode
            Insert Into HirNodeSecuritySetupSources
            values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\postalCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionInvoices\postalCode', (-@@Identity)+@HirNodeIdentity)

            --sectionFinancial 
            Insert Into HirNodeSecuritySetupSources
            values('sectionFinancial', 'SectionFinancial', 'sectionFinancial', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)

            --contractType 
            Insert Into HirNodeSecuritySetupSources
            values('contractType', 'ContractType', 'contractType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\contractType', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\contractType', (-@@Identity)+@HirNodeIdentity)

            --termsOfContract 
            Insert Into HirNodeSecuritySetupSources
            values('termsOfContract', 'TermsOfContract', 'termsOfContract', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\termsOfContract', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\termsOfContract', (-@@Identity)+@HirNodeIdentity)

            --billingCycleFrequency 
            Insert Into HirNodeSecuritySetupSources
            values('billingCycleFrq', 'BillingCycleFrequency', 'billingCycleFrequency', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\billingCycleFrequency', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\billingCycleFrequency', (-@@Identity)+@HirNodeIdentity)

            --percentTax 
            Insert Into HirNodeSecuritySetupSources
            values('percentTax', 'PercentTax', 'percentTax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\percentTax', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\percentTax', (-@@Identity)+@HirNodeIdentity)

            --localTaxPercent 
            Insert Into HirNodeSecuritySetupSources
            values('localTaxPercent', 'LocalTaxPercent', 'localTaxPercent', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\localTaxPercent', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\localTaxPercent', (-@@Identity)+@HirNodeIdentity)

            --bankCode 
            Insert Into HirNodeSecuritySetupSources
            values('bankCode', 'BankCode', 'bankCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\bankCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\bankCode', (-@@Identity)+@HirNodeIdentity)

            --bankAccount 
            Insert Into HirNodeSecuritySetupSources
            values('bankAccount', 'BankAccount', 'bankAccount', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\bankAccount', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\bankAccount', (-@@Identity)+@HirNodeIdentity)

            --bankName 
            Insert Into HirNodeSecuritySetupSources
            values('bankName', 'BankName', 'bankName', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\bankName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\bankName', (-@@Identity)+@HirNodeIdentity)

            --contact 
            Insert Into HirNodeSecuritySetupSources
            values('contact', 'Contact', 'contact', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\contact', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\contact', (-@@Identity)+@HirNodeIdentity)

            --address1 
            Insert Into HirNodeSecuritySetupSources
            values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\address1', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\address1', (-@@Identity)+@HirNodeIdentity)

            --address2 
            Insert Into HirNodeSecuritySetupSources
            values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\address2', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\address2', (-@@Identity)+@HirNodeIdentity)

            --city 
            Insert Into HirNodeSecuritySetupSources
            values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\city', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\city', (-@@Identity)+@HirNodeIdentity)

            --state 
            Insert Into HirNodeSecuritySetupSources
            values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\state', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\state', (-@@Identity)+@HirNodeIdentity)

            --postalCode 
            Insert Into HirNodeSecuritySetupSources
            values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\postalCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\postalCode', (-@@Identity)+@HirNodeIdentity)

            --phone 
            Insert Into HirNodeSecuritySetupSources
            values('phone', 'Phone', 'phone', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\phone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\phone', (-@@Identity)+@HirNodeIdentity)

            --fax 
            Insert Into HirNodeSecuritySetupSources
            values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\fax', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\fax', (-@@Identity)+@HirNodeIdentity)

            --email 
            Insert Into HirNodeSecuritySetupSources
            values('email', 'Email', 'email', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\email', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\email', (-@@Identity)+@HirNodeIdentity)

            --invoiceLogo 
            Insert Into HirNodeSecuritySetupSources
            values('invoiceLogo', 'InvoiceLogo', 'invoiceLogo', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\invoiceLogo', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabFinancial\sectionFinancial\invoiceLogo', (-@@Identity)+@HirNodeIdentity)

            -----------------------------------
            --tabPayroll
            Insert Into HirNodeSecuritySetupSources
            values('tabPayroll', 'TabPayroll', 'tabPayroll', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)

            --payrollProcessingLocation
            Insert Into HirNodeSecuritySetupSources
            values('payrollProcLoc', 'PayrollProcessingLocation', 'payrollProcessingLocation', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\payrollProcessingLocation', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\payrollProcessingLocation', (-@@Identity)+@HirNodeIdentity)

            --timeAndAttendance
            Insert Into HirNodeSecuritySetupSources
            values('timeAndAttendanc', 'TimeAndAttendance', 'timeAndAttendance', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\timeAndAttendance', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\timeAndAttendance', (-@@Identity)+@HirNodeIdentity)

            --defaultLunchBreak
            Insert Into HirNodeSecuritySetupSources
            values('dftLunchBreak', 'DefaultLunchBreak', 'defaultLunchBreak', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\defaultLunchBreak', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\defaultLunchBreak', (-@@Identity)+@HirNodeIdentity)

            --lunchBreakTrigger
            Insert Into HirNodeSecuritySetupSources
            values('lunchBreakTrg', 'LunchBreakTrigger', 'lunchBreakTrigger', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\lunchBreakTrigger', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\lunchBreakTrigger', (-@@Identity)+@HirNodeIdentity)

            --houseCodeType
            Insert Into HirNodeSecuritySetupSources
            values('houseCodeType', 'HouseCodeType', 'houseCodeType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\houseCodeType', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\houseCodeType', (-@@Identity)+@HirNodeIdentity)

            --roundingTimePeriod
            Insert Into HirNodeSecuritySetupSources
            values('roundingTimePrd', 'RoundingTimePeriod', 'roundingTimePeriod', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\roundingTimePeriod', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\roundingTimePeriod', (-@@Identity)+@HirNodeIdentity)

            --ePaySite 
            Insert Into HirNodeSecuritySetupSources
            values('ePaySite', 'EPaySite', 'ePaySite', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\ePaySite', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\ePaySite', (-@@Identity)+@HirNodeIdentity)

            --ceridianCompanyHourly
            Insert Into HirNodeSecuritySetupSources
            values('ceridianCompHour', 'CeridianCompanyHourly', 'ceridianCompanyHourly', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\ceridianCompanyHourly', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\ceridianCompanyHourly', (-@@Identity)+@HirNodeIdentity)

            --ceridianCompanySalaried
            Insert Into HirNodeSecuritySetupSources
            values('ceridianCompSal', 'CeridianCompanySalaried', 'ceridianCompanySalaried', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\ceridianCompanySalaried', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\houseCodes\tabPayroll\ceridianCompanySalaried', (-@@Identity)+@HirNodeIdentity)

--HouseCodeSetup\Jobs
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            -------------------------

            --JobNumber
            Insert Into HirNodeSecuritySetupSources
            values('jobNumber', 'JobNumber', 'jobNumber', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\jobNumber', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\jobNumber', (-@@Identity)+@HirNodeIdentity)

            --Description
            Insert Into HirNodeSecuritySetupSources
            values('description', 'Description', 'description', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\description', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\description', (-@@Identity)+@HirNodeIdentity)


            --Contact
            Insert Into HirNodeSecuritySetupSources
            values('contact', 'Contact', 'contact', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\contact', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\contact', (-@@Identity)+@HirNodeIdentity)

            --Address1 
            Insert Into HirNodeSecuritySetupSources
            values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\address1', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\address1', (-@@Identity)+@HirNodeIdentity)

            --Address2
            Insert Into HirNodeSecuritySetupSources
            values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\address2', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\address2', (-@@Identity)+@HirNodeIdentity)

            --City
            Insert Into HirNodeSecuritySetupSources
            values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\city', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\city', (-@@Identity)+@HirNodeIdentity)

            --State
            Insert Into HirNodeSecuritySetupSources
            values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\state', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\state', (-@@Identity)+@HirNodeIdentity)

            --PostalCode
            Insert Into HirNodeSecuritySetupSources
            values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\postalCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\postalCode', (-@@Identity)+@HirNodeIdentity)

            --JobType
            Insert Into HirNodeSecuritySetupSources
            values('jobType', 'JobType', 'jobType', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\jobType', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\jobType', (-@@Identity)+@HirNodeIdentity)

            --Active
            Insert Into HirNodeSecuritySetupSources
            values('active', 'Active', 'active', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\active', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\HouseCodeSetup\Jobs\active', (-@@Identity)+@HirNodeIdentity)

--Employees\Search
            Insert Into HirNodeSecuritySetupSources
            values('search', 'Search', 'search', 1, 9, '\crothall\chimes\fin\Setup\Employees', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('hourly', 'Hourly', 'hourly', 1, 9, '\crothall\chimes\fin\Setup\Employees\Search', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('salaried', 'Salaried', 'salaried', 1, 9, '\crothall\chimes\fin\Setup\Employees\Search', (-@@Identity)+@HirNodeIdentity)

--Setup\Employees\TabPerson

            --active
            Insert Into HirNodeSecuritySetupSources
            values('active', 'Active', 'active', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\active', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\active', (-@@Identity)+@HirNodeIdentity)

            --firstName
            Insert Into HirNodeSecuritySetupSources
            values('firstName', 'FirstName', 'firstName', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\firstName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\firstName', (-@@Identity)+@HirNodeIdentity)

            --middleInitial
            Insert Into HirNodeSecuritySetupSources
            values('middleInitial', 'MiddleInitial', 'middleInitial', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\middleInitial', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\middleInitial', (-@@Identity)+@HirNodeIdentity)

            --LastName
            Insert Into HirNodeSecuritySetupSources
            values('lastName', 'LastName', 'lastName', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\lastName', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\lastName', (-@@Identity)+@HirNodeIdentity)

            --brief
            Insert Into HirNodeSecuritySetupSources
            values('brief', 'Brief', 'brief', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\brief', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\brief', (-@@Identity)+@HirNodeIdentity)

            --address1
            Insert Into HirNodeSecuritySetupSources
            values('address1', 'Address1', 'address1', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\address1', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\address1', (-@@Identity)+@HirNodeIdentity)

            --address2
            Insert Into HirNodeSecuritySetupSources
            values('address2', 'Address2', 'address2', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\address2', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\address2', (-@@Identity)+@HirNodeIdentity)

            --city
            Insert Into HirNodeSecuritySetupSources
            values('city', 'City', 'city', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\city', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\city', (-@@Identity)+@HirNodeIdentity)

            --state
            Insert Into HirNodeSecuritySetupSources
            values('state', 'State', 'state', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\state', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\state', (-@@Identity)+@HirNodeIdentity)

            --postalCode
            Insert Into HirNodeSecuritySetupSources
            values('postalCode', 'PostalCode', 'postalCode', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\postalCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\postalCode', (-@@Identity)+@HirNodeIdentity)

            --email
            Insert Into HirNodeSecuritySetupSources
            values('email', 'Email', 'email', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\email', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\email', (-@@Identity)+@HirNodeIdentity)

            --homePhone
            Insert Into HirNodeSecuritySetupSources
            values('homePhone', 'HomePhone', 'homePhone', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\homePhone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\homePhone', (-@@Identity)+@HirNodeIdentity)

            --Fax
            Insert Into HirNodeSecuritySetupSources
            values('fax', 'Fax', 'fax', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\fax', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\fax', (-@@Identity)+@HirNodeIdentity)

            --cellPhone
            Insert Into HirNodeSecuritySetupSources
            values('cellPhone', 'CellPhone', 'cellPhone', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\cellPhone', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\cellPhone', (-@@Identity)+@HirNodeIdentity)

            --pager
            Insert Into HirNodeSecuritySetupSources
            values('pager', 'Pager', 'pager', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\pager', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\pager', (-@@Identity)+@HirNodeIdentity)

            --HouseCode
            Insert Into HirNodeSecuritySetupSources
            values('houseCode', 'HouseCode', 'houseCode', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\houseCode', (-@@Identity)+@HirNodeIdentity)
            Insert Into HirNodeSecuritySetupSources
            values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\Employees\TabPerson\houseCode', (-@@Identity)+@HirNodeIdentity)

--Setup\SystemVariable
      Insert Into HirNodeSecuritySetupSources
      values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\Setup\SystemVariable', (-@@Identity)+@HirNodeIdentity)
      Insert Into HirNodeSecuritySetupSources
      values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\Setup\SystemVariable', (-@@Identity)+@HirNodeIdentity)
--employees\wizard\edit
		Insert Into HirNodeSecuritySetupSources
		values('employee', 'Employee', 'employee', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit', (-@@Identity)+@HirNodeIdentity)
   
--wizard\edit\employee
		Insert Into HirNodeSecuritySetupSources
		values('originalDate', 'OriginalDate', 'originalDate', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\originalDate', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\originalDate', (-@@Identity)+@HirNodeIdentity)

--wizard\edit\employee
		Insert Into HirNodeSecuritySetupSources
		values('seniorityDate', 'SeniorityDate', 'seniorityDate', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('read', 'Read', 'read', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\seniorityDate', (-@@Identity)+@HirNodeIdentity)
		Insert Into HirNodeSecuritySetupSources
		values('write', 'Write', 'write', 1, 9, '\crothall\chimes\fin\setup\employees\wizard\edit\employee\seniorityDate', (-@@Identity)+@HirNodeIdentity)
      

      
----------------------------------------
--Select * from HirNodeSecuritySetupSources order by HirNodeSecuritySetupSource desc

Declare 
      @Brief varchar(16), 
      @Title varchar(64), 
      @Desc varchar(256), 
      @ParentFullPath varchar(500), 
      @DispOrder Int, 
      @HirNodeParent Int

Declare curTemp Cursor For 
      Select HirNodsssBrief, HirNodsssTitle, HirNodsssDescription, HirNodeParentFullPath, HirNodsssDisplayOrder
      From Esmv2.dbo.HirNodeSecuritySetupSources
      Order By HirNodeSecuritySetupSource Desc

Open curTemp

While(1=1)
Begin
      Fetch Next From curTemp Into @Brief, @Title, @Desc, @ParentFullPath, @DispOrder
      If @@Fetch_Status <> 0 Break
      
      Print @Brief
      Select @HirNodeParent = HirNode from hirnodes where hirnodfullpath = @ParentFullPath

      EXEC Esmv2.dbo.[HirNodeUpdate] 
            0 -- hirNode
            , 1 -- hirHierarchy
            , @HirNodeParent -- hirNodeParent
            , 9 -- hirLevel
            , @Title -- Title
            , @Brief --Brief
            , @Desc -- Description
            , @DispOrder -- DisplayOrder
            , 1 -- Active
            , 'compass-usa\data conversion' -- modBy
      
End

close curTemp
deallocate curTemp


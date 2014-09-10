/*
Last production release version 2.04.012 on 19th March 2014 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.013', M_ENV_ENV_Database_Version = '2.04.013' 
Where M_ENV_ENVIRONMENT = 4

-- Add security nodes for action menu items in Employee Wizard [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'SSNModification', 'SSN Modification', 'SSN Modification', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Setup\Employees\Wizard\SSNModification', 'crothall', 'chimes', 'fin', 'Setup', 'Employees', 'Wizard', 'SSNModification', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\Employees\Wizard%'
-- Add security nodes for action menu items in Employee Wizard [End]

INSERT INTO AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
VALUES (10, '9', 'Rejected', 'Rejected', 1, 1, 'Compass-USA\Data Conversion', GetDate())

-- Testing Purpose - No need to execute during the deployment [Begin]
USE [Esmv2]
GO

-- STEP 1: To add the new user
INSERT INTO dbo.AppUserRequests(AppUserApplicationName, AppUserApplicationAccessLevel, AppUserUserName, AppUserFirstName, AppUserLastName, AppUserMiddleName
, AppUserAddressLine1, AppUserAddressLine2, AppUserCity, AppUserState, AppUserPostalCode, AppUserPhone, AppUserRequestor, AppUserRequestedOn
, AppUserRequestType, AppUserOrgTitle, AppUserGroupTitle, AppUserHouseCode, AppUserOldHouseCode, AppUserUpdated, AppUserUpdatedOn)
VALUES('TeamFin', Null, 'Compass-USA\Test888', 'Test888', 'Test888', '', '', '', '', 'Alaska', '56566', '', 'Chandru', GetDate(), 'Add User'
 , 'Crothall', 'Administrator', '001', Null, 0, Null)

Exec AppUserRequestUpdate

-- STEP 2: To modify the security level (Security Group)
INSERT INTO dbo.AppUserRequests(AppUserApplicationName, AppUserApplicationAccessLevel, AppUserUserName, AppUserFirstName, AppUserLastName, AppUserMiddleName
, AppUserAddressLine1, AppUserAddressLine2, AppUserCity, AppUserState, AppUserPostalCode, AppUserPhone, AppUserRequestor, AppUserRequestedOn
, AppUserRequestType, AppUserOrgTitle, AppUserGroupTitle, AppUserHouseCode, AppUserOldHouseCode, AppUserUpdated, AppUserUpdatedOn)
VALUES('TeamFin', Null, 'Compass-USA\Test888', '', '', '', '', '', '', '', '', '', 'Chandru', GetDate(), 'Modify Level'
 , '', 'AR Manager', Null, Null, 0, Null)

Exec AppUserRequestUpdate

-- STEP 3: To remove the house code (Org Info)
INSERT INTO dbo.AppUserRequests(AppUserApplicationName, AppUserApplicationAccessLevel, AppUserUserName, AppUserFirstName, AppUserLastName, AppUserMiddleName
, AppUserAddressLine1, AppUserAddressLine2, AppUserCity, AppUserState, AppUserPostalCode, AppUserPhone, AppUserRequestor, AppUserRequestedOn
, AppUserRequestType, AppUserOrgTitle, AppUserGroupTitle, AppUserHouseCode, AppUserOldHouseCode, AppUserUpdated, AppUserUpdatedOn)
VALUES('TeamFin', Null, 'Compass-USA\Test888', '', '', '', '', '', '', '', '', '', 'Chandru', GetDate(), 'Remove House Code'
 , 'Crothall', '', Null, Null, 0, Null)
 
Exec AppUserRequestUpdate

-- STEP 4: To add the house code (Org Info)
INSERT INTO dbo.AppUserRequests(AppUserApplicationName, AppUserApplicationAccessLevel, AppUserUserName, AppUserFirstName, AppUserLastName, AppUserMiddleName
, AppUserAddressLine1, AppUserAddressLine2, AppUserCity, AppUserState, AppUserPostalCode, AppUserPhone, AppUserRequestor, AppUserRequestedOn
, AppUserRequestType, AppUserOrgTitle, AppUserGroupTitle, AppUserHouseCode, AppUserOldHouseCode, AppUserUpdated, AppUserUpdatedOn)
VALUES('TeamFin', Null, 'Compass-USA\Test888', '', '', '', '', '', '', '', '', '', 'Chandru', GetDate(), 'Add House Code'
 , 'Carpenter Laundry', '', Null, Null, 0, Null)

Exec AppUserRequestUpdate

-- STEP 1: To remove the user
INSERT INTO dbo.AppUserRequests(AppUserApplicationName, AppUserApplicationAccessLevel, AppUserUserName, AppUserFirstName, AppUserLastName, AppUserMiddleName
, AppUserAddressLine1, AppUserAddressLine2, AppUserCity, AppUserState, AppUserPostalCode, AppUserPhone, AppUserRequestor, AppUserRequestedOn
, AppUserRequestType, AppUserOrgTitle, AppUserGroupTitle, AppUserHouseCode, AppUserOldHouseCode, AppUserUpdated, AppUserUpdatedOn)
VALUES('TeamFin', Null, 'Compass-USA\Test888', '', '', '', '', '', '', '', '', '', 'Chandru', GetDate(), 'Remove User'
 , '', '', Null, Null, 0, Null)

Exec AppUserRequestUpdate

Select * from dbo.AppUserRequests
Select * From AppUsers Where AppUseUserName = 'Compass-USA\Test888'

-- truncate table AppUserRequests
-- Testing Purpose - No need to execute during the deployment [End]

-- Receivables --> Unapplied Cash Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 506
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\AccountsReceivable'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Unapplied Cash' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/rev/unappliedCash/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\AccountsReceivable%'
-- Receivables --> Unapplied Cash Menu Insert [End] 

-- Testing Purpose - No need to execute during the production deployment [Begin]
INSERT INTO dbo.RevUnappliedCashes(HirNode,HcmHouseCode,HcmHouseCodeJob,FscAccount,FscYear,FscPeriod,RevUnacWeek,RevUnacDocumentNumber
	,RevUnacReceiptDate,RevUnacGrossAmount,RevUnacOpenAmount,RevUnacReceiptItems,RevUnacModBy,RevUnacModAt)
VALUES( 14261, 12351, 24732, 9412, 5, 54, 5, '1234', Cast('01/12/2014' As DateTime), 19920.65000, 19920.65000, '4331,4332,4333', 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.RevUnappliedCashes(HirNode,HcmHouseCode,HcmHouseCodeJob,FscAccount,FscYear,FscPeriod,RevUnacWeek,RevUnacDocumentNumber
	,RevUnacReceiptDate,RevUnacGrossAmount,RevUnacOpenAmount,RevUnacReceiptItems,RevUnacModBy,RevUnacModAt)
VALUES( 14261, 12351, 24732, 9412, 5, 54, 5, '1234', Cast('01/15/2014' As DateTime), 23820.75000, 458.25000, '4344', 'Compass-USA\Data Conversion', GetDate())
-- Testing Purpose - No need to execute during the production deployment [End]

-- Payroll --> Process Payroll Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 305
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Process Payroll' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/pay/processPayroll/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Payroll%'
-- Payroll --> Process Payroll Menu Insert [End] 

-- Setup --> Local Tax Code Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 817
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Local Tax Code' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/app/localTaxCode/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Setup\localTaxCode%'
-- Setup --> Local Tax Code Menu Insert [End] 

-- Add security nodes for action menu items in Payroll --> Process Payroll UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Payroll\ProcessPayroll'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PrepareBatch', 'Prepare Batch', 'Prepare Batch', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Payroll\ProcessPayroll\PrepareBatch', 'crothall', 'chimes', 'fin', 'Payroll', 'ProcessPayroll', 'PrepareBatch', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ImportBatch', 'Import Batch', 'Import Batch', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Payroll\ProcessPayroll\ImportBatch', 'crothall', 'chimes', 'fin', 'Payroll', 'ProcessPayroll', 'ImportBatch', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ReconcileBatch', 'Reconcile Batch', 'Reconcile Batch', @DisplayOrder + 3, 1, '\crothall\chimes\fin\Payroll\ProcessPayroll\ReconcileBatch', 'crothall', 'chimes', 'fin', 'Payroll', 'ProcessPayroll', 'ReconcileBatch', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'FinalizeBatch', 'Finalize Batch', 'Finalize Batch', @DisplayOrder + 4, 1, '\crothall\chimes\fin\Payroll\ProcessPayroll\FinalizeBatch', 'crothall', 'chimes', 'fin', 'Payroll', 'ProcessPayroll', 'FinalizeBatch', 'Compass-USA\Data Conversion', GetDate())
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'ExportBatch', 'Export Batch', 'Export Batch', @DisplayOrder + 5, 1, '\crothall\chimes\fin\Payroll\ProcessPayroll\ExportBatch', 'crothall', 'chimes', 'fin', 'Payroll', 'ProcessPayroll', 'ExportBatch', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Payroll\ProcessPayroll%'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'ProcessPayroll', HirNodTitle = 'Process Payroll' Where HirNode = 20835
-- Add security nodes for action menu items in Payroll --> Process Payroll UI [End]

-- Purchasing --> PO Requisition Menu Insert [Begin]
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 406
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'PO Requisition' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	, '/fin/pur/requisition/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing%'
-- Purchasing --> PO Requisition Menu Insert [End] 

-- Add the following key in pur-->act web.config file
<add key="PORequisitionEmail" value="sus-purchasing@compass-usa.com" />
<add key="PORequisitionApprovalPath" value="https://findev.crothall.com/net/crothall/chimes/fin/pur/act/ApprovePORequisition.aspx" />
<add key="ConnectionString" value="Data Source=CHIUSCHD398VM;Initial Catalog=TeamFinv2;User ID=Esm;Password=Esm" />

-- Add the following key in pay-->act web.config file
<httpRuntime executionTimeout="1800" />

/*
CT updated on 9th July 2014 11PM EST
*/

-- Add security nodes for action menu items in PO Requisition UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PORequisition'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PORequisition', 'PO Requisition', 'PO Requisition', @DisplayOrder + 1, 1, '\crothall\chimes\fin\Purchasing\PORequisition\PORequisition', 'crothall', 'chimes', 'fin', 'Purchasing', 'PORequisition', 'PORequisition', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'RequisitionToPO', 'Convert PO Requisition to Purchase Order', 'Convert PO Requisition to Purchase Order', @DisplayOrder + 2, 1, '\crothall\chimes\fin\Purchasing\PORequisition\ConvertPORequisitionToPO', 'crothall', 'chimes', 'fin', 'Purchasing', 'PORequisition', 'ConvertPORequisitionToPO', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\Purchasing\PORequisition%'
Update ESMV2.dbo.HirNodes Set HirNodBrief = 'PORequisition', HirNodTitle = 'PO Requisition' Where HirNodFullPath = '\crothall\chimes\fin\Purchasing\PORequisition'
-- Add security nodes for action menu items in PO Requisition UI [End]

/*
CT updated on 30th July 2014 11PM EST
*/

-- Add the following key in pay-->act web.config file
<add key="sendPayrollProcessEmailNotification" value="true" />

/*
CT updated on 20th August 2014 11PM EST
*/

/*
Last production release version 2.04.013 on 3rd September 2014 11PM EST
*/
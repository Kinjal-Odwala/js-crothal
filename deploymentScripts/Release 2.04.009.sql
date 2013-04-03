/*
Last production release version 2.04.008 on 14th November 2012 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.009', M_ENV_ENV_Database_Version = '2.04.009' 
Where M_ENV_ENVIRONMENT = 4

/*
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmBudgetTemplate Int NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmBudgetComputerRelatedCharge Bit NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmHouseCodes] ADD HcmBudgetLaborCalcMethod Int NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD RevInvoiceTemplate Int NULL
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ALTER COLUMN [HcmJobTitle] VARCHAR(256)
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceItems] ADD RevInviDisplayOrder Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceItems] ADD WomWorkOrderItem Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD HcmInvoiceLogoType Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ADD RevInvoiceAddressType Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoices] ALTER COLUMN [RevInvBillTo] VARCHAR(256)
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcFilter Bit NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcDependantColumns VarChar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcWidth Int NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcEditable Bit NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcLength Int NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModules] ADD AppModHouseCodeAssociated Bit NULL
ALTER TABLE [dbo].[AppModuleColumns] DROP COLUMN AppModuleAssociate
EXEC sp_rename 'AppModules.AppModAssociateModule', 'AppModEditable', 'COLUMN'
EXEC sp_rename 'BudAnnualInformations.BudAnniRetailVacationAccuralPercent', 'BudAnniRetailVacationAccrualPercent', 'COLUMN'

ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ALTER COLUMN WomwoServiceLocation Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationBrief Varchar(8) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationContact Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationAddress1 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationAddress2 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationCity Varchar(100) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationState Int NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoServiceLocationPostalCode Varchar(12) NULL

ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ALTER COLUMN WomwoCustomer Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerBrief Varchar(8) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerContact Varchar(50) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerAddress1 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerAddress2 Varchar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerCity Varchar(100) NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerState Int NULL
ALTER TABLE [TeamFinV2].[dbo].[WomWorkOrders] ADD WomwoCustomerPostalCode Varchar(12) NULL

ALTER TABLE [TeamFinV2].[dbo].[BudAnnualInformations] ADD BudAnniSupplySurchargeRate Float NULL
ALTER TABLE [TeamFinV2].[dbo].[BudAnnualInformations] ADD BudAnniComputerRelatedChargeUnit Float NULL
ALTER TABLE [TeamFinV2].[dbo].[BudAnnualInformations] ADD BudAnniComputerRelatedChargeOverhead Float NULL
ALTER TABLE [TeamFinV2].[dbo].[BudAnnualInformations] ADD BudAnniRetailVacationAccuralPercent Float NULL

ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod1] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod2] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod3] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod4] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod5] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod6] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod7] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod8] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod9] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod10] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod11] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod12] float
ALTER TABLE [TeamFinV2].[dbo].[BudFinalLabors] ALTER COLUMN [BudFinlPeriod13] float
*/

-- HouseCode --> Jobs field level security nodes Insert [Begin]
Declare @HirNodeParent Int
	, @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'InvoiceTemplate', 'invoiceTemplate', 'invoiceTemplate', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\Jobs\InvoiceTemplate'
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Read', 'read', 'read', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
Set @DisplayOrder = @DisplayOrder + 1
EXEC Esmv2.dbo.[HirNodeUpdate] 0, 1, @HirNodeParent, 9, 'Write', 'write', 'write', @DisplayOrder, 1, 'Compass-USA\Data Conversion'
-- HouseCode --> Jobs field level security nodes Insert [End]

Insert Into dbo.HcmBudgetTemplates(HcmBudtBrief, HcmBudtTitle, HcmBudtDescription, HcmBudtDisplayOrder, HcmBudtActive, HcmBudtModBy, HcmBudtModAt)
Values ('Management Fee', 'Management Fee', 'Management Fee', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmBudgetTemplates(HcmBudtBrief, HcmBudtTitle, HcmBudtDescription, HcmBudtDisplayOrder, HcmBudtActive, HcmBudtModBy, HcmBudtModAt)
Values ('Full Service Bil', 'Full Service Billings', 'Full Service Billings', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmBudgetTemplates(HcmBudtBrief, HcmBudtTitle, HcmBudtDescription, HcmBudtDisplayOrder, HcmBudtActive, HcmBudtModBy, HcmBudtModAt)
Values ('Over Head Accoun', 'Over Head Account', 'Over Head Account', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmBudgetTemplates(HcmBudtBrief, HcmBudtTitle, HcmBudtDescription, HcmBudtDisplayOrder, HcmBudtActive, HcmBudtModBy, HcmBudtModAt)
Values ('Retail', 'Retail', 'Retail', 4, 1, 'Compass-USA\Data Conversion', GetDate())

/*
Insert Into dbo.RevInvoiceTemplates (RevInvtBrief, RevInvtTitle, RevInvtDescription, RevInvtActive, RevInvtDisplayOrder, RevInvtModBy, RevInvtModAt)
Values ('Standard', 'Standard', 'Standard', 1, 1, 'Compass-USA\Data Conversion', GetDate())
*/
Insert Into dbo.HcmBudgetLaborCalcMethods(HcmBudlcmBrief, HcmBudlcmTitle, HcmBudlcmDescription, HcmBudlcmDisplayOrder, HcmBudlcmActive, HcmBudlcmModBy, HcmBudlcmModAt)
Values ('Standard', 'Standard', 'Standard', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.HcmBudgetLaborCalcMethods(HcmBudlcmBrief, HcmBudlcmTitle, HcmBudlcmDescription, HcmBudlcmDisplayOrder, HcmBudlcmActive, HcmBudlcmModBy, HcmBudlcmModAt)
Values ('WorkDays', 'WorkDays', 'WorkDays', 2, 1, 'Compass-USA\Data Conversion', GetDate())

Add the following key in hcm-->act web.config file
<add key="FinRevPath" value="/net/crothall/chimes/fin/rev/act/provider.aspx?moduleId=rev" />

Add the following key in adh-->act web.config file
<add key="FinRevPath" value="/net/crothall/chimes/fin/rev/act/provider.aspx?moduleId=rev" />

Add the following key in pay-->act web.config file
<add key="FinSMTPServer" value="relay.compass-usa.com" />
<add key="FinSenderEmail" value="teamfinpostoffice@crothall.com" />
<add key="PayrollEmail" value="" />
<add key="PayCheckRequestApprovalPath" value="https://finct.crothall.com/net/crothall/chimes/fin/pay/act/ApprovePayCheckRequest.aspx" />
<add key="ConnectionString" value="Data Source=Data Source=CHIUSCHP397;Initial Catalog=TeamFinv2;User ID=Esm;Password=Esm" />

-- To set validations for Employee module in adhreport
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSSN'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpStatusType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'PayPayrollCompany'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpJobCodeType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgHireDate'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPTOStartDate'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDate'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpStatusCategoryType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRate'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpGenderType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEthnicityType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgBirthDate'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusFederalTaxType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrimaryState'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypePrimary'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'PayPayFrequencyType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDateJob'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDateCompensation'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusType'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 2 And AppModcTitle = 'HcmHouseCodeJob'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 2 And AppModcTitle = 'EmpSeparationCode'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode1'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode2'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode3'
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 2 And AppModcTitle = 'AppTransactionStatusType'
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 2 And AppModcTitle = 'HcmHouseCode'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpStatusType' Where AppModule = 2 And AppModcTitle = 'EmpStatusCategoryType'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpTerminationReasonType' Where AppModule = 2 And AppModcTitle = 'EmpSeparationCode'
Update AppModuleColumns Set AppModcDependantColumns = 'PayPayrollCompany,EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode1'
Update AppModuleColumns Set AppModcDependantColumns = 'PayPayrollCompany,EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode2'
Update AppModuleColumns Set AppModcDependantColumns = 'PayPayrollCompany,EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode3'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypePrimary'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpStateAdjustmentType'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpSDIAdjustmentType'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpEmpgPrimaryState' Where AppModule = 2 And AppModcTitle = 'EmpLocalTaxAdjustmentType'
Update AppModuleColumns Set AppModcDependantColumns = 'EmpEmpgSecondaryState' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypeSecondary'

-- To set validations for Person module in adhreport
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoFirstName'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoLastName'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoMiddleName'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine1'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine2'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoCity'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'AppStateType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoPostalCode'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoHomePhone'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoFax'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoCellPhone'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoEmail'
Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 5 And AppModcTitle = 'PplPeoPager'

-- To set validations for User module in adhreport
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 6 And AppModcTitle = 'HirNodeTop'
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 6 And AppModcTitle = 'HirNodeCurrent'
Update AppModuleColumns Set AppModcAdHocActive = 1 Where AppModule = 6 And AppModcTitle = 'AppUseActive'
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 6 And AppModcTitle = 'AppUsePassword'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 6 And AppModcTitle = 'AppUsePassword'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 6 And AppModcTitle = 'AppRoleCurrent'

-- To set validations for Unit module in adhreport
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 8

Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'HcmHouseCode'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'RevInvWeek'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'FscPeriod'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'FscYear'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'RevInvStateTax'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'RevMunicipalityTax'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'RevInvLocalTax'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'WomWorkOrder'
Update Appmodulecolumns Set AppModcAdHocActive = 0 Where AppModule = 3 And AppModcTitle = 'RevInvOtherMunicipality'
Update Appmodulecolumns Set AppModcAdHocActive = 1 Where AppModule = 3 And AppModcTitle = 'HcmJobBrief'
Update AppModuleColumns Set AppModcEditable = 0 Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceNumber'
Update AppModuleColumns Set AppModcEditable = 0 Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceByHouseCode'

-- Update module associations [Begin]
Update dbo.AppModuleAssociations Set AppModaActive = 0 Where AppModule = 1 And AppModuleAssociate In (2,3,5,6)
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (2, 1, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (2, 5, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (3, 1, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (3, 4, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (3, 8, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (4, 1, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (4, 8, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (5, 1, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (5, 2, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (6, 1, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (6, 2, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (6, 5, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (8, 1, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (8, 4, 1, 'compass-usa\data conversion', GetDate())
Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (9, 1, 1, 'compass-usa\data conversion', GetDate())
-- Update module associations [End]

-- Add Read/Write security nodes for BudgetTemplate in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BudgetTemplate', 'BudgetTemplate', 'BudgetTemplate', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetTemplate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetTemplate', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetTemplate'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetTemplate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetTemplate', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetTemplate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetTemplate', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BudgetTemplate', 'BudgetTemplate', 'BudgetTemplate', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetTemplate', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetTemplate', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetTemplate'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetTemplate\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetTemplate', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetTemplate\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetTemplate', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for BudgetTemplate in House Code [End]

-- Add Read/Write security nodes for BudgetComputerRelatedCharge in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BudCRCharge', 'BudgetComputerRelatedCharge', 'BudgetComputerRelatedCharge', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetComputerRelatedCharge', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetComputerRelatedCharge', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetComputerRelatedCharge', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BudCRCharge', 'BudgetComputerRelatedCharge', 'BudgetComputerRelatedCharge', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetComputerRelatedCharge', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetComputerRelatedCharge', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetComputerRelatedCharge\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetComputerRelatedCharge', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for BudgetComputerRelatedCharge in House Code [End]

-- Update the width of the each column [Begin]
Update dbo.AppModuleColumns Set AppModcWidth = 200

Update dbo.AppModuleColumns Set AppModcValidation = 'Zip' Where AppModule = 3 And AppModcTitle = 'RevInvPostalCode'
Update dbo.AppModuleColumns Set AppModcValidation = 'Bit' Where AppModule = 5 And AppModcTitle = 'PplPeoEmployeeHouseCodeUpdated'
Update dbo.AppModuleColumns Set AppModcDescription = 'Local Tax Adjustment Amount' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxAdjustmentAmount'

Update dbo.AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 1 And AppModcTitle = 'HcmHoucStateTaxPercent'
Update dbo.AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 1 And AppModcTitle = 'HcmHoucLocalTaxPercent'
Update dbo.AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 1 And AppModcTitle = 'HcmLaborTrackingType'

Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 1 And AppModcTitle = 'FscJDECompany'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucStartDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmServiceType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucEnforceLaborControl'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerCellPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerFax'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerPager'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerAssistantPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientFax'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientAssistantPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagedEmployees'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBedsLicensed'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucPatientDays'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAverageDailyCensus'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualDischarges'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAverageBedTurnaroundTime'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucNetCleanableSqft'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAverageLaundryLbs'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucCrothallEmployees'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBedsActive'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAdjustedPatientDaysBudgeted'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualTransfers'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualTransports'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingCity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingState'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingZip'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmRemitToLocation'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmContractType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmTermsOfContractType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmBillingCycleFrequencyType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankCity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankState'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankZip'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankFax'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankCodeNumber'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankAccountNumber'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankCity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankState'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankZip'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankFax'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmPayrollProcessingLocationType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucDefaultLunchBreak'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucLunchBreakTrigger'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHouseCodeType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmLaborTrackingType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucRoundingTimePeriod'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucTimeAndAttendance'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmServiceLine'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmInvoiceLogoType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucEPaySite'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmEPayGroupType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmServiceLineFinancialEntity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucReference'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucFormerProvider'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucPayrollConversion'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucClosedDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucClosedReason'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucLostTo'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 1 And AppModcTitle = 'HcmHoucLocation'

Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSSN'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpStatusType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpDeviceGroupType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExempt'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpJobCodeType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgHourly'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgHireDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpRateChangeReasonType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgRateChangeDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSeniorityDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgTerminationDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpTerminationReasonType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpWorkShift'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgBenefitsPercentage'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgScheduledHours'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgUnion'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgCrothallEmployee'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEmployeeNumber'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportETax'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEBase'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportECard'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEPerson'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEJob'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEComp'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEPayroll'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEEmploy'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgExportEUnion'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateA'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateB'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateC'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateD'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPTOStartDate'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPTOAccruedHourEntryAutomatic'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgOriginalHireDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDate'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpUnionType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpStatusCategoryType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRateEnteredBy'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRateEnteredAt'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRateEnteredBy'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRateEnteredAt'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRateEnteredBy'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRateEnteredAt'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpGenderType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEthnicityType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgBirthDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgReviewDate'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgWorkPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgWorkPhoneExt'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgBackGroundCheckDate'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgFederalExemptions'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpFederalAdjustmentType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusFederalTaxType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgFederalAdjustmentAmount'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrimaryState'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSecondaryState'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypePrimary'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypeSecondary'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgStateExemptions'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpStateAdjustmentType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgStateAdjustmentAmount'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpSDIAdjustmentType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSDIRate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpLocalTaxAdjustmentType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxAdjustmentAmount'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode1'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode2'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode3'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayrollStatus'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPreviousPayrollStatus'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'PayPayFrequencyType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'HcmHouseCodeJob'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpI9Type'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpVetType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpSeparationCode'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpJobStartReasonType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDateJob'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDateCompensation'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgCurrentStatusCode'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 2 And AppModcTitle = 'EmpEmpgChangeStatusCode'

Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceNumber'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvDueDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvServicePeriodStartDate'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvServicePeriodEndDate'
Update dbo.AppModuleColumns Set AppModcWidth = 200 Where AppModule = 3 And AppModcTitle = 'RevInvBillTo'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvCompany'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvAddress1'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvAddress2'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvCity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'AppStateType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvPostalCode'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvPrinted'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvPrintedBy'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvLastPrinted'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvCreditMemoLastPrinted'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvPaidOff'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'AppTransactionStatusType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvTaxExempt'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvTaxNumber'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvPONumber'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvExported'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 3 And AppModcTitle = 'RevInvExportedDate'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'HcmJobBrief'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceByHouseCode'

Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine1'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine2'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitCity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppStateType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 4 And AppModcTitle = 'AppSitPostalCode'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitCounty'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppIndustryType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppPrimaryBusinessType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppLocationType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppTraumaLevelType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppProfitDesignationType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppGPOType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitSpecifyGPO'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppOwnershipType'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitGEOCode'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitMedicareProviderId'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitMorrisonAccount'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 4 And AppModcTitle = 'AppSitSitePhone'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 4 And AppModcTitle = 'AppSitActive'

Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoFirstName'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoLastName'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoMiddleName'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine1'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine2'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoCity'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'AppStateType'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 5 And AppModcTitle = 'PplPeoPostalCode'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoHomePhone'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoFax'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoCellPhone'
Update dbo.AppModuleColumns Set AppModcWidth = 200 Where AppModule = 5 And AppModcTitle = 'PplPeoEmail'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoPager'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 5 And AppModcTitle = 'PplPeoActive'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 5 And AppModcTitle = 'PplPeoEmployeeHouseCodeUpdated'

Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 6 And AppModcTitle = 'AppRoleCurrent'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 6 And AppModcTitle = 'AppUseActive'

Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 7 And AppModcTitle = 'HirNodDisplayOrder'

Update dbo.AppModuleColumns Set AppModcWidth = 400 Where AppModule = 7 And AppModcTitle = 'HirNodFullPath'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel1'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel2'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel3'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel4'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel5'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel6'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel7'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel8'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel9'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel10'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel11'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel12'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel13'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel14'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel15'
Update dbo.AppModuleColumns Set AppModcWidth = 150 Where AppModule = 7 And AppModcTitle = 'HirNodLevel16'
Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 7 And AppModcTitle = 'HirNodDisplayOrder'

Update dbo.AppModuleColumns Set AppModcWidth = 100 Where AppModule = 8 And AppModcTitle = 'AppUniBrief'
Update dbo.AppModuleColumns Set AppModcWidth = 200 Where AppModule = 8 And AppModcTitle = 'AppUniTitle'
Update dbo.AppModuleColumns Set AppModcWidth = 200 Where AppModule = 8 And AppModcTitle = 'AppUniDescription'
-- Update the width of the each column [End]

-- Job module [Begin]
Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModEditable, AppModHouseCodeAssociated)
Values ('Job', 'HcmJobs', 1, 1, 'compass-usa\data conversion', GetDate(), 1, 0)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJob', 'HcmJob', 0, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 0, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'FscJDEJobCode', 'JDE JobCode', 1, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 0, Null, Null, Null, 150, Null, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobBrief', 'Job Number', 2, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 100, Null, 8)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobTitle', 'Description', 3, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, Null, Null, 300, Null, 256)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobDescription', 'Description', 4, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 0, Null, Null, Null, 300, Null, 256)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobContact', 'Contact', 5, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobAddress1', 'Address 1', 6, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobAddress2', 'Address 2', 7, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobPostalCode', 'Postal Code', 8, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, 'Zip', 1, Null, Null, Null, 100, Null, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobGEOCode', 'GEO Code', 9, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, 'AppZipCodeTypes', Null, Null, 100, Null, 2)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobCity', 'City', 10, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 1, Null, 0, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'AppStateType', 'State', 11, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 1, 'AppStateTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobType', 'Job Type', 12, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 1, 'HcmJobTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'RevInvoiceTemplate', 'Invoice Template', 13, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'RevInvoiceTemplates', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobTaxId', 'Tax Id', 14, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, Null, Null, Null, 150, Null, 9)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobOverrideSiteTax', 'Override Site Tax', 15, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 1, 'Bit', 1, Null, Null, Null, 100, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobServiceContract', 'Service Contract', 16, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 100)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobGeneralLocationCode', 'General Location Code', 17, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 1, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobActive', 'Active', 18, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 1, 'Bit', 1, Null, Null, Null, 100, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmEPayGroupType', 'EPay Group Type', 19, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 0, 'HcmEPayGroupTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobDisplayOrder', 'Display Order', 20, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 0, Null, Null, Null, 150, Null, 10)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobModBy', 'Mod By', 21, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 0, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (9, 'HcmJobModAt', 'Mod At', 22, 1, 'compass-usa\data conversion', GetDate(), 'DateTime', 1, 'DateTime', 0, Null, Null, Null, 150, Null, 10)

-- Job module [End]

-- Update the length of the column [Begin]
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 1 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerName'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerAssistantName'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientFirstName'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientLastName'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientTitle'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucClientAssistantName'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagedEmployees'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucBedsLicensed'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucPatientDays'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAverageDailyCensus'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualDischarges'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAverageBedTurnaroundTime'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucNetCleanableSqft'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAverageLaundryLbs'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucCrothallEmployees'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucBedsActive'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAdjustedPatientDaysBudgeted'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualTransfers'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucAnnualTransports'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingAddress1'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingAddress2'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingCity'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankCodeNumber'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankAccountNumber'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankName'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankContact'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankAddress1'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankAddress2'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankCity'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 1 And AppModcTitle = 'HcmHoucBankEmail'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucDefaultLunchBreak'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucLunchBreakTrigger'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 1 And AppModcTitle = 'HcmHoucRoundingTimePeriod'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucManagerEmail'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTerminatedHourlyEmployees'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeActiveHourlyEmployees'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalProductiveLaborHoursWorked'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalNonProductiveLaborHours'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalProductiveLaborDollarsPaid'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucMgmtFeeTotalNonProductiveLaborDollarsPaid'
Update dbo.AppModuleColumns Set AppModcLength = 11 Where AppModule = 1 And AppModcTitle = 'HcmHoucHospitalPaidJanitorialPaperPlasticSupplyCost'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucFormerProvider'
Update dbo.AppModuleColumns Set AppModcLength = 8000 Where AppModule = 1 And AppModcTitle = 'HcmHoucClosedReason'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucLostTo'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 1 And AppModcTitle = 'HcmHoucLocation'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 2 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 2 And AppModcTitle = 'EmpEmpgBrief'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSSN'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgBenefitsPercentage'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgScheduledHours'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgEmployeeNumber'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateA'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateB'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateC'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateD'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRate'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRateEnteredBy'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRate'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRateEnteredBy'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRate'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRateEnteredBy'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgWorkPhoneExt'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgFederalExemptions'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 2 And AppModcTitle = 'EmpEmpgFederalAdjustmentAmount'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 2 And AppModcTitle = 'EmpEmpgStateExemptions'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 2 And AppModcTitle = 'EmpEmpgStateAdjustmentAmount'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 2 And AppModcTitle = 'EmpEmpgSDIRate'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxAdjustmentAmount'
Update dbo.AppModuleColumns Set AppModcLength = 1 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayrollStatus'
Update dbo.AppModuleColumns Set AppModcLength = 1 Where AppModule = 2 And AppModcTitle = 'EmpEmpgPreviousPayrollStatus'
Update dbo.AppModuleColumns Set AppModcLength = 1 Where AppModule = 2 And AppModcTitle = 'EmpEmpgCurrentStatusCode'
Update dbo.AppModuleColumns Set AppModcLength = 1 Where AppModule = 2 And AppModcTitle = 'EmpEmpgChangeStatusCode'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 3 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 3 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 3 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceNumber'
Update dbo.AppModuleColumns Set AppModcLength = 64 Where AppModule = 3 And AppModcTitle = 'RevInvBillTo'
Update dbo.AppModuleColumns Set AppModcLength = 64 Where AppModule = 3 And AppModcTitle = 'RevInvCompany'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 3 And AppModcTitle = 'RevInvAddress1'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 3 And AppModcTitle = 'RevInvAddress2'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 3 And AppModcTitle = 'RevInvCity'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 3 And AppModcTitle = 'RevInvPostalCode'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 3 And AppModcTitle = 'RevInvPrintedBy'
Update dbo.AppModuleColumns Set AppModcLength = 9 Where AppModule = 3 And AppModcTitle = 'RevInvTaxNumber'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 3 And AppModcTitle = 'RevInvPONumber'
Update dbo.AppModuleColumns Set AppModcLength = 8 Where AppModule = 3 And AppModcTitle = 'HcmJobBrief'
Update dbo.AppModuleColumns Set AppModcLength = 1024 Where AppModule = 3 And AppModcTitle = 'RevInvNotes'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 4 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 4 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 4 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 64 Where AppModule = 4 And AppModcTitle = 'AppSitTitle'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine1'
Update dbo.AppModuleColumns Set AppModcLength = 100 Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine2'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 4 And AppModcTitle = 'AppSitCity'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 4 And AppModcTitle = 'AppSitCounty'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 4 And AppModcTitle = 'AppSitSpecifyGPO'
Update dbo.AppModuleColumns Set AppModcLength = 2 Where AppModule = 4 And AppModcTitle = 'AppSitGEOCode'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 4 And AppModcTitle = 'AppSitMedicareProviderId'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 5 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 5 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 5 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 5 And AppModcTitle = 'PplPeoBrief'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 5 And AppModcTitle = 'PplPeoFirstName'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 5 And AppModcTitle = 'PplPeoLastName'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 5 And AppModcTitle = 'PplPeoMiddleName'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine1'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine2'
Update dbo.AppModuleColumns Set AppModcLength = 255 Where AppModule = 5 And AppModcTitle = 'PplPeoCity'
Update dbo.AppModuleColumns Set AppModcLength = 150 Where AppModule = 5 And AppModcTitle = 'PplPeoEmail'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 6 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 6 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 6 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 50 Where AppModule = 5 And AppModcTitle = 'AppUseUserName'
Update dbo.AppModuleColumns Set AppModcLength = 30 Where AppModule = 5 And AppModcTitle = 'AppUsePassword'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 5 And AppModcTitle = 'AppUseBrief'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 7 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 7 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 7 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 7 And AppModcTitle = 'HirNodBrief'
Update dbo.AppModuleColumns Set AppModcLength = 64 Where AppModule = 7 And AppModcTitle = 'HirNodTitle'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodDescription'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 7 And AppModcTitle = 'HirNodDisplayOrder'
Update dbo.AppModuleColumns Set AppModcLength = 1000 Where AppModule = 7 And AppModcTitle = 'HirNodFullPath'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel1'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel2'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel3'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel4'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel5'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel6'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel7'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel8'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel9'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel10'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel11'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel12'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel13'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel14'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel15'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 7 And AppModcTitle = 'HirNodLevel16'

Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 8 And AppModcType = 'DateTime' And AppModcValidation = 'DateTime'
Update dbo.AppModuleColumns Set AppModcLength = 14 Where AppModule = 8 And AppModcType = 'Varchar' And AppModcValidation = 'Phone'
Update dbo.AppModuleColumns Set AppModcLength = 10 Where AppModule = 8 And AppModcType = 'Varchar' And AppModcValidation = 'Zip'
Update dbo.AppModuleColumns Set AppModcLength = 16 Where AppModule = 8 And AppModcTitle = 'AppUniBrief'
Update dbo.AppModuleColumns Set AppModcLength = 64 Where AppModule = 8 And AppModcTitle = 'AppUniTitle'
Update dbo.AppModuleColumns Set AppModcLength = 256 Where AppModule = 8 And AppModcTitle = 'AppUniDescription'

-- Update the length of the column [End]

Update dbo.AppModules Set AppModHouseCodeAssociated = 1
Update dbo.AppModules Set AppModHouseCodeAssociated = 0 Where AppModule = 9
Update dbo.AppModules Set AppModEditable = 1
Update dbo.AppModules Set AppModEditable = 0 Where AppModule = 7

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmHoucEPayTask', 'EPay Task', 110, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 1, 'Bit', 1, Null, Null, Null, 100, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmBudgetTemplate', 'Budget Template', 111, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'HcmBudgetTemplates', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (2, 'EmpUnionStatusType', 'Union Status', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'EmpUnionStatusTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (2, 'EmpEmpgPrimaryStateAdditionalInformation', '', 80, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 0, Null, Null, Null, 150, Null, 20)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (2, 'EmpEmpgSecondaryStateAdditionalInformation', '', 80, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 1, Null, 0, Null, Null, Null, 150, Null, 20)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (2, 'EmpBasicLifeIndicatorType', 'Basic Life Indicator', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'EmpBasicLifeIndicatorTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (3, 'RevInvoiceBatch', 'Batch', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'RevInvoiceBatches', 0, Null, 150, 0, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (3, 'HcmInvoiceLogoType', 'Invoice Logo', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'HcmInvoiceLogoTypes', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (6, 'AppUseLastLogOn', 'Last Logged On', 80, 1, 'compass-usa\data conversion', GetDate(), 'DateTime', 1, 'DateTime', 1, Null, Null, Null, 150, 0, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (8, 'HirNode', 'HirNode', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 0, 'Int', 0, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (8, 'AppUniDisplayOrder', 'Display Order', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 0, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (8, 'AppUniActive', 'Active', 80, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 0, 'Bit', 0, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (8, 'AppUniModBy', 'Mod By', 80, 1, 'compass-usa\data conversion', GetDate(), 'Varchar', 0, Null, 0, Null, Null, Null, 150, Null, 50)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (8, 'AppUniModAt', 'Mod At', 80, 1, 'compass-usa\data conversion', GetDate(), 'DateTime', 0, 'DateTime', 0, Null, Null, Null, 150, Null, Null)

/*
CT updated on 27th February 2013 11PM EST
*/

-- Add Read/Write security nodes for BudgetLaborCalcMethod in House Code [Begin]

Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BudgetLCMethod', 'BudgetLaborCalcMethod', 'BudgetLaborCalcMethod', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetLaborCalcMethod', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetLaborCalcMethod', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetLaborCalcMethod'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetLaborCalcMethod\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetLaborCalcMethod', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodes\TabFinancial\SectionFinancial\BudgetLaborCalcMethod\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodes', 'TabFinancial', 'SectionFinancial', 'BudgetLaborCalcMethod', 'Write', 'Compass-USA\Data Conversion', GetDate())

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'BudgetLCMethod', 'BudgetLaborCalcMethod', 'BudgetLaborCalcMethod', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetLaborCalcMethod', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetLaborCalcMethod', 'Compass-USA\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetLaborCalcMethod'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Read', 'Read', 'Read', @DisplayOrder + 2, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetLaborCalcMethod\Read', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetLaborCalcMethod', 'Read', 'Compass-USA\Data Conversion', GetDate())

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodLevel7, HirNodLevel8, HirNodLevel9, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'Write', 'Write', 'Write', @DisplayOrder + 3, 1, '\crothall\chimes\fin\HouseCodeSetup\HouseCodeWizard\TabFinancial\SectionFinancial\BudgetLaborCalcMethod\Write', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'HouseCodeWizard', 'TabFinancial', 'SectionFinancial', 'BudgetLaborCalcMethod', 'Write', 'Compass-USA\Data Conversion', GetDate())

-- Add Read/Write security nodes for BudgetLaborCalcMethod in House Code [End]

Insert Into dbo.RevInvoiceAddressTypes(RevInvatBrief, RevInvatTitle, RevInvatDescription, RevInvatDisplayOrder, RevInvatActive, RevInvatModBy, RevInvatModAt)
Values ('No Remit To', 'No Remit To', 'No Remit To', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevInvoiceAddressTypes(RevInvatBrief, RevInvatTitle, RevInvatDescription, RevInvatDisplayOrder, RevInvatActive, RevInvatModBy, RevInvatModAt)
Values ('No Inquires', 'No Inquires', 'No Inquires', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.RevInvoiceAddressTypes(RevInvatBrief, RevInvatTitle, RevInvatDescription, RevInvatDisplayOrder, RevInvatActive, RevInvatModBy, RevInvatModAt)
Values ('NoRemitToAndInqu', 'No Remit To and Inquires', 'No Remit To and Inquires', 3, 1, 'Compass-USA\Data Conversion', GetDate())

-- Add new columns to Ad-Hoc reports
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmBudgetLaborCalcMethod', 'Budget Labor Calc Method', 112, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'HcmBudgetLaborCalcMethods', Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (1, 'HcmBudgetComputerRelatedCharge', 'Budget Computer Related Charge', 113, 1, 'compass-usa\data conversion', GetDate(), 'Bit', 0, 'Bit', 1, Null, Null, Null, 150, Null, Null)
Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModcReferenceTableName, AppModcFilter, AppModcDependantColumns, AppModcWidth, AppModcEditable, AppModcLength)
Values (3, 'RevInvoiceAddressType', 'Invoice Address', 80, 1, 'compass-usa\data conversion', GetDate(), 'Int', 1, 'Int', 1, 'RevInvoiceAddressTypes', Null, Null, 150, Null, Null)


USE [TeamFinv2]
GO
/****** Object:  UserDefinedFunction [dbo].[GetServiceLocationTemp]    Script Date: 03/05/2013 10:20:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetServiceLocationTemp]
(
    @ServiceLocation varchar(64),
    @HcmHouseCode int
)
RETURNS TABLE
AS
RETURN
Select top 1 
 sl.WOBrief AS WOBrief,
 sl.WOServiceLocation AS WOServiceLocation,
 sl.WOSLAddress1 AS WOSLAddress1,
 sl.WOSLAddress2 AS WOSLAddress2,
 sl.WOSLCity AS WOSLCity,
 sl.WOSLState AS WOSLState,
 sl.WOSLStateType AS WOSLStateType,
 sl.WOSLZip AS WOSLZip,
 sl.HcmHouseCode AS HcmHouseCode
from 
(SELECT 
            hj.HcmJobBrief as WOBrief,
			hj.HcmJobTitle AS WOServiceLocation,
			ISNULL(hj.HcmJobAddress1,'') AS WOSLAddress1,
			ISNULL(hj.HcmJobAddress2,'') AS WOSLAddress2,
			ISNULL(hj.HcmJobCity,'') AS WOSLCity,
			CASE
				WHEN hj.AppStateType = 0
				THEN ''
				ELSE st.AppStatBrief
			END AS WOSLState,
            hj.AppStateType AS WOSLStateType,
			hj.HcmJobPostalCode AS WOSLZip,
			hcj.HcmHouseCode AS HcmHouseCode
		FROM TeamFinv2.dbo.HcmJobs hj WITH (NOLOCK) 
        LEFT OUTER JOIN Esmv2.dbo.AppStateTypes st WITH (NOLOCK) ON
			hj.AppStateType = st.AppStateType 
        INNER JOIN TeamFinv2..HcmHouseCodeJobs hcj WITH  (NOLOCK) ON
			hj.HcmJob = hcj.HcmJob
		WHERE
			hj.HcmJobType = 2 AND
            hj.HcmJobTitle = @ServiceLocation AND
            hcj.HcmHouseCode = @HcmHouseCode
		UNION ALL

		SELECT
            '' as WOBrief,
			au.AppUniTitle AS WOServiceLocation,
			s.AppSitAddressLine1 AS WOSLAddress1,
			s.AppSitAddressLine2 AS WOSLAddress2,
			s.AppSitCity AS WOSLCity,
			st.AppStatBrief AS WOSLState,
            s.AppStateType AS WOSLStateType,
			s.AppSitPostalCode AS WOSLZip,
			hc.HcmHouseCode as HcmHouseCode
		FROM Esmv2.dbo.AppUnits au WITH (NOLOCK) 
        INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
			au.AppUnit = hc.AppUnit 
        INNER JOIN Esmv2.dbo.AppSiteUnits asu WITH (NOLOCK) ON
			au.AppUnit = asu.AppUnit 
        INNER JOIN Esmv2.dbo.AppSites s WITH (NOLOCK) ON 
			asu.AppSite = s.AppSite 
        INNER JOIN Esmv2.dbo.AppStateTypes st WITH (NOLOCK) ON
			s.AppStateType = st.AppStateType 		
       Where
            au.AppUniTitle  = @ServiceLocation AND
            hc.HcmHouseCode = @HcmHouseCode
) sl


USE [TeamFinv2]
GO
/****** Object:  UserDefinedFunction [dbo].[GetWorkOrderItemTemp]    Script Date: 03/05/2013 10:20:03 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[GetWorkOrderItemTemp]
(
    @WorkOrder int,
    @WomwoiDescription varchar(1024)
)
RETURNS TABLE
AS
RETURN
Select top 1 
 WomWorkOrderItem AS WomWorkOrderItem
from dbo.WomWorkOrderItems 
where WomWorkOrder = @WorkOrder
and WomwoiDescription = @WomwoiDescription

----RevInvoices Logo
Update rii
Set rii.HcmInvoiceLogoType = hc.HcmInvoiceLogoType
From RevInvoices rii 
	inner join dbo.HcmHouseCodes hc On rii.HcmHouseCode = hc.HcmHouseCode
where rii.HcmInvoiceLogoType is NULL

-----WomWorkOrders service location and customer address
Update wwo
SET wwo.WomwoServiceLocationBrief = WOSLBrief,
	wwo.WomwoServiceLocationAddress1 = WOSLAddress1,
	wwo.WomwoServiceLocationAddress2 = WOSLAddress2,
	wwo.WomwoServiceLocationCity = WOSLCity,
	wwo.WomwoServiceLocationState = WOSLStateType,	
	wwo.WomwoServiceLocationPostalCode = WOSLZip,
    wwo.WomwoCustomerBrief = WOCBrief,
	wwo.WomwoCustomerAddress1 = WOCAddress1,
	wwo.WomwoCustomerAddress2 = WOCAddress2,
	wwo.WomwoCustomerCity = WOCCity,
	wwo.WomwoCustomerState = WOCStateType,
	wwo.WomwoCustomerPostalCode = WOCZip
from WomWorkOrders wwo
INNER JOIN
(SELECT
    wo.WomWorkOrder AS WONumberID,
	wo.WomwoWorkOrderNumber AS WONumber,
	au.AppUniBrief AS HouseCode,
	wo.WomwoServiceLocation AS WOServiceLocation,
    wosl.WOBrief AS WOSLBrief,
	wosl.WOSLAddress1,
	wosl.WOSLAddress2,
	wosl.WOSLCity,
	wosl.WOSLState,
    wosl.WOSLStateType,
	wosl.WOSLZip,
    woc.WOBrief AS WOCBrief,
	wo.WomwoCustomer AS WOCustomer,
	woc.WOSLAddress1 AS WOCAddress1,
	woc.WOSLAddress2 AS WOCAddress2,
	woc.WOSLCity AS WOCCity,
	woc.WOSLState AS WOCState,
    woc.WOSLStateType AS WOCStateType,
	woc.WOSLZip AS WOCZip
FROM
	TeamFinv2.dbo.WomWorkOrders wo WITH (NOLOCK) 
INNER JOIN TeamFinv2.dbo.WomWorkOrderItems woi WITH (NOLOCK) ON
	wo.WomWorkOrder = woi.WomWorkOrder 
INNER JOIN TeamFinv2.dbo.WomWorkOrderTasks wot WITH (NOLOCK) ON
	woi.WomWorkOrderTask = wot.WomWorkOrderTask 
INNER JOIN TeamFinv2.dbo.AppTransactionStatusTypes ast WITH (NOLOCK) ON
	wo.AppTransactionStatusType = ast.AppTransactionStatusType 
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
	wo.HcmHouseCode = hc.HcmHouseCode 
INNER JOIN Esmv2.dbo.AppUnits au WITH (NOLOCK) ON
	hc.AppUnit = au.AppUnit 
INNER JOIN TeamFinv2.dbo.HcmHouseCodeJobs hhcj WITH (NOLOCK) ON
	wo.HcmHouseCodeJob = hhcj.HcmHouseCodeJob INNER JOIN TeamFinv2.dbo.HcmJobs hj WITH (NOLOCK) ON
	hhcj.HcmJob = hj.HcmJob 
INNER JOIN TeamFinv2.dbo.FscJDECompanies jde WITH (NOLOCK) ON
	hc.FscJDECompany = jde.FscJDECompany 
OUTER APPLY [GetServiceLocationTemp](wo.WomwoServiceLocation,wo.HcmHouseCode) wosl
LEFT OUTER JOIN 
	(
		SELECT 
            hj.HcmJobBrief AS WOBrief,
			hj.HcmJobTitle AS WOServiceLocation,
			ISNULL(hj.HcmJobAddress1,'') AS WOSLAddress1,
			ISNULL(hj.HcmJobAddress2,'') AS WOSLAddress2,
			ISNULL(hj.HcmJobCity,'') AS WOSLCity,
			CASE
				WHEN hj.AppStateType = 0
				THEN ''
				ELSE st.AppStatBrief
			END AS WOSLState,
            hj.AppStateType AS WOSLStateType,
			hj.HcmJobPostalCode AS WOSLZip,
			hcj.HcmHouseCode AS WOServiceID
		FROM
			TeamFinv2.dbo.HcmJobs hj WITH (NOLOCK) LEFT OUTER JOIN Esmv2.dbo.AppStateTypes st WITH (NOLOCK) ON
			hj.AppStateType = st.AppStateType INNER JOIN TeamFinv2.dbo.HcmHouseCodeJobs hcj WITH (NOLOCK) ON
			hj.HcmJob = hcj.HcmJob
		WHERE
			hj.HcmJobType = 3

		UNION ALL

		SELECT
            NULL AS WOBrief,
			au.AppUniTitle AS WOServiceLocation,
			s.AppSitAddressLine1 AS WOSLAddress1,
			s.AppSitAddressLine2 AS WOSLAddress2,
			s.AppSitCity AS WOSLCity,
			st.AppStatBrief AS WOSLState,
            s.AppStateType  AS WOSLStateType,
			s.AppSitPostalCode AS WOSLZip,
			hc.HcmHouseCode AS WOServiceID
		FROM
			Esmv2.dbo.AppUnits au WITH (NOLOCK) INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
			au.AppUnit = hc.AppUnit INNER JOIN Esmv2.dbo.AppSiteUnits asu WITH (NOLOCK) ON
			au.AppUnit = asu.AppUnit INNER JOIN Esmv2.dbo.AppSites s WITH (NOLOCK) ON 
			asu.AppSite = s.AppSite INNER JOIN Esmv2.dbo.AppStateTypes st WITH (NOLOCK) ON
			s.AppStateType = st.AppStateType 
			
	) woc ON
	wo.WomwoCustomer = woc.WOServiceLocation AND
	wo.HcmHouseCode = woc.WOServiceID) wom ON
wom.WONumberID = wwo.WomWorkOrder

---- RevInvoiceItems work order item
Update ri
SET ri.WomWorkOrderItem = wwoi.WomWorkOrderItem
from dbo.RevInvoiceItems ri
INNER JOIN
(select
    a11.RevInvoice as RevInvoice,
	a12.RevInvInvoiceNumber,
    wo.WomwoWorkOrderNumber,
    wo.WomWorkOrder,
    woi.WomWorkOrderItem,
    a11.RevInviDescription as RevInviDescription
from	RevInvoiceItems	a11
	inner join	RevInvoices	a12 WITH (NOLOCK) ON
	            a11.RevInvoice = a12.RevInvoice
INNER JOIN TeamFinv2.dbo.WomWorkOrders wo WITH (NOLOCK) ON
    a12.WomWorkOrder = wo.WomWorkOrder
OUTER APPLY GetWorkOrderItemTemp(wo.WomWorkOrder,a11.RevInviDescription) woi
where isnull(a12.WomWorkOrder, 0) <> 0 
Group by 
    a11.RevInvoice,
	a12.RevInvInvoiceNumber,
    wo.WomwoWorkOrderNumber,
    woi.WomWorkOrderItem,
    wo.WomwoWorkOrderNumber,
    wo.WomWorkOrder,
    a11.RevInviDescription) wwoi ON
wwoi.RevInvoice = ri.RevInvoice and
wwoi.RevInviDescription = ri.RevInviDescription

-- Drop the temporary functions GetServiceLocationTemp and GetWorkOrderItemTemp

/*
CT updated on 13th March 2013 11PM EST
*/

USE [TeamFinv2]
GO
/****** Object:  Index [Idx_Unique_RptLaborBudgets]    Script Date: 03/14/2013 08:42:56 ******/
CREATE NONCLUSTERED INDEX [Idx_Unique_RptLaborBudgets] ON [dbo].[RptLaborBudgets] 
(
      [RptLabbHouseCode] ASC,
      [RptLabbBudgetHours] ASC,
      [RptLabbBudgetDollars] ASC,
      [RptLabbAvgBudgetWageRate] ASC,
      [FscYear] ASC,
      [HcmHouseCode] ASC,
      [HirNode] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]


Update the following js files manually

1.	fin\bud\res\scripts\all-2.04.009.min.js
2.	fin\bud\mop\usr\fin.bud.mop-2.04.009.min.js

Update the following DLL files manually

1.	crothall.chimes.fin.bud.act.dll
2.	crothall.chimes.fin.bud.dom.dll
3.  crothall.chimes.fin.bud.srv.dll

Update the following stored procedures manually (Not Required)

1. BudUpdateDetailsHourlypayroll2
2. BudDetailsUpdateHourlyPayroll2 

/*
Last production release version 2.04.009 on 27th March 2013 11PM EST
*/
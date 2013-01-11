/*
Last production release version 2.04.008 on 14th November 2012 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.009', M_ENV_ENV_Database_Version = '2.04.009' 
Where M_ENV_ENVIRONMENT = 3

/*
ALTER TABLE [TeamFinV2].[dbo].[HcmJobs] ADD RevInvoiceTemplate Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceItems] ADD RevInviDisplayOrder Int NULL
ALTER TABLE [TeamFinV2].[dbo].[RevInvoiceItems] ADD WomWorkOrderItem Int NULL

ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcFilter Bit NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcDependantColumns VarChar(256) NULL
ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcWidth Int NULL
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

Insert Into dbo.RevInvoiceTemplates (RevInvtBrief, RevInvtTitle, RevInvtDescription, RevInvtActive, RevInvtDisplayOrder, RevInvtModBy, RevInvtModAt)
Values ('Standard', 'Standard', 'Standard', 1, 1, 'Compass-USA\Data Conversion', GetDate())

/* 
--Not required to execute the following script, this is a test script for R & D
Insert Into dbo.AppModules (AppModTitle, AppModDescription, AppModDisplayOrder, AppModActive, AppModModBy, AppModModAt, AppModAssociateModule)
Values ('State', 'AppStateTypes', 1, 1, 'compass-usa\data conversion', GetDate(), 1)

Insert Into dbo.AppModuleAssociations (AppModule, AppModuleAssociate, AppModaActive, AppModaModBy, AppModaModAt)
Values (1, 9, 1, 'compass-usa\data conversion', GetDate())

Insert Into dbo.AppModuleColumns (AppModule, AppModcTitle, AppModcDescription, AppModcDisplayOrder, AppModcActive
, AppModcModBy, AppModcModAt, AppModcType, AppModcIsNullable, AppModcValidation, AppModcAdHocActive, AppModuleAssociate, AppModcReferenceTableName)
Values (9, 'AppStatMinimumWage', 'Minimum Wage', 1, 1, 'compass-usa\data conversion', GetDate()
, 'Varchar', 1, Null, 1, 1, Null)
*/

Add the following key in hcm-->app->act web.config file

<add key="FinRevPath" value="/net/crothall/chimes/fin/rev/act/provider.aspx?moduleId=rev" />

-- To update Employee module in adhreport
Update AppModules Set AppModAssociateModule = 0 Where AppModule = 2 And AppModTitle = 'Employee'

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
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 2 And AppModcTitle = 'AppTransactionStatusType'
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

-- To update Person module in adhreport
Update AppModules Set AppModAssociateModule = 0 Where AppModule = 5 And AppModTitle = 'Person'

-- To set validations for Person module in adhreport
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoFirstName'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoLastName'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoMiddleName'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine1'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine2'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoCity'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'AppStateType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoPostalCode'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoHomePhone'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoFax'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoCellPhone'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoEmail'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 5 And AppModcTitle = 'PplPeoPager'

-- To update User module in adhreport
Update AppModules Set AppModAssociateModule = 0 Where AppModule = 6 And AppModTitle = 'User'

-- To set validations for User module in adhreport
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 6 And AppModcTitle = 'HirNodeTop'
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 6 And AppModcTitle = 'HirNodeCurrent'
Update AppModuleColumns Set AppModcAdHocActive = 1 Where AppModule = 6 And AppModcTitle = 'AppUseActive'
Update AppModuleColumns Set AppModcAdHocActive = 0 Where AppModule = 6 And AppModcTitle = 'AppUsePassword'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 6 And AppModcTitle = 'AppUsePassword'
Update AppModuleColumns Set AppModcFilter = 0 Where AppModule = 6 And AppModcTitle = 'AppRoleCurrent'

-- To update Unit module in adhreport
Update AppModules Set AppModAssociateModule = 0 Where AppModule = 8 And AppModTitle = 'Unit'

-- To set validations for Unit module in adhreport
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 8
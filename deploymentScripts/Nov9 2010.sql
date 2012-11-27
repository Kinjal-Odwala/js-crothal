Add the following key in pay-->act-->web.config file.
<add key="FinWomPath" value="/net/crothall/chimes/fin/wom/act/provider.aspx?moduleId=wom" />

Change the WorkOrderApprovalPath key value in wom-->act-->web.config file.
<add key="WorkOrderApprovalPath" value="http://crothall2.persistech.com/net/crothall/chimes/fin/wom/act/ApproveWorkOrder.aspx" />

Add the following key in wom-->act-->web.config file.
<add key="ConnectionString" value="Data Source=tst-sql2005-az1.persistech.com;Initial Catalog=TeamFinv2;User ID=esmv2;Password=esmv2Persistech1212" />

Give the Anonymous access to ApproveWorkOrder.aspx file in wom--act folder

-- Nov16
Update following to update logg4Net configuration.
	D:\Build\net\ii\framework\esm\app\act\web.config 
	D:\Build\net\ii\framework\esm\hir\act\web.config 
	D:\Build\net\ii\framework\esm\ppl\act\web.config 

-- Menu item System variables
Declare @HirNode As Int

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodModBy, HirNodModAt)
Values(1, 33, @HirNode, 'Sys Variable', 'System Variable', 'System Variable', 73, 1, '\crothall\chimes\fin\Setup\System Variable', 'crothall', 'chimes', 'fin', 'Setup', 'System Variable', 'compass-usa\Data Conversion', GetDate())

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\System Variable'

Insert Into ESMV2.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt, AppMenuDisplayType)
Values(2, 4, @HirNode, 'Sys Variable', 'System Variable Setup', 1, 806, 'sysv', '/fin/app/systemVariable/usr/markup.htm', 'Persistech\Data Conversion', GetDate(), 1)

-- Update AppSystemVariables Table

update AppSystemVariables set AppSysVariableName = 'EmployeeNumberCrothallMin' where AppSystemVariable = 7
update AppSystemVariables set AppSysVariableName = 'EmployeeNumberCrothallMax' where AppSystemVariable = 8
update AppSystemVariables set AppSysVariableName = 'EmployeeNumberNonCrothallMin' where AppSystemVariable = 9
update AppSystemVariables set AppSysVariableName = 'EmployeeNumberNonCrothallMax' where AppSystemVariable = 10

-- Nov 19
Update all web.config in fin application for log4Net configuration.

Add the record into AppSystemVariables table with following data
	Variable Name : PayrollExtendedHours
	Variable Value : 37

ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoSubcontracted Bit NULL
ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoCommissionable Bit NULL
ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoNotes Varchar(1024) NULL
ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoCompletedDate DateTime NULL
ALTER TABLE [dbo].[WomWorkOrders] ADD WomwoClosedDate DateTime NULL
ALTER TABLE [dbo].[RevInvoices] ADD WomWorkOrder Int NULL

-------------Indees Teamfinv2 EsmV2------------------------------------
-----------------------------------TeamFinV2-----------------------------
--PayPayrollCompanies 

Create NonClustered Index PayPayrollCompanies_PayPayFrequencyType 
On PayPayrollCompanies
(
      PayPayFrequencyType
)

use teamfinv2
--HcmHouseCodePayrollCompanies

Create NonClustered Index HcmHouseCodePayrollCompanies_HcmHouseCode_PayPayrollCompany
On HcmHouseCodePayrollCompanies
(
      HcmHouseCode, PayPayrollCompany
)

--HcmHouseCodeJobs

Create NonClustered Index HcmHouseCodeJobs_HcmHouseCode_HcmJob 
On HcmHouseCodeJobs
(
      HcmHouseCode, HcmJob

)

--EmpLocalTaxAdjustmentStates

Create NonClustered Index EmpLocalTaxAdjustmentStates_EmpLocalTaxAdjustmentType_AppStateType 
On EmpLocalTaxAdjustmentStates
(
      EmpLocalTaxAdjustmentType, AppStateType 
)

--EmpLocalTaxCodePayrollCompanyStates

Create NonClustered Index EmpLocalTaxCodePayrollCompanyStates_PayrollCompany_AppStateType
On EmpLocalTaxCodePayrollCompanyStates
(
      PayPayrollCompany, AppStateType
)

--EmpMaritalStatusStateTaxStates

Create NonClustered Index EmpMaritalStatusStateTaxStates_EmpMaritalStatusStateTax_AppStateType
On EmpMaritalStatusStateTaxStates
(
      EmpMaritalStatusStateTaxType, AppStateType
)

--EmpStateAdjustmentStates

Create NonClustered Index EmpStateAdjustmentStates_EmpStateAdjustment_AppStateType
On EmpStateAdjustmentStates
(
      EmpStateAdjustmentType, AppStateType
)

--HcmHouseCodeServices

Create NonClustered Index HcmHouseCodeServices_HcmHouseCodeHcmServiceType
On HcmHouseCodeServices
(
      HcmHouseCode, HcmServiceType
)

--PayEmployeeWeeklyPayrolls

Create NonClustered Index PayEmployeeWeeklyPayrolls_HcmHouseCodeEmpEmployeeFscYearFscPeriod
On PayEmployeeWeeklyPayrolls
(
      HcmHouseCode, EmpEmployee, FscYear, FscPeriod
)

--PayPayCodeAccounts

Create NonClustered Index PayPayCodeAccounts_PayPayCodeFscAccount
On PayPayCodeAccounts
(
      PayPayCode, FscAccount
)

--PurCatalogHouseCodes

Create NonClustered Index PurCatalogHouseCodes_HcmHouseCodePurCatalog
On PurCatalogHouseCodes
(
      HcmHouseCode, PurCatalog
)

--PurCatalogItems

Create NonClustered Index PurCatalogItems_PurCatalogPurItem
On PurCatalogItems
(
      PurCatalog, PurItem
)

--PurPurchaseOrderDetails

Create NonClustered Index PurPurchaseOrderDetails_PurPurchaseOrderPurCatalogItem
On PurPurchaseOrderDetails
(
      PurPurchaseOrder, PurCatalogItem
)


---------------------------------ESMV2-----------------------
use esmv2
-- PplPersonRoles
Create NonClustered Index PplPersonRoles_PplPersonPplRole
On PplPersonRoles
( PplPerson, PplRole )

-- PplPerformerSkills
Create NonClustered Index PplPerformerSkills_PplPerformerPplSkill
On PplPerformerSkills
( PplPerformer, PplSkill )

-- PplPerformers
Create NonClustered Index PplPerformers_PplPersonAppFunctionalArea
On PplPerformers
( PplPerson, AppFunctionalArea )

-- PplPeople
Create NonClustered Index PplPeople_PplPersonHirNode
On PplPeople
( PplPerson, HirNode )

-- HirLevels
Create NonClustered Index HirLevels_LevelParent
On HirLevels
( HirLevel, HirLevelParent )

-- HirGroupNodes
Create NonClustered Index HirGroupNodes_HirNodeHirGroup
On HirGroupNodes
( HirNode, HirGroup )

-- AppZipCodeTypes
Create NonClustered Index AppZipCodeAppState
On AppZipCodeTypes
( AppZipctZipCode, AppStateType )

-- AppUnits
Create NonClustered Index AppUnitHirNode
On AppUnits
( AppUnit, HirNode )

-- AppSiteUnits
Create NonClustered Index AppSiteAppUnit
On AppSiteUnits
( AppSite, AppUnit )

-- AppRoleGroups
Create NonClustered Index AppRoleHirGroup
On AppRoleGroups
( AppRole, HirGroup )

-- AppMenuItems
Create NonClustered Index HirNodeAppMenuActionAppMenuState
On AppMenuItems
( HirNode, AppMenuAction, AppMenuState )


index
------------
use teamfinv2
Create NonClustered Index IndexHouseCodeEmpEmpolyeeFscYearFscPeriodWeek on 
PayEmployeeWeeklyPayrolls(HcmHouseCode, EmpEmployee, FscYear, FscPeriod, PayEmpwpWeek)

Create NonClustered Index IndexHouseCodeEmpEmployeePplPerson ON
EmpEmployeeGenerals(HcmHouseCode, EmpEmployeeGeneral,PplPerson)

-------------Create Clustered Index---------------------------


Create Clustered Index PK_EmpMaritalStatusTypes
On [EmpMaritalStatusTypes]
(
	[EmpMaritalStatusType] ASC
)

ALTER TABLE [dbo].[EmpMaritalStatusTypes] drop [PK__EmpMaritalStatus__5F7E2DAC] 

-------------Indees Teamfinv2 EsmV2------------------------------------

-- December, 02
Add the following key in pur-->act-->web.config file.
<add key="ReportFilePath" value="D:\Build\Reports\temp\" />

----------------------------------------------------------------------
25-08-2011

USE [Esmv2]
GO
--AppUnits
CREATE NONCLUSTERED INDEX [AppUnitHirNode] ON [dbo].[AppUnits] 
(
	[AppUnit] ASC,
	[HirNode] ASC
)

-- HirNodes
Create NONCLUSTERED INDEX HirNodes_HirNode_FullPath ON [dbo].[HirNodes] 
(
	HirNode
	, HirNodFullPath 	
)
Use Teamfinv2

--FscPeriods
Create NonClustered Index FscPeriods_FscPeriod_FscYear On FscPeriods
(FscPeriod Asc, FscYear Asc)

Create NonClustered Index FscPeriods_FscYear_FscPerTitle On FscPeriods
(FscYear Asc, FscPerTitle Asc)

---RevInvoices
Create NonClustered Index RevInvoices_RevInvoice_HcmHouseCode On RevInvoices
( RevInvoice Asc, HcmHouseCode)

-- WomWorkOrders

CREATE NONCLUSTERED INDEX [WomWorkOrders_WomWorkOrder_HcmHouseCode] ON [dbo].[WomWorkOrders] 
(
	[WomWorkOrder] ASC,
	[HcmHouseCode] 
)

---HcmHouseCodes
CREATE NONCLUSTERED INDEX [HcmHouseCodes_HcmHouseCode_AppUnit] ON [dbo].[HcmHouseCodes] 
(
	[HcmHouseCode] ASC,
	[AppUnit] ASC
)
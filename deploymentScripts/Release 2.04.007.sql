/*
Last production release version 2.04.006 Date - 21st June 2012
*/
Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.007', M_ENV_ENV_Database_Version = '2.04.007'
Where M_ENV_ENVIRONMENT = 2

--Update HouseCodeWizard Security Nodes. 'UI Security HirNodes - HousecodeWizard.sql' under TFS Deployment scripts

--Alter Table AppModules Add AppModAssociateModule Bit Not Null Default 0

Update AppModules Set AppModAssociateModule = 1
Update AppModules Set AppModAssociateModule = 0 Where AppModule In (1, 4) -- HcmHouseCodes, AppSites

--  State Additional Information changes [Begin]

Insert Into AppStateAdditionalInformationTypes
	Values('GAC', 'Geographic Area Code', 'Geographic Area Code', 'Number', '2', 0, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('OC', 'Occupational Code', 'Occupational Code', 'Number', '8', 1, 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('DisabilityInsura', 'Disability Insurance', 'Disability Insurance', 'Text', '1', 0, 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('SeasonalCode', 'Seasonal Code', 'None|No|Yes', 'Radio', 'NE|N|Y', 0, 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('CorporateOfficer', 'Corporate Officer', 'No|Yes', 'Radio', 'N|Y', 0, 5, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('ExceptionDisabIn', 'Exception to company default for private disability Insurance', 'No|Yes', 'Radio', 'N|Y', 0, 6, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('HealthInsurCover', 'Health Insurance Coverage', '0-None|1-No Coverage Available|2-Emp Declined Coverage|3-Emp Only Covered|4-Emp and Dep Covered', 'List', '', 0, 7, 1,' Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('ResidentiPSDCode', 'Residential PSD Code', 'Residential PSD Code', 'Number', '8', 0, 8, 1,'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformationTypes
	Values('WorksitePSDCode', 'Worksite PSD Code', 'Worksite PSD Code', 'Number', '8', 0, 9, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into AppStateAdditionalInformations Values(1, 1, 1, 1, 'Compass-USA\Data Conversion', GetDate()) 
Insert Into AppStateAdditionalInformations Values(1, 2, 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(12, 3, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(22, 4 ,1, 1,'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(24, 5, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(32, 6, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(38, 7, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(48, 5, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(39, 8, 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into AppStateAdditionalInformations Values(39, 9, 2, 1, 'Compass-USA\Data Conversion', GetDate())

--  State Additional Information changes [End]

-- Ceridian Reports --> Payroll Register Menu Insert [Begin] 
-- ************ Updated Production on 16th July 2012 ************
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Select @DisplayOrderMenu = Max(AppMeniDisplayOrder) + 1 From EsmV2.dbo.AppMenuItems Where AppMeniActionData Like '/fin/rpt/ceridianReport/usr%'
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\CeridianReports'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'Payroll Register' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/rpt/ceridianReport/usr/markup.htm?reportId=Payroll Register&reportURL=https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fSkunkWorks%2fTeamFin_Payroll%2fCeridian_Payroll_Register&rs:Command=Render'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like'\crothall\chimes\fin\CeridianReports\%'
-- Ceridian Reports --> Payroll Register Menu Insert [End]

--  Ad-Hoc Report changes [Begin]
--ALTER TABLE [TeamFinV2].[dbo].[AppModuleColumns] ADD AppModcReferenceTableName Varchar(64) NULL
Update AppModuleColumns Set AppModcReferenceTableName = 'AppStateTypes' Where AppModule = 1 And AppModcTitle = 'HcmHoucShippingState'
Update AppModuleColumns Set AppModcReferenceTableName = 'AppStateTypes' Where AppModule = 1 And AppModcTitle = 'HcmHoucBankState'
Update AppModuleColumns Set AppModcReferenceTableName = 'HcmServiceLines' Where AppModule = 1 And AppModcTitle = 'HcmServiceLineFinancialEntity'

Update AppModuleColumns Set AppModcReferenceTableName = 'EmpStatusTypes' Where AppModule = 2 And AppModcTitle = 'EmpStatusType'
Update AppModuleColumns Set AppModcReferenceTableName = 'PayPayrollCompanies' Where AppModule = 2 And AppModcTitle = 'PayPayrollCompany'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpDeviceGroupTypes' Where AppModule = 2 And AppModcTitle = 'EmpDeviceGroupType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpJobCodeTypes' Where AppModule = 2 And AppModcTitle = 'EmpJobCodeType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpRateChangeReasonTypes' Where AppModule = 2 And AppModcTitle = 'EmpRateChangeReasonType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpTerminationReasonTypes' Where AppModule = 2 And AppModcTitle = 'EmpTerminationReasonType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpWorkShifts' Where AppModule = 2 And AppModcTitle = 'EmpWorkShift'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpUnionTypes' Where AppModule = 2 And AppModcTitle = 'EmpUnionType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpStatusCategoryTypes' Where AppModule = 2 And AppModcTitle = 'EmpStatusCategoryType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpGenderTypes' Where AppModule = 2 And AppModcTitle = 'EmpGenderType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpEthnicityTypes' Where AppModule = 2 And AppModcTitle = 'EmpEthnicityType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpFederalAdjustmentTypes' Where AppModule = 2 And AppModcTitle = 'EmpFederalAdjustmentType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpMaritalStatusFederalTaxTypes' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusFederalTaxType'
Update AppModuleColumns Set AppModcReferenceTableName = 'AppStateTypes' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrimaryState'
Update AppModuleColumns Set AppModcReferenceTableName = 'AppStateTypes' Where AppModule = 2 And AppModcTitle = 'EmpEmpgSecondaryState'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpMaritalStatusStateTaxTypes' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypePrimary'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpMaritalStatusStateTaxTypes' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypeSecondary'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpStateAdjustmentTypes' Where AppModule = 2 And AppModcTitle = 'EmpStateAdjustmentType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpSDIAdjustmentTypes' Where AppModule = 2 And AppModcTitle = 'EmpSDIAdjustmentType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpLocalTaxAdjustmentTypes' Where AppModule = 2 And AppModcTitle = 'EmpLocalTaxAdjustmentType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpLocalTaxCodePayrollCompanyStates' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode1'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpLocalTaxCodePayrollCompanyStates' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode2'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpLocalTaxCodePayrollCompanyStates' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode3'
Update AppModuleColumns Set AppModcReferenceTableName = 'AppTransactionStatusTypes' Where AppModule = 2 And AppModcTitle = 'AppTransactionStatusType'
Update AppModuleColumns Set AppModcReferenceTableName = 'PayPayFrequencyTypes' Where AppModule = 2 And AppModcTitle = 'PayPayFrequencyType'
Update AppModuleColumns Set AppModcReferenceTableName = 'HcmHouseCodeJobs' Where AppModule = 2 And AppModcTitle = 'HcmHouseCodeJob'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpI9Types' Where AppModule = 2 And AppModcTitle = 'EmpI9Type'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpVetTypes' Where AppModule = 2 And AppModcTitle = 'EmpVetType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpSeparationCodes' Where AppModule = 2 And AppModcTitle = 'EmpSeparationCode'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpJobStartReasonTypes' Where AppModule = 2 And AppModcTitle = 'EmpJobStartReasonType'
Update AppModuleColumns Set AppModcReferenceTableName = 'EmpMaritalStatusTypes' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusType'

Update AppModuleColumns Set AppModcReferenceTableName = 'FscPeriods' Where AppModule = 3 And AppModcTitle = 'FscPeriod'
Update AppModuleColumns Set AppModcReferenceTableName = 'FscYears' Where AppModule = 3 And AppModcTitle = 'FscYear'
Update AppModuleColumns Set AppModcReferenceTableName = 'AppTransactionStatusTypes' Where AppModule = 3 And AppModcTitle = 'AppTransactionStatusType'

Update AppModuleColumns Set AppModcReferenceTableName = 'AppRoles' Where AppModule = 6 And AppModcTitle = 'AppRoleCurrent'

Update AppModuleColumns Set AppModcIsNullable = 1 Where AppModule = 1
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 1 And AppModcTitle = 'AppUnit'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 1 And AppModcTitle = 'FscJDECompany'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 1 And AppModcTitle = 'HcmHoucStartDate'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 1 And AppModcTitle = 'HcmServiceType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 1 And AppModcTitle = 'HcmRemitToLocation'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 1 And AppModcTitle = 'HcmContractType'
Update AppModuleColumns Set AppModcDescription = 'Contract Type' Where AppModule = 1 And AppModcTitle = 'HcmContractType'
Update AppModuleColumns Set AppModcDescription = 'Terms Of Contract' Where AppModule = 1 And AppModcTitle = 'HcmTermsOfContractType'

Update AppModuleColumns Set AppModcDescription = 'Address 1' Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine1'
Update AppModuleColumns Set AppModcDescription = 'Address 2' Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine2'
Update AppModuleColumns Set AppModcDescription = 'State' Where AppModule = 4 And AppModcTitle = 'AppStateType'
Update AppModuleColumns Set AppModcDescription = 'Postal Code' Where AppModule = 4 And AppModcTitle = 'AppSitPostalCode'
Update AppModuleColumns Set AppModcDescription = 'County' Where AppModule = 4 And AppModcTitle = 'AppSitCounty'
Update AppModuleColumns Set AppModcDescription = 'Industry Type' Where AppModule = 4 And AppModcTitle = 'AppIndustryType'
Update AppModuleColumns Set AppModcDescription = 'Primary Business' Where AppModule = 4 And AppModcTitle = 'AppPrimaryBusinessType'
Update AppModuleColumns Set AppModcDescription = 'Location Type' Where AppModule = 4 And AppModcTitle = 'AppLocationType'
Update AppModuleColumns Set AppModcDescription = 'Trauma Level' Where AppModule = 4 And AppModcTitle = 'AppTraumaLevelType'
Update AppModuleColumns Set AppModcDescription = 'Profit Designation' Where AppModule = 4 And AppModcTitle = 'AppProfitDesignationType'
Update AppModuleColumns Set AppModcDescription = 'GPO' Where AppModule = 4 And AppModcTitle = 'AppGPOType'
Update AppModuleColumns Set AppModcDescription = 'Ownership' Where AppModule = 4 And AppModcTitle = 'AppOwnershipType'

Update AppModuleColumns Set AppModcDescription = 'Device Group' Where AppModule = 2 And AppModcTitle = 'EmpDeviceGroupType'
Update AppModuleColumns Set AppModcDescription = 'Job Code' Where AppModule = 2 And AppModcTitle = 'EmpJobCodeType'
Update AppModuleColumns Set AppModcDescription = 'Rate Change Reason' Where AppModule = 2 And AppModcTitle = 'EmpRateChangeReasonType'
Update AppModuleColumns Set AppModcDescription = 'Termination Reason' Where AppModule = 2 And AppModcTitle = 'EmpTerminationReasonType'
Update AppModuleColumns Set AppModcDescription = 'Employee Number' Where AppModule = 2 And AppModcTitle = 'EmpEmpgEmployeeNumber'
Update AppModuleColumns Set AppModcDescription = 'Alternate Pay Rate A' Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateA'
Update AppModuleColumns Set AppModcDescription = 'Alternate Pay Rate B' Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateB'
Update AppModuleColumns Set AppModcDescription = 'Alternate Pay Rate C' Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateC'
Update AppModuleColumns Set AppModcDescription = 'Alternate Pay Rate D' Where AppModule = 2 And AppModcTitle = 'EmpEmpgAlternatePayRateD'
Update AppModuleColumns Set AppModcDescription = 'PTO Start Date' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPTOStartDate'
Update AppModuleColumns Set AppModcDescription = 'PTO Accrued Hour Entry Automatic' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPTOAccruedHourEntryAutomatic'
Update AppModuleColumns Set AppModcDescription = 'Original Hire Date' Where AppModule = 2 And AppModcTitle = 'EmpEmpgOriginalHireDate'
Update AppModuleColumns Set AppModcDescription = 'Union Type' Where AppModule = 2 And AppModcTitle = 'EmpUnionType'
Update AppModuleColumns Set AppModcDescription = 'Status Category' Where AppModule = 2 And AppModcTitle = 'EmpStatusCategoryType'
Update AppModuleColumns Set AppModcDescription = 'Pay Rate Entered By' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRateEnteredBy'
Update AppModuleColumns Set AppModcDescription = 'Pay Rate Entered At' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPayRateEnteredAt'
Update AppModuleColumns Set AppModcDescription = 'Prev Pay Rate' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRate'
Update AppModuleColumns Set AppModcDescription = 'Prev Pay Rate Entered By' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRateEnteredBy'
Update AppModuleColumns Set AppModcDescription = 'Prev Pay Rate Entered At' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPayRateEnteredAt'
Update AppModuleColumns Set AppModcDescription = 'Prev Prev Pay Rate' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRate'
Update AppModuleColumns Set AppModcDescription = 'Prev Prev Pay Rate Entered By' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRateEnteredBy'
Update AppModuleColumns Set AppModcDescription = 'Prev Prev Pay Rate Entered At' Where AppModule = 2 And AppModcTitle = 'EmpEmpgPrevPrevPayRateEnteredAt'
Update AppModuleColumns Set AppModcDescription = 'Gender' Where AppModule = 2 And AppModcTitle = 'EmpGenderType'
Update AppModuleColumns Set AppModcDescription = 'Ethnicity' Where AppModule = 2 And AppModcTitle = 'EmpEthnicityType'
Update AppModuleColumns Set AppModcDescription = 'Work Phone Ext' Where AppModule = 2 And AppModcTitle = 'EmpEmpgWorkPhoneExt'
Update AppModuleColumns Set AppModcDescription = 'Background Check Date' Where AppModule = 2 And AppModcTitle = 'EmpEmpgBackGroundCheckDate'
Update AppModuleColumns Set AppModcDescription = 'Federal Exemptions' Where AppModule = 2 And AppModcTitle = 'EmpEmpgFederalExemptions'
Update AppModuleColumns Set AppModcDescription = 'Federal Adjustment' Where AppModule = 2 And AppModcTitle = 'EmpFederalAdjustmentType'
Update AppModuleColumns Set AppModcDescription = 'Marital Status Federal Tax' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusFederalTaxType'
Update AppModuleColumns Set AppModcDescription = 'Federal Adjustment Amount' Where AppModule = 2 And AppModcTitle = 'EmpEmpgFederalAdjustmentAmount'
Update AppModuleColumns Set AppModcDescription = 'Primary Marital Status State Tax' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypePrimary'
Update AppModuleColumns Set AppModcDescription = 'Secondary Marital Status State Tax' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusStateTaxTypeSecondary'
Update AppModuleColumns Set AppModcDescription = 'State Exemptions' Where AppModule = 2 And AppModcTitle = 'EmpEmpgStateExemptions'
Update AppModuleColumns Set AppModcDescription = 'State Adjustment' Where AppModule = 2 And AppModcTitle = 'EmpStateAdjustmentType'
Update AppModuleColumns Set AppModcDescription = 'State Adjustment Amount' Where AppModule = 2 And AppModcTitle = 'EmpEmpgStateAdjustmentAmount'
Update AppModuleColumns Set AppModcDescription = 'SDI Adjustment' Where AppModule = 2 And AppModcTitle = 'EmpSDIAdjustmentType'
Update AppModuleColumns Set AppModcDescription = 'SDI Rate' Where AppModule = 2 And AppModcTitle = 'EmpEmpgSDIRate'
Update AppModuleColumns Set AppModcDescription = 'Local Tax Adjustment' Where AppModule = 2 And AppModcTitle = 'EmpLocalTaxAdjustmentType'
Update AppModuleColumns Set AppModcDescription = 'Loca lTax Adjustment Amount' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxAdjustmentAmount'
Update AppModuleColumns Set AppModcDescription = 'Local Tax Code 1' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode1'
Update AppModuleColumns Set AppModcDescription = 'Local Tax Code 2' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode2'
Update AppModuleColumns Set AppModcDescription = 'Local Tax Code 3' Where AppModule = 2 And AppModcTitle = 'EmpEmpgLocalTaxCode3'
Update AppModuleColumns Set AppModcDescription = 'Transaction Status' Where AppModule = 2 And AppModcTitle = 'AppTransactionStatusType'
Update AppModuleColumns Set AppModcDescription = 'Pay Frequency' Where AppModule = 2 And AppModcTitle = 'PayPayFrequencyType'
Update AppModuleColumns Set AppModcDescription = 'Job' Where AppModule = 2 And AppModcTitle = 'HcmHouseCodeJob'
Update AppModuleColumns Set AppModcDescription = 'I9 Type' Where AppModule = 2 And AppModcTitle = 'EmpI9Type'
Update AppModuleColumns Set AppModcDescription = 'Vet Type' Where AppModule = 2 And AppModcTitle = 'EmpVetType'
Update AppModuleColumns Set AppModcDescription = 'Separation Code' Where AppModule = 2 And AppModcTitle = 'EmpSeparationCode'
Update AppModuleColumns Set AppModcDescription = 'Job Start Reason' Where AppModule = 2 And AppModcTitle = 'EmpJobStartReasonType'
Update AppModuleColumns Set AppModcDescription = 'Effective Date Compensation' Where AppModule = 2 And AppModcTitle = 'EmpEmpgEffectiveDateCompensation'
Update AppModuleColumns Set AppModcDescription = 'Marital Status' Where AppModule = 2 And AppModcTitle = 'EmpMaritalStatusType'

Update AppModuleColumns Set AppModcDescription = 'Bill To' Where AppModule = 3 And AppModcTitle = 'RevInvBillTo'
Update AppModuleColumns Set AppModcDescription = 'State' Where AppModule = 3 And AppModcTitle = 'AppStateType'
Update AppModuleColumns Set AppModcDescription = 'Postal Code' Where AppModule = 3 And AppModcTitle = 'RevInvPostalCode'
Update AppModuleColumns Set AppModcDescription = 'Printed By' Where AppModule = 3 And AppModcTitle = 'RevInvPrintedBy'
Update AppModuleColumns Set AppModcDescription = 'Fiscal Period' Where AppModule = 3 And AppModcTitle = 'FscPeriod'
Update AppModuleColumns Set AppModcDescription = 'Fiscal Year' Where AppModule = 3 And AppModcTitle = 'FscYear'
Update AppModuleColumns Set AppModcDescription = 'Paid Off' Where AppModule = 3 And AppModcTitle = 'RevInvPaidOff'
Update AppModuleColumns Set AppModcDescription = 'Transaction Status' Where AppModule = 3 And AppModcTitle = 'AppTransactionStatusType'
Update AppModuleColumns Set AppModcDescription = 'PO Number' Where AppModule = 3 And AppModcTitle = 'RevInvPONumber'
Update AppModuleColumns Set AppModcDescription = 'Work Order' Where AppModule = 3 And AppModcTitle = 'WomWorkOrder'
Update AppModuleColumns Set AppModcDescription = 'Exported Date' Where AppModule = 3 And AppModcTitle = 'RevInvExportedDate'
Update AppModuleColumns Set AppModcDescription = 'Job Brief' Where AppModule = 3 And AppModcTitle = 'HcmJobBrief'
Update AppModuleColumns Set AppModcDescription = 'Invoice By House Code' Where AppModule = 3 And AppModcTitle = 'RevInvInvoiceByHouseCode'

Update AppModuleColumns Set AppModcDescription = 'Address 1' Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine1'
Update AppModuleColumns Set AppModcDescription = 'Address 2' Where AppModule = 5 And AppModcTitle = 'PplPeoAddressLine2'
Update AppModuleColumns Set AppModcDescription = 'State' Where AppModule = 5 And AppModcTitle = 'AppStateType'
Update AppModuleColumns Set AppModcDescription = 'Employee House Code Updated' Where AppModule = 5 And AppModcTitle = 'PplPeoEmployeeHouseCodeUpdated'

Update AppModuleColumns Set AppModcDescription = 'Top HirNode' Where AppModule = 6 And AppModcTitle = 'HirNodeTop'
Update AppModuleColumns Set AppModcDescription = 'Current HirNode' Where AppModule = 6 And AppModcTitle = 'HirNodeCurrent'
Update AppModuleColumns Set AppModcDescription = 'User Name' Where AppModule = 6 And AppModcTitle = 'AppUseUserName'
Update AppModuleColumns Set AppModcDescription = 'Current Role' Where AppModule = 6 And AppModcTitle = 'AppRoleCurrent'

Update AppModuleColumns Set AppModcDescription = 'Hierarchy' Where AppModule = 7 And AppModcTitle = 'HirHierarchy'
Update AppModuleColumns Set AppModcDescription = 'Level' Where AppModule = 7 And AppModcTitle = 'HirLevel'
Update AppModuleColumns Set AppModcDescription = 'Display Order' Where AppModule = 7 And AppModcTitle = 'HirNodDisplayOrder'
Update AppModuleColumns Set AppModcDescription = 'Level 1' Where AppModule = 7 And AppModcTitle = 'HirNodLevel1'
Update AppModuleColumns Set AppModcDescription = 'Level 2' Where AppModule = 7 And AppModcTitle = 'HirNodLevel2'
Update AppModuleColumns Set AppModcDescription = 'Level 3' Where AppModule = 7 And AppModcTitle = 'HirNodLevel3'
Update AppModuleColumns Set AppModcDescription = 'Level 4' Where AppModule = 7 And AppModcTitle = 'HirNodLevel4'
Update AppModuleColumns Set AppModcDescription = 'Level 5' Where AppModule = 7 And AppModcTitle = 'HirNodLevel5'
Update AppModuleColumns Set AppModcDescription = 'Level 6' Where AppModule = 7 And AppModcTitle = 'HirNodLevel6'
Update AppModuleColumns Set AppModcDescription = 'Level 7' Where AppModule = 7 And AppModcTitle = 'HirNodLevel7'
Update AppModuleColumns Set AppModcDescription = 'Level 8' Where AppModule = 7 And AppModcTitle = 'HirNodLevel8'
Update AppModuleColumns Set AppModcDescription = 'Level 9' Where AppModule = 7 And AppModcTitle = 'HirNodLevel9'
Update AppModuleColumns Set AppModcDescription = 'Level 10' Where AppModule = 7 And AppModcTitle = 'HirNodLevel10'
Update AppModuleColumns Set AppModcDescription = 'Level 11' Where AppModule = 7 And AppModcTitle = 'HirNodLevel11'
Update AppModuleColumns Set AppModcDescription = 'Level 12' Where AppModule = 7 And AppModcTitle = 'HirNodLevel12'
Update AppModuleColumns Set AppModcDescription = 'Level 13' Where AppModule = 7 And AppModcTitle = 'HirNodLevel13'
Update AppModuleColumns Set AppModcDescription = 'Level 14' Where AppModule = 7 And AppModcTitle = 'HirNodLevel14'
Update AppModuleColumns Set AppModcDescription = 'Level 15' Where AppModule = 7 And AppModcTitle = 'HirNodLevel15'
Update AppModuleColumns Set AppModcDescription = 'Level 16' Where AppModule = 7 And AppModcTitle = 'HirNodLevel16'

Update AppModuleColumns Set AppModcDescription = 'Brief' Where AppModule = 8 And AppModcTitle = 'AppUniBrief'
Update AppModuleColumns Set AppModcDescription = 'Title' Where AppModule = 8 And AppModcTitle = 'AppUniTitle'
Update AppModuleColumns Set AppModcDescription = 'Description' Where AppModule = 8 And AppModcTitle = 'AppUniDescription'

Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppSitTitle'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppSitAddressLine1'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppSitCity'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppStateType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppSitPostalCode'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppIndustryType'
Update AppModuleColumns Set AppModcIsNullable = 0 Where AppModule = 4 And AppModcTitle = 'AppPrimaryBusinessType'

Update AppModuleColumns Set AppModcType = 'Int' Where AppModcType = 'int'
Update AppModuleColumns Set AppModcType = 'Bit' Where AppModcType = 'bit'
Update AppModuleColumns Set AppModcType = 'Varchar' Where AppModcType = 'varchar'
Update AppModuleColumns Set AppModcType = 'DateTime' Where AppModcType = 'datetime'
Update AppModuleColumns Set AppModcType = 'Decimal' Where AppModcType = 'decimal'

Update AppModuleColumns Set AppModcValidation = 'Int' Where AppModcValidation = 'int'
Update AppModuleColumns Set AppModcValidation = 'Decimal' Where AppModcValidation = 'decimal'
Update AppModuleColumns Set AppModcValidation = 'Bit' Where AppModcValidation = 'bit'
Update AppModuleColumns Set AppModcValidation = 'DateTime' Where AppModcValidation = 'datetime'
Update AppModuleColumns Set AppModcValidation = 'Phone' Where AppModcValidation = 'phone'
Update AppModuleColumns Set AppModcValidation = 'Zip' Where AppModcValidation = 'zip'
Update AppModuleColumns Set AppModcValidation = 'Email' Where AppModcValidation = 'email'

Update AppModuleColumns Set AppModcValidation = 'Int' Where AppModcType = 'Int'
Update AppModuleColumns Set AppModcType = 'Bit', AppModcValidation = 'Bit' Where AppModcTitle = 'HcmHoucEPaySite'
Update AppModuleColumns Set AppModcValidation = 'Phone' Where AppModule = 1 And AppModcTitle = 'HcmHoucClientPhone'
--  Ad-Hoc Report changes [End]

-- Setup --> State Minimum Wage Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 813
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup'

Exec EsmV2.dbo.AppMenuItemUpdate 
	'State Min Wage' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu 
	,'/fin/app/state/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like'\crothall\chimes\fin\Setup\%'
-- Setup --> State Minimum Wage Menu Insert [End]

/*
CT updated on 19th July 11PM EST
*/

-- SSRS Reports - Payroll, Employee, GL, WOR Projection, Informational Reports [Begin]

Declare @HirNode Int
	, @DisplayOrder Int
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll Register'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Payroll Register', 'Payroll Register', 'Payroll Register', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayroll_Register&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\GL Reports\Transaction Details'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Transaction Det', 'Transaction Details', 'Transaction Details', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_GL%2fTransaction_Details&rs:Command=Render', @HirNode)

Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports'
EXEC ESMV2.dbo.HirNodeUpdate 0, 1, @HirNode, 9, 'MOP', 'MOP', 'MOP', @DisplayOrder, 1, 'Compass-USA\Data Conversion'

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\WOR Projection Reports\MOP'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('MOP', 'MOP', 'MOP', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_WOR%2fMOP&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\GL Reports\Job Cost Analysis'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Job Cost Analys', 'Job Cost Analysis', 'Job Cost Analysis', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_GL%2fJob_Cost_Analysis&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\Personnel Listing'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Personnel List', 'Personnel Listing', 'Personnel Listing', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fPersonnelListing&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\Personnel New Hires'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('New Hires', 'Personnel New Hires', 'Personnel New Hires', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fPersonnelNewHires&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\Personnel Pay Rate Change'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Pay Rate Change', 'Personnel Pay Rate Change', 'Personnel Pay Rate Change', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fPersonnelPayRateChg&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\Personnel Review'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Personnel Review', 'Personnel Review', 'Personnel Review', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fPersonnelReview&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\Personnel Seniority'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Personnel Senior', 'Personnel Seniority', 'Personnel Seniority', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fPersonnelSeniority&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Employee Reports\Personnel Termination'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Termination', 'Personnel Termination', 'Personnel Termination', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Employee%2fPersonnelTerminations&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll Daily Hours'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Daily Hours', 'Payroll Daily Hours', 'Payroll Daily Hours', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayrollDailyHours&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll Details'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Payroll Details', 'Payroll Details', 'Payroll Details', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayrollRegisterDetails&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll Log'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Payroll Log', 'Payroll Log', 'Payroll Log', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayrollRegisterLog&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll by PayCode'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('By PayCode', 'Payroll by PayCode', 'Payroll by PayCode', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayrollRegisterPayCode&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll Summmary'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Payroll Summmary', 'Payroll Summmary', 'Payroll Summmary', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayrollRegisterSummary&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Payroll Reports\Payroll Sign Sheet'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('Sign Sheet', 'Payroll Sign Sheet', 'Payroll Sign Sheet', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Payroll%2fPayrollSignInOutSheet&rs:Command=Render', @HirNode)

Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Reports\SSRS Reports\Informational Reports\House Code Information'
INSERT INTO Teamfinv2.dbo.RptReports(RptRepBrief, RptRepTitle, RptRepDescription, RptRepName, RptRepActive, RptRepDisplayOrder, RptRepModBy, RptRepModAt, RptRepSubscriptionAvailable, RptRepReportURL, HirNode)
VALUES('House Code Info', 'House Code Information', 'House Code Information', '', 1, 0, 'Compass-USA\Data Conversion', GetDate(), 0, 'https://reports.crothall.com/ReportServer/Pages/ReportViewer.aspx?%2fApplications%2fTeamFin%2fTeamFin_Informational%2fHouseCodeInformation&rs:Command=Render', @HirNode)

-- SSRS Reports - Payroll, Employee, GL, WOR Projection, Informational Reports  [End]

-- Employee Wizard - Date Modification Security Node [Begin]

Declare @HirNodeParent As Int
Declare @DisplayOrder Int

Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\Setup\Employees\Wizard'
Select @DisplayOrder = Max(HirNode) + 1 From ESMV2.dbo.HirNodes

EXEC Esmv2.dbo.[HirNodeUpdate] 
	0 -- hirNode
	, 1 -- hirHierarchy
	, @HirNodeParent -- hirNodeParent
	, 9 -- hirLevel
	, 'DateModification' -- Title
	, 'DateModification' --Brief
	, 'DateModification' -- Description
	, @DisplayOrder -- DisplayOrder
	, 1 -- Active
	, 'Compass-USA\Data Conversion' -- modBy

-- Employee Wizard - Date Modification Security Node [End]

-- Employee Module - Types Table Updates [Begin]

Update dbo.EmpStatusTypes Set EmpStatTitle = 'Leave Of Absence', EmpStatDescription = 'Leave Of Absence' Where EmpStatusType = 2
Update dbo.EmpStatusTypes Set EmpStatActive = 0 Where EmpStatusType In(3, 4)

Update dbo.EmpTerminationReasonTypes Set EmpTerrtActive = 0 Where EmpTerminationReasonType In(1, 2, 3, 5, 6)

Insert Into dbo.EmpTerminationReasonTypes(EmpTerrtBrief, EmpTerrtTitle, EmpTerrtDescription, EmpTerrtDisplayOrder, EmpTerrtActive, EmpTerrtModBy, EmpTerrtModAt)
Values('', 'Deceased', 'Deceased', 9, 1, 'compass-usa\terreforter', GetDate())
/*
--------------Production Not Updated--------------
Update dbo.EmpStatusCategoryTypes Set EmpStactActive = 0 Where EmpStatusCategoryType In(2, 3, 4, 6, 8, 9, 13, 16, 17)

Update dbo.EmpStatusCategoryTypes Set EmpStactBrief = 'FMLA', EmpStactTitle = 'FMLA', EmpStactDescription = 'FMLA', EmpStactDisplayOrder = 3
Where EmpStatusCategoryType = 7

Update dbo.EmpStatusCategoryTypes Set EmpStatusType = 2, EmpStactDisplayOrder = 5
Where EmpStatusCategoryType = 15
--------------Production Not Updated--------------
*/
Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (2, 'FMLA_NE', 'FMLA Not Eligible', 'FMLA Not Eligible', 4, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (2, 'FMLA_NE', 'FMLA Not Eligible', 'FMLA Not Eligible', 4, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (2, 'ADA', 'ADA', 'ADA', 1, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (2, 'ADA_NE', 'ADA Not Eligible', 'ADA Not Eligible', 2, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (2, 'MIL_NE', 'Military Not Eligible', 'Military Not Eligible', 6, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (2, 'Workers_Comp_NE', 'Workers Comp Not Eligible', 'Workers Comp Not Eligible', 8, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (6, 'F', 'Full Time', 'Full Time', 1, 1, 'compass-usa\terreforter', GetDate())

Insert Into dbo.EmpStatusCategoryTypes (EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Values (6, 'P', 'Part Time', 'Part Time', 3, 1, 'compass-usa\terreforter', GetDate())

Delete From dbo.EmpStatusCategoryTypes Where EmpStatusCategoryType = 19

-- Employee Module - Types Table Updates [End]

Declare @Id Int
Declare @EmpEmployeeGeneral Int
Declare @MaxId Int
Declare @TotalCount Int 
Declare @Count Int

Select @Id = Min(EmpEmployeeGeneral), @MaxId = Max(EmpEmployeeGeneral), @TotalCount = Count(EmpEmployeeGeneral)
From dbo.EmpEmployeeGenerals

Set @Count = 0

While 1=1
Begin
	Select @EmpEmployeeGeneral = EmpEmployeeGeneral	From dbo.EmpEmployeeGenerals Where EmpEmployeeGeneral = @Id

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Updating Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
	
--		UPDATE    EmpEmployeeGenerals
--		SET              EmpStatusCategoryType = 1
--		WHERE  EmpEmployeeGeneral = @EmpEmployeeGeneral And    (EmpStatusType = 1) AND 
--							  (CASE WHEN paypayfrequencytype = 1 THEN empempgscheduledhours / 2 ELSE empempgscheduledhours END >= 30)
--
--		UPDATE    EmpEmployeeGenerals
--		SET              EmpStatusCategoryType = 5
--		WHERE  EmpEmployeeGeneral = @EmpEmployeeGeneral And   (EmpStatusType = 1) AND 
--							  (CASE WHEN paypayfrequencytype = 1 THEN empempgscheduledhours / 2 ELSE empempgscheduledhours END < 30)

--		UPDATE    EmpEmployeeGenerals
--		SET              EmpStatusCategoryType = 24
--		WHERE   EmpEmployeeGeneral = @EmpEmployeeGeneral And  (EmpStatusType = 6) AND 
--							  (CASE WHEN paypayfrequencytype = 1 THEN empempgscheduledhours / 2 ELSE empempgscheduledhours END >= 30)
--
--		UPDATE    EmpEmployeeGenerals
--		SET              EmpStatusCategoryType = 25
--		WHERE  EmpEmployeeGeneral = @EmpEmployeeGeneral And   (EmpStatusType = 6) AND 
--							  (CASE WHEN paypayfrequencytype = 1 THEN empempgscheduledhours / 2 ELSE empempgscheduledhours END < 30)
	End	

	Set @Id = @Id + 1	
	If @Id > @MaxId Break
End

/*** Create the indexes for CER Tables ***/

/*
CT updated on 8th August 2012 11PM EST
*/

/*
Last production release version 2.04.007 on 15th August 2012 11PM EST
*/
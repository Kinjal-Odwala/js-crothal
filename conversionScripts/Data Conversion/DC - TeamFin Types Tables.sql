/*
Select * From TeamFinV2_DC.dbo.AppSystemVariables
Select * From TeamFinV2_DC.dbo.AppTransactionStatusTypes
Select * From TeamFinV2_DC.dbo.BudShiftTypes
Select * From TeamFinV2_DC.dbo.EmpDeviceGroupTypes
Select * From TeamFinV2_DC.dbo.EmpEthnicityTypes
Select * From TeamFinV2_DC.dbo.EmpFederalAdjustmentTypes
Select * From TeamFinV2_DC.dbo.EmpGenderTypes
Select * From TeamFinV2_DC.dbo.EmpI9Types
Select * From TeamFinV2_DC.dbo.EmpJobCodeTypes
Select * From TeamFinV2_DC.dbo.EmpJobEndReasonTypes
Select * From TeamFinV2_DC.dbo.EmpJobStartReasonTypes
Select * From TeamFinV2_DC.dbo.EmpLaundryStatusTypes
Select * From TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentStates
Select * From TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentTypes
Select * From TeamFinV2_DC.dbo.EmpLocalTaxCodePayrollCompanyStates
Select * From TeamFinV2_DC.dbo.EmpMaritalStatusFederalTaxTypes
Select * From TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxStates
Select * From TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxTypes
Select * From TeamFinV2_DC.dbo.EmpMaritalStatusTypes
Select * From TeamFinV2_DC.dbo.EmpPositionTypes
Select * From TeamFinV2_DC.dbo.EmpRateChangeReasonTypes
Select * From TeamFinV2_DC.dbo.EmpSDIAdjustmentStates
Select * From TeamFinV2_DC.dbo.EmpSDIAdjustmentTypes
Select * From TeamFinV2_DC.dbo.EmpSeparationCodes
Select * From TeamFinV2_DC.dbo.EmpStateAdjustmentStates
Select * From TeamFinV2_DC.dbo.EmpStateAdjustmentTypes
Select * From TeamFinV2_DC.dbo.EmpStatusCategoryTypes
Select * From TeamFinV2_DC.dbo.EmpStatusTypes
Select * From TeamFinV2_DC.dbo.EmpTerminationReasonTypes
Select * From TeamFinV2_DC.dbo.EmpUnionTypes
Select * From TeamFinV2_DC.dbo.EmpVetTypes
Select * From TeamFinV2_DC.dbo.EmpWorkShifts
Select * From TeamFinV2_DC.dbo.FscAccountCategories
Select * From TeamFinV2_DC.dbo.GlmJournalTransferTypes
Select * From TeamFinV2_DC.dbo.GlmRecurringFixedCostIntervalTypes
Select * From TeamFinV2_DC.dbo.GlmRecurringFixedCostTypes
Select * From TeamFinV2_DC.dbo.HcmBillingCycleFrequencyTypes
Select * From TeamFinV2_DC.dbo.HcmContractTypes
Select * From TeamFinV2_DC.dbo.HcmHouseCodeTypes
Select * From TeamFinV2_DC.dbo.HcmPayrollProcessingLocationTypes
Select * From TeamFinV2_DC.dbo.HcmServiceTypes
Select * From TeamFinV2_DC.dbo.HcmTermsOfContractTypes
Select * From TeamFinV2_DC.dbo.PayEmployeePunchTypes
Select * From TeamFinV2_DC.dbo.PayPayFrequencyTypes
Select * From TeamFinV2_DC.dbo.PayServiceLines
Select * From TeamFinV2_DC.dbo.PurPOSendMethodTypes
Select * From TeamFinV2_DC.dbo.RevMunicipalityTaxes
Select * From TeamFinV2_DC.dbo.RevStateTaxes
Select * From TeamFinV2_DC.dbo.RevTableTypes
*/

Truncate Table TeamFinV2_DC.dbo.AppSystemVariables
Insert Into TeamFinV2_DC.dbo.AppSystemVariables(AppSysBrief, AppSysTitle, AppSysDescription, AppSysVariableName, AppSysVariableValue, AppSysDisplayOrder, AppSysActive, AppSysModBy, AppSysModAt)
Select AppSysBrief, AppSysTitle, AppSysDescription, AppSysVariableName, AppSysVariableValue, AppSysDisplayOrder, AppSysActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.AppSystemVariables

Truncate Table TeamFinV2_DC.dbo.AppTransactionStatusTypes
Insert Into TeamFinV2_DC.dbo.AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
Select AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.AppTransactionStatusTypes

Truncate Table TeamFinV2_DC.dbo.BudShiftTypes
Insert Into TeamFinV2_DC.dbo.BudShiftTypes(BudShitBrief, BudShitTitle, BudShitDescription, BudShitDisplayOrder, BudShitActive, BudShitModBy, BudShitModAt)
Select BudShitBrief, BudShitTitle, BudShitDescription, BudShitDisplayOrder, BudShitActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.BudShiftTypes

Truncate Table TeamFinV2_DC.dbo.EmpDeviceGroupTypes
/*Insert Into TeamFinV2_DC.dbo.EmpDeviceGroupTypes(EmpDevgtBrief, EmpDevgtTitle, EmpDevgtDescription, EmpDevgtDisplayOrder, EmpDevgtActive, EmpDevgtModBy, EmpDevgtModAt)
Select EmpDevgtBrief, EmpDevgtTitle, EmpDevgtDescription, EmpDevgtDisplayOrder, EmpDevgtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpDeviceGroupTypes
*/

Insert Into TeamFinV2_DC.dbo.EmpDeviceGroupTypes(EmpDevgtBrief, EmpDevgtTitle, EmpDevgtDescription, EmpDevgtDisplayOrder, EmpDevgtActive, EmpDevgtModBy, EmpDevgtModAt)
Select Title, Title, Description, 0, 1, 'Persistech\Data Conversion', GetDate() 
From TeamFin.dbo.DeviceGroup

Truncate Table TeamFinV2_DC.dbo.EmpEthnicityTypes
Insert Into TeamFinV2_DC.dbo.EmpEthnicityTypes(EmpEthtBrief, EmpEthtTitle, EmpEthtDescription, EmpEthtDisplayOrder, EmpEthtActive, EmpEthtModBy, EmpEthtModAt)
Select EmpEthtBrief, EmpEthtTitle, EmpEthtDescription, EmpEthtDisplayOrder, EmpEthtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpEthnicityTypes

Truncate Table TeamFinV2_DC.dbo.EmpFederalAdjustmentTypes
Insert Into TeamFinV2_DC.dbo.EmpFederalAdjustmentTypes(EmpFedatBrief, EmpFedatTitle, EmpFedatDescription, EmpFedatDisplayOrder, EmpFedatActive, EmpFedatModBy, EmpFedatModAt)
Select EmpFedatBrief, EmpFedatTitle, EmpFedatDescription, EmpFedatDisplayOrder, EmpFedatActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpFederalAdjustmentTypes

Truncate Table TeamFinV2_DC.dbo.EmpGenderTypes
Insert Into TeamFinV2_DC.dbo.EmpGenderTypes(EmpGentBrief, EmpGentTitle, EmpGentDescription, EmpGentDisplayOrder, EmpGentActive, EmpGentModBy, EmpGentModAt)
Select EmpGentBrief, EmpGentTitle, EmpGentDescription, EmpGentDisplayOrder, EmpGentActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpGenderTypes

Truncate Table TeamFinV2_DC.dbo.EmpI9Types
Insert Into TeamFinV2_DC.dbo.EmpI9Types(EmpI9tBrief, EmpI9tTitle, EmpI9tDescription, EmpI9tDisplayOrder, EmpI9tActive, EmpI9tModBy, EmpI9tModAt)
Select EmpI9tBrief, EmpI9tTitle, EmpI9tDescription, EmpI9tDisplayOrder, EmpI9tActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpI9Types

Truncate Table TeamFinV2_DC.dbo.EmpJobCodeTypes
Insert Into TeamFinV2_DC.dbo.EmpJobCodeTypes(EmpJobctBrief, EmpJobctTitle, EmpJobctDescription, EmpJobctDisplayOrder, EmpJobctActive, EmpJobctModBy, EmpJobctModAt)
Select EmpJobctBrief, EmpJobctTitle, EmpJobctDescription, EmpJobctDisplayOrder, EmpJobctActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpJobCodeTypes

Truncate Table TeamFinV2_DC.dbo.EmpJobEndReasonTypes
Insert Into TeamFinV2_DC.dbo.EmpJobEndReasonTypes(EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, EmpJobertModBy, EmpJobertModAt)
Select EmpJobertBrief, EmpJobertTitle, EmpJobertDescription, EmpJobertDisplayOrder, EmpJobertActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpJobEndReasonTypes

Truncate Table TeamFinV2_DC.dbo.EmpJobStartReasonTypes
Insert Into TeamFinV2_DC.dbo.EmpJobStartReasonTypes(EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, EmpJobsrtModBy, EmpJobsrtModAt)
Select EmpJobsrtBrief, EmpJobsrtTitle, EmpJobsrtDescription, EmpJobsrtDisplayOrder, EmpJobsrtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpJobStartReasonTypes

Truncate Table TeamFinV2_DC.dbo.EmpLaundryStatusTypes
Insert Into TeamFinV2_DC.dbo.EmpLaundryStatusTypes(EmpLaustBrief, EmpLaustTitle, EmpLaustDescription, EmpLaustDisplayOrder, EmpLaustActive, EmpLaustModBy, EmpLaustModAt)
Select EmpLaustBrief, EmpLaustTitle, EmpLaustDescription, EmpLaustDisplayOrder, EmpLaustActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpLaundryStatusTypes

Truncate Table TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentStates
Insert Into TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentStates(EmpLocalTaxAdjustmentType, AppStateType)
Select EmpLocalTaxAdjustmentType, AppStateType From TeamFinV2.dbo.EmpLocalTaxAdjustmentStates

Truncate Table TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentTypes
Insert Into TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentTypes(EmpLoctatBrief, EmpLoctatTitle, EmpLoctatDescription, EmpLoctatDisplayOrder, EmpLoctatActive, EmpLoctatModBy, EmpLoctatModAt)
Select EmpLoctatBrief, EmpLoctatTitle, EmpLoctatDescription, EmpLoctatDisplayOrder, EmpLoctatActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpLocalTaxAdjustmentTypes

Truncate Table TeamFinV2_DC.dbo.EmpLocalTaxCodePayrollCompanyStates
Insert Into TeamFinV2_DC.dbo.EmpLocalTaxCodePayrollCompanyStates(PayPayrollCompany, AppStateType, EmpLoctcpcsLocalTaxCode, EmpLoctcpcsLocalTaxDescription)
Select PayPayrollCompany, AppStateType, EmpLoctcpcsLocalTaxCode, EmpLoctcpcsLocalTaxDescription From TeamFinV2.dbo.EmpLocalTaxCodePayrollCompanyStates

Truncate Table TeamFinV2_DC.dbo.EmpMaritalStatusFederalTaxTypes
Insert Into TeamFinV2_DC.dbo.EmpMaritalStatusFederalTaxTypes(EmpMarsfttBrief, EmpMarsfttTitle, EmpMarsfttDescription, EmpMarsfttDisplayOrder, EmpMarsfttActive, EmpMarsfttModBy, EmpMarsfttModAt)
Select EmpMarsfttBrief, EmpMarsfttTitle, EmpMarsfttDescription, EmpMarsfttDisplayOrder, EmpMarsfttActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpMaritalStatusFederalTaxTypes
								
Truncate Table TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxStates
Insert Into TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxStates(EmpMaritalStatusStateTaxType, AppStateType)
Select EmpMaritalStatusStateTaxType, AppStateType From TeamFinV2.dbo.EmpMaritalStatusStateTaxStates

Truncate Table TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxTypes
Insert Into TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxTypes(EmpMarssttBrief, EmpMarssttTitle, EmpMarssttDescription, EmpMarssttDisplayOrder, EmpMarssttActive, EmpMarssttModBy, EmpMarssttModAt)
Select EmpMarssttBrief, EmpMarssttTitle, EmpMarssttDescription, EmpMarssttDisplayOrder, EmpMarssttActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpMaritalStatusStateTaxTypes

Truncate Table TeamFinV2_DC.dbo.EmpMaritalStatusTypes
Insert Into TeamFinV2_DC.dbo.EmpMaritalStatusTypes(EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, EmpMarstModBy, EmpMarstModAt)
Select EmpMarstBrief, EmpMarstTitle, EmpMarstDescription, EmpMarstDisplayOrder, EmpMarstActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpMaritalStatusTypes

Truncate Table TeamFinV2_DC.dbo.EmpPositionTypes
Insert Into TeamFinV2_DC.dbo.EmpPositionTypes(EmpPostBrief, EmpPostTitle, EmpPostDescription, EmpPostDisplayOrder, EmpPostActive, EmpPostModBy, EmpPostModAt)
Select EmpPostBrief, EmpPostTitle, EmpPostDescription, EmpPostDisplayOrder, EmpPostActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpPositionTypes

Truncate Table TeamFinV2_DC.dbo.EmpRateChangeReasonTypes
Insert Into TeamFinV2_DC.dbo.EmpRateChangeReasonTypes(EmpRatcrtBrief, EmpRatcrtTitle, EmpRatcrtDescription, EmpRatcrtDisplayOrder, EmpRatcrtActive, EmpRatcrtModBy, EmpRatcrtModAt)
Select EmpRatcrtBrief, EmpRatcrtTitle, EmpRatcrtDescription, EmpRatcrtDisplayOrder, EmpRatcrtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpRateChangeReasonTypes

Truncate Table TeamFinV2_DC.dbo.EmpSDIAdjustmentStates
Insert Into TeamFinV2_DC.dbo.EmpSDIAdjustmentStates(EmpSDIAdjustmentType, AppStateType)
Select EmpSDIAdjustmentType, AppStateType From TeamFinV2.dbo.EmpSDIAdjustmentStates

Truncate Table TeamFinV2_DC.dbo.EmpSDIAdjustmentTypes
Insert Into TeamFinV2_DC.dbo.EmpSDIAdjustmentTypes(EmpSDIatBrief, EmpSDIatTitle, EmpSDIatDescription, EmpSDIatDisplayOrder, EmpSDIatActive, EmpSDIatModBy, EmpSDIatModAt)
Select EmpSDIatBrief, EmpSDIatTitle, EmpSDIatDescription, EmpSDIatDisplayOrder, EmpSDIatActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpSDIAdjustmentTypes

Truncate Table TeamFinV2_DC.dbo.EmpSeparationCodes
Insert Into TeamFinV2_DC.dbo.EmpSeparationCodes(EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, EmpSepcModBy, EmpSepcModAt)
Select EmpSepcBrief, EmpSepcTitle, EmpSepcDescription, EmpSepcDisplayOrder, EmpSepcActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpSeparationCodes

Truncate Table TeamFinV2_DC.dbo.EmpStateAdjustmentStates
Insert Into TeamFinV2_DC.dbo.EmpStateAdjustmentStates(EmpStateAdjustmentType, AppStateType)
Select EmpStateAdjustmentType, AppStateType From TeamFinV2.dbo.EmpStateAdjustmentStates

Truncate Table TeamFinV2_DC.dbo.EmpStateAdjustmentTypes
Insert Into TeamFinV2_DC.dbo.EmpStateAdjustmentTypes(EmpStaatBrief, EmpStaatTitle, EmpStaatDescription, EmpStaatDisplayOrder, EmpStaatActive, EmpStaatModBy, EmpStaatModAt)
Select EmpStaatBrief, EmpStaatTitle, EmpStaatDescription, EmpStaatDisplayOrder, EmpStaatActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpStateAdjustmentTypes

Truncate Table TeamFinV2_DC.dbo.EmpStatusCategoryTypes
Insert Into TeamFinV2_DC.dbo.EmpStatusCategoryTypes(EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, EmpStactModBy, EmpStactModAt)
Select EmpStatusType, EmpStactBrief, EmpStactTitle, EmpStactDescription, EmpStactDisplayOrder, EmpStactActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpStatusCategoryTypes

Truncate Table TeamFinV2_DC.dbo.EmpStatusTypes
Insert Into TeamFinV2_DC.dbo.EmpStatusTypes(EmpStatBrief, EmpStatTitle, EmpStatDescription, EmpStatDisplayOrder, EmpStatActive, EmpStatModBy, EmpStatModAt)
Select EmpStatBrief, EmpStatTitle, EmpStatDescription, EmpStatDisplayOrder, EmpStatActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpStatusTypes

Truncate Table TeamFinV2_DC.dbo.EmpTerminationReasonTypes
Insert Into TeamFinV2_DC.dbo.EmpTerminationReasonTypes(EmpTerrtBrief, EmpTerrtTitle, EmpTerrtDescription, EmpTerrtDisplayOrder, EmpTerrtActive, EmpTerrtModBy, EmpTerrtModAt)
Select EmpTerrtBrief, EmpTerrtTitle, EmpTerrtDescription, EmpTerrtDisplayOrder, EmpTerrtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpTerminationReasonTypes

Truncate Table TeamFinV2_DC.dbo.EmpUnionTypes
Insert Into TeamFinV2_DC.dbo.EmpUnionTypes(EmpUnitBrief, EmpUnitTitle, EmpUnitDescription, EmpUnitDisplayOrder, EmpUnitActive, EmpUnitModBy, EmpUnitModAt)
Select EmpUnitBrief, EmpUnitTitle, EmpUnitDescription, EmpUnitDisplayOrder, EmpUnitActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpUnionTypes

Truncate Table TeamFinV2_DC.dbo.EmpVetTypes
Insert Into TeamFinV2_DC.dbo.EmpVetTypes(EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, EmpVettModBy, EmpVettModAt)
Select EmpVettBrief, EmpVettTitle, EmpVettDescription, EmpVettDisplayOrder, EmpVettActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpVetTypes

Truncate Table TeamFinV2_DC.dbo.EmpWorkShifts
Insert Into TeamFinV2_DC.dbo.EmpWorkShifts(EmpWorsBrief, EmpWorsTitle, EmpWorsDescription, EmpWorsDisplayOrder, EmpWorsActive, EmpWorsStartTime, EmpWorsEndTime, EmpWorsModBy, EmpWorsModAt)
Select EmpWorsBrief, EmpWorsTitle, EmpWorsDescription, EmpWorsDisplayOrder, EmpWorsActive, EmpWorsStartTime, EmpWorsEndTime, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.EmpWorkShifts

Truncate Table TeamFinV2_DC.dbo.FscAccountCategories
Insert Into TeamFinV2_DC.dbo.FscAccountCategories(FscAcccTitle, FscAcccDisplayOrder, FscAcccActive, FscAcccModBy, FscAcccModAt)
Select FscAcccTitle, FscAcccDisplayOrder, FscAcccActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.FscAccountCategories

Truncate Table TeamFinV2_DC.dbo.GlmJournalTransferTypes
Insert Into TeamFinV2_DC.dbo.GlmJournalTransferTypes(GlmJouttBrief, GlmJouttTitle, GlmJouttActive, GlmJouttModBy, GlmJouttModAt)
Select GlmJouttBrief, GlmJouttTitle, GlmJouttActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.GlmJournalTransferTypes

Truncate Table TeamFinV2_DC.dbo.GlmRecurringFixedCostIntervalTypes
Insert Into TeamFinV2_DC.dbo.GlmRecurringFixedCostIntervalTypes(GlmRecfcitBrief, GlmRecfcitTitle, GlmRecfcitDescription, GlmRecfcitDisplayOrder, GlmRecfcitActive, GlmRecfcitModBy, GlmRecfcitModAt)
Select GlmRecfcitBrief, GlmRecfcitTitle, GlmRecfcitDescription, GlmRecfcitDisplayOrder, GlmRecfcitActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.GlmRecurringFixedCostIntervalTypes

Truncate Table TeamFinV2_DC.dbo.GlmRecurringFixedCostTypes
Insert Into TeamFinV2_DC.dbo.GlmRecurringFixedCostTypes(GlmRecfctBrief, GlmRecfctTitle, GlmRecfctDescription, GlmRecfctDisplayOrder, GlmRecfctActive, GlmRecfctModBy, GlmRecfctModAt)
Select GlmRecfctBrief, GlmRecfctTitle, GlmRecfctDescription, GlmRecfctDisplayOrder, GlmRecfctActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.GlmRecurringFixedCostTypes

Truncate Table TeamFinV2_DC.dbo.HcmBillingCycleFrequencyTypes
Insert Into TeamFinV2_DC.dbo.HcmBillingCycleFrequencyTypes(HcmBilcftBrief, HcmBilcftTitle, HcmBilcftDescription, HcmBilcftDisplayOrder, HcmBilcftActive, HcmBilcftModBy, HcmBilcftModAt)
Select HcmBilcftBrief, HcmBilcftTitle, HcmBilcftDescription, HcmBilcftDisplayOrder, HcmBilcftActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.HcmBillingCycleFrequencyTypes

Truncate Table TeamFinV2_DC.dbo.HcmContractTypes
Insert Into TeamFinV2_DC.dbo.HcmContractTypes(HcmContBrief, HcmContTitle, HcmContDescription, HcmContDisplayOrder, HcmContActive, HcmContModBy, HcmContModAt)
Select HcmContBrief, HcmContTitle, HcmContDescription, HcmContDisplayOrder, HcmContActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.HcmContractTypes

Truncate Table TeamFinV2_DC.dbo.HcmHouseCodeTypes
Insert Into TeamFinV2_DC.dbo.HcmHouseCodeTypes(HcmHouctBrief, HcmHouctTitle, HcmHouctDescription, HcmHouctDisplayOrder, HcmHouctActive, HcmHouctModBy, HcmHouctModAt)
Select HcmHouctBrief, HcmHouctTitle, HcmHouctDescription, HcmHouctDisplayOrder, HcmHouctActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.HcmHouseCodeTypes

Truncate Table TeamFinV2_DC.dbo.HcmPayrollProcessingLocationTypes
Insert Into TeamFinV2_DC.dbo.HcmPayrollProcessingLocationTypes(HcmPaypltBrief, HcmPaypltTitle, HcmPaypltDescription, HcmPaypltDisplayOrder, HcmPaypltActive, HcmPaypltModBy, HcmPaypltModAt)
Select HcmPaypltBrief, HcmPaypltTitle, HcmPaypltDescription, HcmPaypltDisplayOrder, HcmPaypltActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.HcmPayrollProcessingLocationTypes

Truncate Table TeamFinV2_DC.dbo.HcmServiceTypes
Insert Into TeamFinV2_DC.dbo.HcmServiceTypes(HcmSertBrief, HcmSertTitle, HcmSertDescription, HcmSertDisplayOrder, HcmSertActive, HcmSertModBy, HcmSertModAt)
Select HcmSertBrief, HcmSertTitle, HcmSertDescription, HcmSertDisplayOrder, HcmSertActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.HcmServiceTypes

Truncate Table TeamFinV2_DC.dbo.HcmTermsOfContractTypes
Insert Into TeamFinV2_DC.dbo.HcmTermsOfContractTypes(HcmTeroctBrief, HcmTeroctTitle, HcmTeroctDescription, HcmTeroctDisplayOrder, HcmTeroctActive, HcmTeroctModBy, HcmTeroctModAt)
Select HcmTeroctBrief, HcmTeroctTitle, HcmTeroctDescription, HcmTeroctDisplayOrder, HcmTeroctActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.HcmTermsOfContractTypes

Truncate Table TeamFinV2_DC.dbo.PayEmployeePunchTypes
Insert Into TeamFinV2_DC.dbo.PayEmployeePunchTypes(PayEmpptBrief, PayEmpptTitle, PayEmpptDescription, PayEmpptDisplayOrder, PayEmpptActive, PayEmpptModBy, PayEmpptModAt)
Select PayEmpptBrief, PayEmpptTitle, PayEmpptDescription, PayEmpptDisplayOrder, PayEmpptActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.PayEmployeePunchTypes

Truncate Table TeamFinV2_DC.dbo.PayPayFrequencyTypes
Insert Into TeamFinV2_DC.dbo.PayPayFrequencyTypes(PayPayftBrief, PayPayftTitle, PayPayftDescription, PayPayftDisplayOrder, PayPayftActive, PayPayftModBy, PayPayftModAt)
Select PayPayftBrief, PayPayftTitle, PayPayftDescription, PayPayftDisplayOrder, PayPayftActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.PayPayFrequencyTypes

Truncate Table TeamFinV2_DC.dbo.PayServiceLines
Insert Into TeamFinV2_DC.dbo.PayServiceLines(PaySerlBrief, PaySerlTitle, PaySerlDescription, PaySerlDisplayOrder, PaySerlActive, PaySerlModBy, PaySerlModAt)
Select PaySerlBrief, PaySerlTitle, PaySerlDescription, PaySerlDisplayOrder, PaySerlActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.PayServiceLines

Truncate Table TeamFinV2_DC.dbo.PurPOSendMethodTypes
Insert Into TeamFinV2_DC.dbo.PurPOSendMethodTypes(PurPOsmtBrief, PurPOsmtTitle, PurPOsmtDescription, PurPOsmtDisplayOrder, PurPOsmtActive, PurPOsmtModBy, PurPOsmtModAt)
Select PurPOsmtBrief, PurPOsmtTitle, PurPOsmtDescription, PurPOsmtDisplayOrder, PurPOsmtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.PurPOSendMethodTypes

Truncate Table TeamFinV2_DC.dbo.RevTableTypes
Insert Into TeamFinV2_DC.dbo.RevTableTypes(RevTabtBrief, RevTabtTitle, RevTabtDescription, RevTabtDisplayOrder, RevTabtActive, RevTabtModBy, RevTabtModAt)
Select RevTabtBrief, RevTabtTitle, RevTabtDescription, RevTabtDisplayOrder, RevTabtActive, 'Persistech\Data Conversion', GetDate() From TeamFinV2.dbo.RevTableTypes

---------------------------------------------------------------------------------
--Insert the FscYears and FscPeriods for the year 2009 and 2010
Truncate Table TeamFinV2_DC.dbo.FscPatterns
Truncate Table TeamFinV2_DC.dbo.FscYears
Truncate Table TeamFinV2_DC.dbo.FscPeriods
Insert Into TeamFinV2_DC.dbo.FscPatterns(FscPatTitle, FscPatDisplayOrder, FscPatActive, FscPatModBy, FscPatModAt)
Values('101', 1, 1, 'Persistech\Data Conversion', GetDate())

Insert Into TeamFinV2_DC.dbo.FscPatterns(FscPatTitle, FscPatDisplayOrder, FscPatActive, FscPatModBy, FscPatModAt)
Values('102', 2, 1, 'Persistech\Data Conversion', GetDate())

Insert Into TeamFinV2_DC.dbo.FscPatterns(FscPatTitle, FscPatDisplayOrder, FscPatActive, FscPatModBy, FscPatModAt)
Values('103', 3, 1, 'Persistech\Data Conversion', GetDate())

Insert Into TeamFinV2_DC.dbo.FscYears(FscPattern, FscYeaTitle, FscYeaDisplayOrder, FscYeaActive, FscYeaModBy, FscYeaModAt)
Values(1, '2009', 1, 1, 'Persistech\Data Conversion', GetDate())

Insert Into TeamFinV2_DC.dbo.FscYears(FscPattern, FscYeaTitle, FscYeaDisplayOrder, FscYeaActive, FscYeaModBy, FscYeaModAt)
Values(2, '2010', 2, 1, 'Persistech\Data Conversion', GetDate())

Insert Into TeamFinV2_DC.dbo.FscYears(FscPattern, FscYeaTitle, FscYeaDisplayOrder, FscYeaActive, FscYeaModBy, FscYeaModAt)
Values(2, '2019', 3, 1, 'Persistech\Data Conversion', GetDate())

Insert Into TeamFinV2_DC.dbo.FscPeriods(FscYear, FscPerTitle, FscPerStartDate, FscPerEndDate, FscPerDisplayOrder, FscPerActive, FscPerModBy, FscPerModAt)
Select 1, Period, StartDate, EndDate, 1, 1, 'Persistech\Data Conversion', GetDate() From TeamFin.dbo.PeriodDefinition Where FiscalYear In (2009)

Insert Into TeamFinV2_DC.dbo.FscPeriods(FscYear, FscPerTitle, FscPerStartDate, FscPerEndDate, FscPerDisplayOrder, FscPerActive, FscPerModBy, FscPerModAt)
Select 2, Period, StartDate, EndDate, 1, 1, 'Persistech\Data Conversion', GetDate() From TeamFin.dbo.PeriodDefinition Where FiscalYear In (2010)

Insert Into TeamFinV2_DC.dbo.FscPeriods(FscYear, FscPerTitle, FscPerStartDate, FscPerEndDate, FscPerDisplayOrder, FscPerActive, FscPerModBy, FscPerModAt)
Select 3, Period, StartDate, EndDate, 1, 1, 'Persistech\Data Conversion', GetDate() From TeamFin.dbo.PeriodDefinition Where FiscalYear In (2019)

--Update TeamFinV2_DC.dbo.FscPeriods Set FscPerTitle = 14 Where FscPeriod = 14
--Update TeamFinV2_DC.dbo.FscPeriods Set FscPerTitle = 15 Where FscPeriod = 15
---------------------------------------------------------------------------------
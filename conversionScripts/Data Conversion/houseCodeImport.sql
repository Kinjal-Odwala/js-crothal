Set NoCount ON

Declare @MinId int, @MaxId int
/********** ESMv2_DC.dbo.HirNodes	*************/
, @HirHierarchy  as varchar(200)
, @HirLevel  as varchar(200)
, @AppSitTitle as nvarchar(200)
, @AppSitAddressLine1 as nvarchar(200)
, @AppSitAddressLine2 as nvarchar(200)
, @AppSitCity as nvarchar(200)
, @AppStateType as nvarchar(200)
, @AppSitPostalCode as nvarchar(200)
, @AppSitCounty as nvarchar(200)
, @AppIndustryType as nvarchar(200)
, @AppPrimaryBusinessType as nvarchar(200)
, @AppLocationType as nvarchar(200)
, @AppTraumaLevelType as nvarchar(200)
, @AppProfitDesignationType as nvarchar(200)
, @AppGPOType as nvarchar(200)
, @AppSitSpecifyGPO as nvarchar(200)
, @AppOwnershipType as nvarchar(200)
, @HirNodeParent  as varchar(200)
, @HirNodBrief  as varchar(200)
, @HirNodTitle  as varchar(200)
, @HirNodDescription  as varchar(200)

, @FscJDECompany  as varchar(200)
, @HcmHoucStartDate  as varchar(200)
, @HcmServiceType  as varchar(200)
, @HcmHoucEnforceLaborControl  as varchar(200)
, @HcmHoucManagerName  as varchar(200)
, @HcmHoucManagerPhone  as varchar(200)
, @HcmHoucManagerCellPhone  as varchar(200)
, @HcmHoucManagerFax  as varchar(200)
, @HcmHoucManagerPager  as varchar(200)
, @HcmHoucManagerAssistantName  as varchar(200)
, @HcmHoucManagerAssistantPhone  as varchar(200)
, @HcmHoucClientFirstName  as varchar(200)
, @HcmHoucClientLastName  as varchar(200)
, @HcmHoucClientTitle  as varchar(200)
, @HcmHoucClientPhone  as varchar(200)
, @HcmHoucClientFax  as varchar(200)
, @HcmHoucClientAssistantName  as varchar(200)
, @HcmHoucClientAssistantPhone  as varchar(200)
, @HcmHoucManagedEmployees  as varchar(200)
, @HcmHoucBedsLicensed  as varchar(200)
, @HcmHoucPatientDays  as varchar(200)
, @HcmHoucAverageDailyCensus   as varchar(200)
, @HcmHoucAnnualDischarges  as varchar(200)
, @HcmHoucAverageBedTurnaroundTime  as varchar(200)
, @HcmHoucNetCleanableSqft  as varchar(200)
, @HcmHoucAverageLaundryLbs  as varchar(200)
, @HcmHoucCrothallEmployees  as varchar(200)
, @HcmHoucBedsActive  as varchar(200)
, @HcmHoucAdjustedPatientDaysBudgeted  as varchar(200)
, @HcmHoucAnnualTransfers  as varchar(200)
, @HcmHoucAnnualTransports  as varchar(200)
, @HcmHoucShippingAddress1  as varchar(200)
, @HcmHoucShippingAddress2  as varchar(200)
, @HcmHoucShippingCity  as varchar(200)
, @HcmHoucShippingState  as varchar(200)
, @HcmHoucShippingZip  as varchar(200)
, @HcmRemitToLocation  as varchar(200)
, @HcmContractType  as varchar(200)
, @HcmTermsOfContractType  as varchar(200)
, @HcmBillingCycleFrequencyType  as varchar(200)
, @HcmHoucBankCodeNumber  as varchar(200)
, @HcmHoucBankAccountNumber  as varchar(200)
, @HcmHoucBankName  as varchar(200)
, @HcmHoucBankContact  as varchar(200)
, @HcmHoucBankAddress1  as varchar(200)
, @HcmHoucBankAddress2  as varchar(200)
, @HcmHoucBankCity  as varchar(200)
, @HcmHoucBankState  as varchar(200)
, @HcmHoucBankZip  as varchar(200)
, @HcmHoucBankPhone  as varchar(200)
, @HcmHoucBankFax  as varchar(200)
, @HcmHoucBankEmail  as varchar(200)
, @HcmHoucStateTaxPercent  as varchar(200)
, @HcmHoucLocalTaxPercent  as varchar(200)
, @HcmPayrollProcessingLocationType  as varchar(200)
, @HcmHoucDefaultLunchBreak  as varchar(200)
, @HcmHoucLunchBreakTrigger  as varchar(200)
, @HcmHouseCodeType  as varchar(200)
, @HcmLaborTrackingType  as varchar(200)
, @HcmHoucRoundingTimePeriod  as varchar(200)
, @HcmHoucTimeAndAttendance  as varchar(200)
, @HcmServiceLine  as varchar(200)

Declare @HirNode int 
, @HirNodeNew int 
, @HirNodDisplayOrder int 
, @HirNodActive bit 
, @ModBy varchar(50)
Set @HirNodDisplayOrder = '1'
Set @HirNodActive =  1 
Set @ModBy = 'compass-usa\data conversion'
Set @HirNode = 0
--Declare @MinId int, @MaxId int
Select  @MinId = Min(ID), @MaxId = Max(Id) From TeamfinV2.dbo.HouseCodeImportUpdated_Import
--print @MinId 
--print @MaxId 

While(1=1)
Begin	
		Select 

/**********************EsmV2.dbo.HirNode****************************/
				@HirHierarchy = HirHierarchy
				, @HirLevel = HirLevel
/**********************EsmV2.dbo.AppSites****************************/
				, @AppSitTitle = AppSitTitle
				, @AppSitAddressLine1 = AppSitAddressLine1
				, @AppSitAddressLine2 = AppSitAddressLine2
				, @AppSitCity = AppSitCity
				, @AppStateType = AppStateType
				, @AppSitPostalCode = AppSitPostalCode
				, @AppSitCounty = AppSitCounty
				, @AppIndustryType = AppIndustryType
				, @AppPrimaryBusinessType = AppPrimaryBusinessType
				, @AppLocationType = AppLocationType
				, @AppTraumaLevelType = AppTraumaLevelType
				, @AppProfitDesignationType = AppProfitDesignationType
				, @AppGPOType = AppGPOType
				, @AppSitSpecifyGPO = AppSitSpecifyGPO
				, @AppOwnershipType = AppOwnershipType

/**********************EsmV2.dbo.HirNode****************************/
				, @HirNodeParent = HirNodeParent
				, @HirNodBrief = HirNodBrief
				, @HirNodTitle = HirNodTitle
				, @HirNodDescription = HirNodDescription
/**********************TeamFinV2.dbo.HcmHouseCodes****************************/
				, @FscJDECompany = FscJDECompany
				, @HcmHoucStartDate = HcmHoucStartDate
				, @HcmServiceType = HcmServiceType
				, @HcmHoucEnforceLaborControl = HcmHoucEnforceLaborControl
				, @HcmHoucManagerName = HcmHoucManagerName
				, @HcmHoucManagerPhone = HcmHoucManagerPhone
				, @HcmHoucManagerCellPhone = HcmHoucManagerCellPhone
				, @HcmHoucManagerFax = HcmHoucManagerFax
				, @HcmHoucManagerPager = HcmHoucManagerPager
				, @HcmHoucManagerAssistantName = HcmHoucManagerAssistantName
				, @HcmHoucManagerAssistantPhone = HcmHoucManagerAssistantPhone
				, @HcmHoucClientFirstName = HcmHoucClientFirstName
				, @HcmHoucClientLastName = HcmHoucClientLastName
				, @HcmHoucClientTitle = HcmHoucClientTitle
				, @HcmHoucClientPhone = HcmHoucClientPhone
				, @HcmHoucClientFax = HcmHoucClientFax
				, @HcmHoucClientAssistantName = HcmHoucClientAssistantName
				, @HcmHoucClientAssistantPhone = HcmHoucClientAssistantPhone
				, @HcmHoucManagedEmployees = HcmHoucManagedEmployees
				, @HcmHoucBedsLicensed = HcmHoucBedsLicensed
				, @HcmHoucPatientDays = HcmHoucPatientDays
				, @HcmHoucAverageDailyCensus  =HcmHoucAverageDailyCensus
				, @HcmHoucAnnualDischarges = HcmHoucAnnualDischarges
				, @HcmHoucAverageBedTurnaroundTime = HcmHoucAverageBedTurnaroundTime
				, @HcmHoucNetCleanableSqft = HcmHoucNetCleanableSqft
				, @HcmHoucAverageLaundryLbs = HcmHoucAverageLaundryLbs
				, @HcmHoucCrothallEmployees = HcmHoucCrothallEmployees
				, @HcmHoucBedsActive = HcmHoucBedsActive
				, @HcmHoucAdjustedPatientDaysBudgeted = HcmHoucAdjustedPatientDaysBudgeted
				, @HcmHoucAnnualTransfers = HcmHoucAnnualTransfers
				, @HcmHoucAnnualTransports = HcmHoucAnnualTransports
				, @HcmHoucShippingAddress1 = HcmHoucShippingAddress1
				, @HcmHoucShippingAddress2 = HcmHoucShippingAddress2
				, @HcmHoucShippingCity = HcmHoucShippingCity
				, @HcmHoucShippingState = HcmHoucShippingState
				, @HcmHoucShippingZip = HcmHoucShippingZip
				, @HcmRemitToLocation =HcmRemitToLocation
				, @HcmContractType = HcmContractType
				, @HcmTermsOfContractType = HcmTermsOfContractType
				, @HcmBillingCycleFrequencyType = HcmBillingCycleFrequencyType
				, @HcmHoucBankCodeNumber = HcmHoucBankCodeNumber
				, @HcmHoucBankAccountNumber = HcmHoucBankAccountNumber
				, @HcmHoucBankName = HcmHoucBankName
				, @HcmHoucBankContact = HcmHoucBankContact
				, @HcmHoucBankAddress1 = HcmHoucBankAddress1
				, @HcmHoucBankAddress2 = HcmHoucBankAddress2
				, @HcmHoucBankCity = HcmHoucBankCity
				, @HcmHoucBankState = HcmHoucBankState
				, @HcmHoucBankZip = HcmHoucBankZip
				, @HcmHoucBankPhone = HcmHoucBankPhone
				, @HcmHoucBankFax = HcmHoucBankFax
				, @HcmHoucBankEmail = HcmHoucBankEmail
				, @HcmHoucStateTaxPercent = HcmHoucStateTaxPercent
				, @HcmHoucLocalTaxPercent = HcmHoucLocalTaxPercent
				, @HcmPayrollProcessingLocationType = HcmPayrollProcessingLocationType
				, @HcmHoucDefaultLunchBreak = HcmHoucDefaultLunchBreak
				, @HcmHoucLunchBreakTrigger = HcmHoucLunchBreakTrigger
				, @HcmHouseCodeType = HcmHouseCodeType
				, @HcmLaborTrackingType = HcmLaborTrackingType
				, @HcmHoucRoundingTimePeriod = HcmHoucRoundingTimePeriod
				, @HcmHoucTimeAndAttendance = HcmHoucTimeAndAttendance
				, @HcmServiceLine = HcmServiceLine
		From TeamfinV2.dbo.HouseCodeImportUpdated_Import
		Where Id = @MinId


/********** ESMv2.dbo.HirNodes	*************/
Begin Try

	EXEC @HirNodeNew = Esmv2.dbo.[HirNodeUpdate] @HirNode, @HirHierarchy, @HirNodeParent, @HirLevel, 
		@HirNodTitle, @HirNodBrief, @HirNodDescription, @HirNodDisplayOrder, @HirNodActive, @ModBy
	--print @HirNodeNew

End Try
Begin Catch
	Select 'Esmv2.dbo.[HirNodes]' As TableName, Error_Line() as ErrorLine, Error_Message() as ErrorMessage
End Catch

--Print @HirNodeNew
/**********************EsmV2.dbo.AppSites****************************/


Begin Try
		Insert Into EsmV2.dbo.AppSites
			(
			 AppSitTitle
			, AppSitAddressLine1
			, AppSitAddressLine2
			, AppSitCity
			, AppStateType
			, AppSitPostalCode
			, AppSitCounty
			, AppIndustryType
			, AppPrimaryBusinessType
			, AppLocationType
			, AppTraumaLevelType
			, AppProfitDesignationType
			, AppGPOType
			, AppSitSpecifyGPO
			, AppOwnershipType
			, AppSitActive
			, AppSitCrtdBy
			, AppSitCrtdAt
			, AppSitModBy
			, AppSitModAt
			, AppSitVersion)
		Values(
			 @AppSitTitle
			, @AppSitAddressLine1
			, @AppSitAddressLine2
			, @AppSitCity
			, @AppStateType
			, @AppSitPostalCode
			, @AppSitCounty
			, @AppIndustryType
			, @AppPrimaryBusinessType
			, @AppLocationType
			, @AppTraumaLevelType
			, @AppProfitDesignationType
			, @AppGPOType
			, @AppSitSpecifyGPO
			, @AppOwnershipType
			, 1
			, @ModBy
			, getDate()
			, @ModBy
			, getDate()
			, 1
		)
End Try
Begin Catch
	Select 'ESMv2.dbo.AppSites' As TableName, Error_Line() As ErrorLine, Error_Message() As ErrorMessage
End Catch

Declare @AppSite int
Select @AppSite = scope_Identity() 
--print @AppSite 
/********** ESMv2.dbo.AppUnits	*************/

Begin Try
Insert Into ESMv2.dbo.AppUnits
	(
		HirNode
		, AppUniBrief
		, AppUniTitle
		, AppUniDescription
		, AppUniDisplayOrder
		, AppUniActive
		, AppUniModBy
		, AppUniModAt
	)
Values
	(
		@HirNodeNew
		, @HirNodBrief
		, @HirNodTitle
		, @HirNodDescription
		, @HirNodDisplayOrder
		, @HirNodActive
		, @ModBy
		, getdate()
	)
End Try
Begin Catch
	Select 'ESMv2.dbo.AppUnits' As TableName, Error_Line() As ErrorLine, Error_Message() As ErrorMessage
End Catch

Declare @AppUnit int
Select @AppUnit = scope_Identity()
--print @AppUnit

/********************ESMv2.dbo.AppSiteUnits******************************/
Begin Try
	Insert into EsmV2.dbo.AppSiteUnits
		(
		AppSite
		, AppUnit
		)
	Values
		(
		@AppSite
		, @AppUnit
		)
End Try
Begin Catch
	Select 'ESMv2.dbo.AppSiteUnits' As TableName, Error_Line() As ErrorLine, Error_Message() As ErrorMessage
End Catch
--print scope_Identity()

/********** TeamFinv2.dbo.HcmHouseCodes	*************/
Begin Try
/*
SElect
	IsNull(@AppUnit, 0)	
	, IsNull(@FscJDECompany, 0)
	, IsNull(@HcmHoucStartDate, 0)
	, IsNull(@HcmServiceType, 0)
	, IsNull(@HcmHoucEnforceLaborControl, 0)
	, IsNull(@HcmHoucManagerName, 0)
	, IsNull(@HcmHoucManagerPhone, 0)
	, IsNull(@HcmHoucManagerCellPhone, 0)
	, IsNull(@HcmHoucManagerFax, 0) 
	, IsNull(@HcmHoucManagerPager, 0)
	, IsNull(@HcmHoucManagerAssistantName, 0)
	, IsNull(@HcmHoucManagerAssistantPhone, 0)
	, IsNull(@HcmHoucClientFirstName, 0)
	, IsNull(@HcmHoucClientLastName, 0)
	, IsNull(@HcmHoucClientTitle, 0)
	, IsNull(@HcmHoucClientPhone, 0)
	, IsNull(@HcmHoucClientFax, 0)
	, IsNull(@HcmHoucClientAssistantName, 0)
	, IsNull(@HcmHoucClientAssistantPhone, 0)
	, IsNull(@HcmHoucManagedEmployees, 0)
	, IsNull(@HcmHoucBedsLicensed, 0)	
	, IsNull(@HcmHoucPatientDays, 0)	
	, IsNull(@HcmHoucAverageDailyCensus, 0)
	, IsNull(@HcmHoucAnnualDischarges, 0)
	, IsNull(@HcmHoucAverageBedTurnaroundTime, 0)
	, IsNull(@HcmHoucNetCleanableSqft, 0)
	, IsNull(@HcmHoucAverageLaundryLbs, 0)
	, IsNull(@HcmHoucCrothallEmployees, 0)
	, IsNull(@HcmHoucBedsActive, 1)
	, IsNull(@HcmHoucAdjustedPatientDaysBudgeted, 0)
	, IsNull(@HcmHoucAnnualTransfers, 0)
	, IsNull(@HcmHoucAnnualTransports, 0)
	, IsNull(@HcmHoucShippingAddress1, 0)
	, IsNull(@HcmHoucShippingAddress2, 0)
	, IsNull(@HcmHoucShippingCity, 0)
	, IsNull(@HcmHoucShippingState, 0)
	, IsNull(@HcmHoucShippingZip, 0)
	, IsNull(@HcmRemitToLocation, 0)
	, IsNull(@HcmContractType, 0)
	, IsNull(@HcmTermsOfContractType, 0)	as contrac
	, IsNull(@HcmBillingCycleFrequencyType, 0)
	, IsNull(@HcmHoucBankCodeNumber, '')
	, IsNull(@HcmHoucBankAccountNumber, 0)
	, IsNull(@HcmHoucBankName, 0)
	, IsNull(@HcmHoucBankContact, 0)
	, IsNull(@HcmHoucBankAddress1, 0)
	, IsNull(@HcmHoucBankAddress2, 0)
	, IsNull(@HcmHoucBankCity, '')
	, IsNull(@HcmHoucBankState, 0)
	, IsNull(@HcmHoucBankZip, '')
	, IsNull(@HcmHoucBankPhone, '')
	, IsNull(@HcmHoucBankFax, '') as Fax
	, IsNull(@HcmHoucBankEmail, '') 
	, IsNull(@HcmHoucStateTaxPercent, 0)
	, IsNull(@HcmHoucLocalTaxPercent, 0)
	, IsNull(@HcmPayrollProcessingLocationType , 0 )
	, IsNull(@HcmHoucDefaultLunchBreak, 0)
	, IsNull(@HcmHoucLunchBreakTrigger, 0)
	, IsNull(@HcmHouseCodeType, 0)
	, IsNull(@HcmLaborTrackingType, 0)
	, IsNull(@HcmHoucRoundingTimePeriod, 0)
	, IsNull(@HcmHoucTimeAndAttendance, 0)
*/
	Insert Into TeamFinv2.dbo.HcmHouseCodes
	(AppUnit
	, FscJDECompany
	, HcmHoucStartDate
	, HcmServiceType
	, HcmHoucEnforceLaborControl
	, HcmHoucManagerName
	, HcmHoucManagerPhone
	, HcmHoucManagerCellPhone
	, HcmHoucManagerFax
	, HcmHoucManagerPager
	, HcmHoucManagerAssistantName
	, HcmHoucManagerAssistantPhone
	, HcmHoucClientFirstName
	, HcmHoucClientLastName
	, HcmHoucClientTitle
	, HcmHoucClientPhone
	, HcmHoucClientFax
	, HcmHoucClientAssistantName
	, HcmHoucClientAssistantPhone
	, HcmHoucManagedEmployees
	, HcmHoucBedsLicensed	
	, HcmHoucPatientDays	
	, HcmHoucAverageDailyCensus
	, HcmHoucAnnualDischarges
	, HcmHoucAverageBedTurnaroundTime
	, HcmHoucNetCleanableSqft
	, HcmHoucAverageLaundryLbs
	, HcmHoucCrothallEmployees
	, HcmHoucBedsActive
	, HcmHoucAdjustedPatientDaysBudgeted
	, HcmHoucAnnualTransfers
	, HcmHoucAnnualTransports
	, HcmHoucShippingAddress1
	, HcmHoucShippingAddress2
	, HcmHoucShippingCity
	, HcmHoucShippingState
	, HcmHoucShippingZip
	, HcmRemitToLocation
	, HcmContractType
	, HcmTermsOfContractType	
	, HcmBillingCycleFrequencyType
	, HcmHoucBankCodeNumber
	, HcmHoucBankAccountNumber
	, HcmHoucBankName
	, HcmHoucBankContact
	, HcmHoucBankAddress1
	, HcmHoucBankAddress2
	, HcmHoucBankCity
	, HcmHoucBankState
	, HcmHoucBankZip
	, HcmHoucBankPhone
	, HcmHoucBankFax
	, HcmHoucBankEmail
	, HcmHoucStateTaxPercent
	, HcmHoucLocalTaxPercent
	, HcmPayrollProcessingLocationType
	, HcmHoucDefaultLunchBreak
	, HcmHoucLunchBreakTrigger
	, HcmHouseCodeType
	, HcmLaborTrackingType
	, HcmHoucRoundingTimePeriod
	, HcmHoucTimeAndAttendance
	, HcmHoucModBy
	, HcmHoucModAt
	)
Values
	(
	IsNull(@AppUnit, 0)	
	, IsNull(@FscJDECompany, '')
	, IsNull(@HcmHoucStartDate, '')
	, IsNull(@HcmServiceType, '')
	, IsNull(@HcmHoucEnforceLaborControl, '')
	, IsNull(@HcmHoucManagerName, '')
	, IsNull(@HcmHoucManagerPhone, '')
	, IsNull(@HcmHoucManagerCellPhone, '')
	, IsNull(@HcmHoucManagerFax, '') 
	, IsNull(@HcmHoucManagerPager, '')
	, IsNull(@HcmHoucManagerAssistantName, '')
	, IsNull(@HcmHoucManagerAssistantPhone, '')
	, IsNull(@HcmHoucClientFirstName, '')
	, IsNull(@HcmHoucClientLastName, '')
	, IsNull(@HcmHoucClientTitle, '')
	, IsNull(@HcmHoucClientPhone, '')
	, IsNull(@HcmHoucClientFax, '')
	, IsNull(@HcmHoucClientAssistantName, '')
	, IsNull(@HcmHoucClientAssistantPhone, '')
	, IsNull(@HcmHoucManagedEmployees, '')
	, IsNull(@HcmHoucBedsLicensed, '')	
	, IsNull(@HcmHoucPatientDays, '')	
	, IsNull(@HcmHoucAverageDailyCensus, '')
	, IsNull(@HcmHoucAnnualDischarges, '')
	, IsNull(@HcmHoucAverageBedTurnaroundTime, '')
	, IsNull(@HcmHoucNetCleanableSqft, '')
	, IsNull(@HcmHoucAverageLaundryLbs, '')
	, IsNull(@HcmHoucCrothallEmployees, '')
	, IsNull(@HcmHoucBedsActive, 1)
	, IsNull(@HcmHoucAdjustedPatientDaysBudgeted, '')
	, IsNull(@HcmHoucAnnualTransfers, '')
	, IsNull(@HcmHoucAnnualTransports, '')
	, IsNull(@HcmHoucShippingAddress1, '')
	, IsNull(@HcmHoucShippingAddress2, '')
	, IsNull(@HcmHoucShippingCity, '')
	, IsNull(@HcmHoucShippingState, '')
	, IsNull(@HcmHoucShippingZip, '')
	, IsNull(@HcmRemitToLocation, '')
	, IsNull(@HcmContractType, '')
	, IsNull(@HcmTermsOfContractType, '')	
	, IsNull(@HcmBillingCycleFrequencyType, '')
	, IsNull(@HcmHoucBankCodeNumber, '')
	, IsNull(@HcmHoucBankAccountNumber, '')
	, IsNull(@HcmHoucBankName, '')
	, IsNull(@HcmHoucBankContact, '')
	, IsNull(@HcmHoucBankAddress1, '')
	, IsNull(@HcmHoucBankAddress2, '')
	, IsNull(@HcmHoucBankCity, '')
	, IsNull(@HcmHoucBankState, '')
	, IsNull(@HcmHoucBankZip, '')
	, IsNull(@HcmHoucBankPhone, '')
	, IsNull(@HcmHoucBankFax, '')
	, IsNull(@HcmHoucBankEmail, '') 
	, IsNull(@HcmHoucStateTaxPercent, 0)
	, IsNull(@HcmHoucLocalTaxPercent, 0)
	, IsNull(@HcmPayrollProcessingLocationType , 0 )
	, IsNull(@HcmHoucDefaultLunchBreak, 0)
	, IsNull(@HcmHoucLunchBreakTrigger, 0)
	, IsNull(@HcmHouseCodeType, 0)
	, IsNull(@HcmLaborTrackingType, 0)
	, IsNull(@HcmHoucRoundingTimePeriod, 0)
	, IsNull(@HcmHoucTimeAndAttendance, 0)
	, @ModBy
	, getdate()
	)

End Try

Begin Catch	
	Select 'TeamFinv2.dbo.HcmHouseCodes' As TableName, Error_Line() As ErrorLine, Error_Message() As ErrorMessage
End Catch

Declare @HcmHouseCode int
Select @HcmHouseCode = Max(HcmHouseCode) From HcmHouseCodes
--print scope_Identity()

Begin Try

	Insert Into TeamFinv2.dbo.HcmHouseCodeJobs
		(
		HcmHouseCode
		, HcmJob
		, HcmHoucjActive
		, HcmHoucjModBy
		, HcmHoucjModAt
		)
	Values
		(
		@HcmHouseCode
		, 1
		, 1
		, @ModBy
		, getdate()
		)

End Try

Begin Catch
	Select 'TeamFinv2.dbo.HcmHouseCodeJobs' As TableName, Error_Line() As ErrorLine, Error_Message() As ErrorMessage
End Catch


Set @MinId = @MinId + 1
if (@MinId  > @MaxId) Break
End


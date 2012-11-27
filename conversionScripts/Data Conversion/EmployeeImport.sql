Set NoCount ON

Declare @MinId int, @MaxId int
, @ModBy as varchar(200)
, @HirNode as varchar(200)
, @PplPeoBrief as varchar(200)
, @PplPeoFirstName as varchar(200)
, @PplPeoLastName as varchar(200)
, @PplPeoMiddleName as varchar(200)
, @PplPeoAddressLine1 as varchar(200)
, @PplPeoAddressLine2 as varchar(200)
, @PplPeoCity as varchar(200)
, @AppStateType as varchar(200)
, @PplPeoPostalCode as varchar(200)
, @PplPeoHomePhone as varchar(200)
, @PplPeoFax as varchar(200)
, @PplPeoCellPhone as varchar(200)
, @PplPeoEmail as varchar(200)
, @PplPeoPager as varchar(200)
, @PplPeoActive as varchar(200)
, @PplPeoEmployeeHouseCodeUpdated as varchar(200)
, @EmpEmpgSSN as varchar(200)
, @EmpStatusType as varchar(200)
, @PayPayrollCompany as varchar(200)
, @EmpDeviceGroupType as varchar(200)
, @EmpEmpgExempt as varchar(200)
, @EmpJobCodeType as varchar(200)
, @EmpEmpgHourly as varchar(200)
, @EmpEmpgHireDate as varchar(200)
, @EmpRateChangeReasonType as varchar(200)
, @EmpEmpgRateChangeDate as varchar(200)
, @EmpEmpgSeniorityDate as varchar(200)
, @EmpEmpgTerminationDate as varchar(200)
, @EmpTerminationReasonType as varchar(200)
, @EmpWorkShift as varchar(200)
, @EmpEmpgBenefitsPercentage as varchar(200)
, @EmpEmpgScheduledHours as varchar(200)
, @EmpEmpgUnion as varchar(200)
, @EmpEmpgCrothallEmployee as varchar(200)
, @EmpEmpgEmployeeNumber as varchar(200)
, @EmpEmpgAlternatePayRateA as varchar(200)
, @EmpEmpgAlternatePayRateB as varchar(200)
, @EmpEmpgAlternatePayRateC as varchar(200)
, @EmpEmpgAlternatePayRateD as varchar(200)
, @EmpEmpgPTOStartDate as varchar(200)
, @EmpEmpgPTOAccruedHourEntryAutomatic as varchar(200)
, @EmpEmpgOriginalHireDate as varchar(200)
, @EmpEmpgEffectiveDate as varchar(200)
, @EmpUnionType as varchar(200)
, @EmpStatusCategoryType as varchar(200)
, @EmpEmpgPayRate as varchar(200)
, @EmpEmpgPayRateEnteredBy as varchar(200)
, @EmpEmpgPayRateEnteredAt as varchar(200)
, @EmpEmpgPrevPayRate as varchar(200)
, @EmpEmpgPrevPayRateEnteredBy as varchar(200)
, @EmpEmpgPrevPayRateEnteredAt as varchar(200)
, @EmpEmpgPrevPrevPayRate as varchar(200)
, @EmpEmpgPrevPrevPayRateEnteredBy as varchar(200)
, @EmpEmpgPrevPrevPayRateEnteredAt as varchar(200)
, @EmpGenderType as varchar(200)
, @EmpEthnicityType as varchar(200)
, @EmpEmpgBirthDate as varchar(200)
, @EmpEmpgReviewDate as varchar(200)
, @EmpEmpgWorkPhone as varchar(200)
, @EmpEmpgWorkPhoneExt as varchar(200)
, @EmpEmpgBackGroundCheckDate as varchar(200)
, @EmpEmpgFederalExemptions as varchar(200)
, @EmpFederalAdjustmentType as varchar(200)
, @EmpMaritalStatusFederalTaxType as varchar(200)
, @EmpEmpgFederalAdjustmentAmount as varchar(200)
, @EmpEmpgPrimaryState as varchar(200)
, @EmpEmpgSecondaryState as varchar(200)
, @EmpMaritalStatusStateTaxTypePrimary as varchar(200)
, @EmpMaritalStatusStateTaxTypeSecondary as varchar(200)
, @EmpEmpgStateExemptions as varchar(200)
, @EmpStateAdjustmentType as varchar(200)
, @EmpEmpgStateAdjustmentAmount as varchar(200)
, @EmpSDIAdjustmentType as varchar(200)
, @EmpEmpgSDIRate as varchar(200)
, @EmpLocalTaxAdjustmentType as varchar(200)
, @EmpEmpgLocalTaxAdjustmentAmount as varchar(200)
, @EmpEmpgLocalTaxCode1 as varchar(200)
, @EmpEmpgLocalTaxCode2 as varchar(200)
, @EmpEmpgLocalTaxCode3 as varchar(200)
, @EmpEmpgPayrollStatus as varchar(200)
, @EmpEmpgPreviousPayrollStatus as varchar(200)
, @PayPayFrequencyType as varchar(200)
, @HcmHouseCodeJob as varchar(200)
, @EmpI9Type as varchar(200)
, @EmpVetType as varchar(200)
, @EmpSeparationCode as varchar(200)
, @EmpJobStartReasonType as varchar(200)
, @EmpEmpgEffectiveDateJob as varchar(200)
, @EmpEmpgEffectiveDateCompensation as varchar(200)
, @EmpMaritalStatusType as varchar(200)
, @pplPerson int
, @personBrief as varchar(200)
, @HcmHouseCode int

Set @ModBy = 'compass-usa\data conversion'

Select  @MinId = Min(ID), @MaxId = Max(Id) From TeamFinV2_DC.dbo.[Employee_Import] 


While(1=1)
Begin	

	Select 
	/****************************EsmV2_DC.dbo.PplPeople***************************/
		@HirNode = HirNode
		, @PplPeoBrief = PplPeoBrief
		, @PplPeoFirstName = PplPeoFirstName
		, @PplPeoLastName = PplPeoLastName
		, @PplPeoMiddleName = PplPeoMiddleName
		, @PplPeoAddressLine1 = PplPeoAddressLine1
		, @PplPeoAddressLine2 = PplPeoAddressLine2
		, @PplPeoCity = PplPeoCity
		, @AppStateType = AppStateType
		, @PplPeoPostalCode = PplPeoPostalCode
		, @PplPeoHomePhone = PplPeoHomePhone
		, @PplPeoFax = PplPeoFax
		, @PplPeoCellPhone = PplPeoCellPhone
		, @PplPeoEmail = PplPeoEmail
		, @PplPeoPager = PplPeoPager
		, @PplPeoActive = PplPeoActive
		, @PplPeoEmployeeHouseCodeUpdated = PplPeoEmployeeHouseCodeUpdated

/*************************TeamFinV2_DC.dbo.EmpEmployeeGenerals*****************************/

		, @EmpEmpgSSN = EmpEmpgSSN
		, @EmpStatusType = EmpStatusType
		, @PayPayrollCompany = PayPayrollCompany
		, @EmpDeviceGroupType = EmpDeviceGroupType
		, @EmpEmpgExempt = EmpEmpgExempt
		, @EmpJobCodeType = EmpJobCodeType
		, @EmpEmpgHourly = EmpEmpgHourly
		, @EmpEmpgHireDate = EmpEmpgHireDate
		, @EmpRateChangeReasonType = EmpRateChangeReasonType
		, @EmpEmpgRateChangeDate = EmpEmpgRateChangeDate
		, @EmpEmpgSeniorityDate = EmpEmpgSeniorityDate
		, @EmpEmpgTerminationDate = EmpEmpgTerminationDate
		, @EmpTerminationReasonType = EmpTerminationReasonType
		, @EmpWorkShift = EmpWorkShift
		, @EmpEmpgBenefitsPercentage = EmpEmpgBenefitsPercentage
		, @EmpEmpgScheduledHours = EmpEmpgScheduledHours
		, @EmpEmpgUnion = EmpEmpgUnion
		, @EmpEmpgCrothallEmployee = EmpEmpgCrothallEmployee
		, @EmpEmpgEmployeeNumber = EmpEmpgEmployeeNumber
		, @EmpEmpgAlternatePayRateA = EmpEmpgAlternatePayRateA
		, @EmpEmpgAlternatePayRateB = EmpEmpgAlternatePayRateB
		, @EmpEmpgAlternatePayRateC = EmpEmpgAlternatePayRateC
		, @EmpEmpgAlternatePayRateD = EmpEmpgAlternatePayRateD
		, @EmpEmpgPTOStartDate = EmpEmpgPTOStartDate
		, @EmpEmpgPTOAccruedHourEntryAutomatic = EmpEmpgPTOAccruedHourEntryAutomatic
		, @EmpEmpgOriginalHireDate = EmpEmpgOriginalHireDate
		, @EmpEmpgEffectiveDate = EmpEmpgEffectiveDate
		, @EmpUnionType = EmpUnionType
		, @EmpStatusCategoryType = EmpStatusCategoryType
		, @EmpEmpgPayRate = EmpEmpgPayRate
		, @EmpEmpgPayRateEnteredBy = EmpEmpgPayRateEnteredBy
		, @EmpEmpgPayRateEnteredAt = EmpEmpgPayRateEnteredAt
		, @EmpEmpgPrevPayRate = EmpEmpgPrevPayRate
		, @EmpEmpgPrevPayRateEnteredBy = EmpEmpgPrevPayRateEnteredBy
		, @EmpEmpgPrevPayRateEnteredAt = EmpEmpgPrevPayRateEnteredAt
		, @EmpEmpgPrevPrevPayRate = EmpEmpgPrevPrevPayRate
		, @EmpEmpgPrevPrevPayRateEnteredBy = EmpEmpgPrevPrevPayRateEnteredBy
		, @EmpEmpgPrevPrevPayRateEnteredAt = EmpEmpgPrevPrevPayRateEnteredAt
		, @EmpGenderType = EmpGenderType
		, @EmpEthnicityType = EmpEthnicityType
		, @EmpEmpgBirthDate = EmpEmpgBirthDate
		, @EmpEmpgReviewDate = EmpEmpgReviewDate
		, @EmpEmpgWorkPhone = EmpEmpgWorkPhone
		, @EmpEmpgWorkPhoneExt = EmpEmpgWorkPhoneExt
		, @EmpEmpgBackGroundCheckDate = EmpEmpgBackGroundCheckDate
		, @EmpEmpgFederalExemptions = EmpEmpgFederalExemptions
		, @EmpFederalAdjustmentType = EmpFederalAdjustmentType
		, @EmpMaritalStatusFederalTaxType = EmpMaritalStatusFederalTaxType
		, @EmpEmpgFederalAdjustmentAmount= EmpEmpgFederalAdjustmentAmount
		, @EmpEmpgPrimaryState = EmpEmpgPrimaryState
		, @EmpEmpgSecondaryState = EmpEmpgSecondaryState
		, @EmpMaritalStatusStateTaxTypePrimary = EmpMaritalStatusStateTaxTypePrimary
		, @EmpMaritalStatusStateTaxTypeSecondary = EmpMaritalStatusStateTaxTypeSecondary
		, @EmpEmpgStateExemptions = EmpEmpgStateExemptions
		, @EmpStateAdjustmentType = EmpStateAdjustmentType
		, @EmpEmpgStateAdjustmentAmount = EmpEmpgStateAdjustmentAmount
		, @EmpSDIAdjustmentType = EmpSDIAdjustmentType
		, @EmpEmpgSDIRate = EmpEmpgSDIRate
		, @EmpLocalTaxAdjustmentType = EmpLocalTaxAdjustmentType
		, @EmpEmpgLocalTaxAdjustmentAmount = EmpEmpgLocalTaxAdjustmentAmount
		, @EmpEmpgLocalTaxCode1 = EmpEmpgLocalTaxCode1
		, @EmpEmpgLocalTaxCode2 = EmpEmpgLocalTaxCode2
		, @EmpEmpgLocalTaxCode3 = EmpEmpgLocalTaxCode3
		, @EmpEmpgPayrollStatus = EmpEmpgPayrollStatus
		, @EmpEmpgPreviousPayrollStatus = EmpEmpgPreviousPayrollStatus
		, @PayPayFrequencyType = PayPayFrequencyType
		, @HcmHouseCodeJob = HcmHouseCodeJob
		, @EmpI9Type = EmpI9Type
		, @EmpVetType = EmpVetType
		, @EmpSeparationCode = EmpSeparationCode
		, @EmpJobStartReasonType = EmpJobStartReasonType
		, @EmpEmpgEffectiveDateJob = EmpEmpgEffectiveDateJob
		, @EmpEmpgEffectiveDateCompensation = EmpEmpgEffectiveDateCompensation
		, @EmpMaritalStatusType = EmpMaritalStatusType

	From TeamFinV2_DC.dbo.[Employee_Import]
	Where ID = @MinId

/****************************EsmV2.dbo.PplPeople***************************/
	Begin Try

		Insert into esmv2.[dbo].[pplPeople]
				(HirNode
				,[pplPeoBrief]
				,[pplPeoFirstName]
				,[pplPeoLastName]
				,[pplPeoMiddleName]
				,[pplPeoAddressLine1]
				,[pplPeoAddressLine2]
				,[pplPeoCity]
				,[AppStateType] 
				,[pplPeoPostalCode]
				,[pplPeoHomePhone]
				,[pplPeoFax] 
				,[pplPeoCellPhone]
				,[pplPeoEmail] 
				,[pplPeoPager] 
				,[pplPeoActive]
				,[pplPeoModBy]
				,[pplPeoModAt]
				, PplPeoEmployeeHouseCodeUpdated
				)
		Values
				(@HirNode
				,left(@PplPeoFirstName + @PplPeoLastName, 16)
				,isnull(@PplPeoFirstName, '')
				,isnull(@PplPeoLastName, '')
				,isnull(@PplPeoMiddleName,'')
				,isnull(@PplPeoAddressLine1,'')
				,isnull(@PplPeoAddressLine2, '')
				,isnull(@PplPeoCity,'')
				,@AppStateType
				,isnull(@PplPeoPostalCode,'')
				,isnull(@PplPeoHomePhone,'')
				,isnull(@PplPeoFax,'')
				,isnull(@PplPeoCellPhone,'')
				,isnull(@PplPeoEmail,'')
				,isnull(@PplPeoPager,'')
				,1
				,@ModBy
				,getdate()
				, @PplPeoEmployeeHouseCodeUpdated
				)

	End Try
Begin Catch
	Select 'Esmv2.dbo.[HirNodes]' As TableName, Error_Line() as ErrorLine, Error_Message() as ErrorMessage
End Catch

		Set @pplPerson = (SElect max(PplPerson) From esmv2.[dbo].[pplPeople] ) -- @@Identity
		
		SElect @personBrief = left(@PplPeoFirstName + @PplPeoLastName, 16) From esmv2.[dbo].[pplPeople] Where PplPerson = @PplPerson

		Select @HcmHouseCode = HcmHouseCode From TeamfinV2.dbo.HcmHouseCodes hcm
			Inner Join EsmV2.dbo.AppUnits EAU On EAU.AppUnit = Hcm.AppUnit
			Inner Join EsmV2.dbo.HirNodes hir On Hir.HirNode = EAU.HirNode
		Where Hir.HirNode = @HirNode
		Declare @EmployeeNumberNew int
		Exec  @EmployeeNumberNew = [EmpEmployeeNumberRangeSelect] 1
		--print @EmployeeNumberNew

Begin Try
/*
Select
isnull(@pplPerson, 0)
			, @personBrief
			, isnull(@EmpEmpgSSN, '') 
			, isnull(@EmpStatusType, 0)
			, isnull(@PayPayrollCompany, 0) 
			, isnull(@EmpDeviceGroupType , 0)
			, isnull(@EmpEmpgExempt, 0) 
			, isnull(@EmpJobCodeType, 0)
			, isnull(@EmpEmpgHourly, 0)
			, isnull(@EmpEmpgHireDate, '1/1/1900') 
			, isnull(@EmpRateChangeReasonType, 0) 
			, isnull(@EmpEmpgRateChangeDate, '1/1/1900') 
			, isnull(@EmpEmpgSeniorityDate, '1/1/1900')
			, isnull(@EmpEmpgTerminationDate , '1/1/1900')
			, @EmpTerminationReasonType 
			, @EmpWorkShift 
			, @EmpEmpgBenefitsPercentage 
			, @EmpEmpgScheduledHours 
			, @EmpEmpgUnion 
			, @EmpEmpgCrothallEmployee 
			, IsNull(@EmpEmpgEmployeeNumber, 0) 

			, @EmpEmpgPayRate 
			, @EmpEmpgPayRateEnteredBy 
			, @EmpEmpgPayRateEnteredAt 
			, @EmpEmpgPrevPayRate 
			, @EmpEmpgPrevPayRateEnteredBy 
			, @EmpEmpgPrevPayRateEnteredAt 
			, @EmpEmpgPrevPrevPayRate 
			, @EmpEmpgPrevPrevPayRateEnteredBy 
			, @EmpEmpgPrevPrevPayRateEnteredAt 


			, IsNull(@EmpEmpgAlternatePayRateA, '') As EmpEmpgAlternatePayRateA
			, IsNull(@EmpEmpgAlternatePayRateB, '') As EmpEmpgAlternatePayRateB
			, @EmpEmpgAlternatePayRateC /*
			, @EmpEmpgAlternatePayRateD 
			, @EmpEmpgPTOStartDate 
			, @EmpEmpgPTOAccruedHourEntryAutomatic 
			, @EmpEmpgOriginalHireDate 
			, @EmpEmpgEffectiveDate 
			, @EmpUnionType 
			, @EmpStatusCategoryType 
			
			, @EmpGenderType 
			, @EmpEthnicityType 
			, @EmpEmpgBirthDate 
			, @EmpEmpgReviewDate 
			, @EmpEmpgWorkPhone 
			, @EmpEmpgWorkPhoneExt 
			, @EmpEmpgBackGroundCheckDate 
			, @EmpEmpgFederalExemptions 
			, @EmpFederalAdjustmentType 
			, @EmpMaritalStatusFederalTaxType 
			, @EmpEmpgFederalAdjustmentAmount
			, @EmpEmpgPrimaryState 
			, @EmpEmpgSecondaryState 
			, @EmpMaritalStatusStateTaxTypePrimary 
			, @EmpMaritalStatusStateTaxTypeSecondary 
			, @EmpEmpgStateExemptions 
			, @EmpStateAdjustmentType 
			, @EmpEmpgStateAdjustmentAmount 
			, @EmpSDIAdjustmentType 
			, @EmpEmpgSDIRate 
			, @EmpLocalTaxAdjustmentType 
			, @EmpEmpgLocalTaxAdjustmentAmount 
			, @EmpEmpgLocalTaxCode1 
			, @EmpEmpgLocalTaxCode2 
			, @EmpEmpgLocalTaxCode3 
			, @EmpEmpgPayrollStatus 
			, @EmpEmpgPreviousPayrollStatus 
			, 1
			, @PayPayFrequencyType 
			, @HcmHouseCodeJob 
			, @EmpI9Type 
			, @EmpVetType 
			, @EmpSeparationCode 
			, @EmpJobStartReasonType 
			, @EmpEmpgEffectiveDateJob 
			, @EmpEmpgEffectiveDateCompensation 
			, @EmpMaritalStatusType */
			, @ModBy
			, getDate()
			, @ModBy
			, getdate()
			, '1'
			, 1
			, @HcmHouseCode
			
*/
	Insert Into TeamfinV2.dbo.EmpEmployeeGenerals
			(			
			PplPerson
			, EmpEmpgBrief
			, EmpEmpgSSN
			, EmpStatusType
			, PayPayrollCompany
			, EmpDeviceGroupType
			, EmpEmpgExempt
			, EmpJobCodeType
			, EmpEmpgHourly
			, EmpEmpgHireDate
			, EmpRateChangeReasonType
			, EmpEmpgRateChangeDate
			, EmpEmpgSeniorityDate
			, EmpEmpgTerminationDate
			, EmpTerminationReasonType
			, EmpWorkShift
			, EmpEmpgBenefitsPercentage
			, EmpEmpgScheduledHours
			, EmpEmpgUnion
			, EmpEmpgCrothallEmployee
			, EmpEmpgEmployeeNumber

			, EmpEmpgPayRate
			, EmpEmpgPayRateEnteredBy
			, EmpEmpgPayRateEnteredAt
			, EmpEmpgPrevPayRate
			, EmpEmpgPrevPayRateEnteredBy
			, EmpEmpgPrevPayRateEnteredAt
			, EmpEmpgPrevPrevPayRate
			, EmpEmpgPrevPrevPayRateEnteredBy
			, EmpEmpgPrevPrevPayRateEnteredAt


			, EmpEmpgAlternatePayRateA
			, EmpEmpgAlternatePayRateB
			, EmpEmpgAlternatePayRateC
			, EmpEmpgAlternatePayRateD
			, EmpEmpgPTOStartDate
			, EmpEmpgPTOAccruedHourEntryAutomatic
			, EmpEmpgOriginalHireDate
			, EmpEmpgEffectiveDate
			, EmpUnionType
			, EmpStatusCategoryType
			
			, EmpGenderType
			, EmpEthnicityType
			, EmpEmpgBirthDate
			, EmpEmpgReviewDate
			, EmpEmpgWorkPhone
			, EmpEmpgWorkPhoneExt
			, EmpEmpgBackGroundCheckDate
			, EmpEmpgFederalExemptions
			, EmpFederalAdjustmentType
			, EmpMaritalStatusFederalTaxType
			, EmpEmpgFederalAdjustmentAmount
			, EmpEmpgPrimaryState
			, EmpEmpgSecondaryState
			, EmpMaritalStatusStateTaxTypePrimary
			, EmpMaritalStatusStateTaxTypeSecondary
			, EmpEmpgStateExemptions
			, EmpStateAdjustmentType
			, EmpEmpgStateAdjustmentAmount
			, EmpSDIAdjustmentType
			, EmpEmpgSDIRate
			, EmpLocalTaxAdjustmentType
			, EmpEmpgLocalTaxAdjustmentAmount
			, EmpEmpgLocalTaxCode1
			, EmpEmpgLocalTaxCode2
			, EmpEmpgLocalTaxCode3
			, EmpEmpgPayrollStatus
			, EmpEmpgPreviousPayrollStatus
			, AppTransactionStatusType
			, PayPayFrequencyType
			, HcmHouseCodeJob
			, EmpI9Type
			, EmpVetType
			, EmpSeparationCode
			, EmpJobStartReasonType
			, EmpEmpgEffectiveDateJob
			, EmpEmpgEffectiveDateCompensation
			, EmpMaritalStatusType

			, EmpEmpgCrtdBy
			, EmpEmpgCrtdAt
			, EmpEmpgModBy
			, EmpEmpgModAt
			, EmpEmpgVersion
			, EmpEmpgActive
			, HcmHouseCode

			)
	Values
			(
			 isnull(@pplPerson, 0)
			, @personBrief
			, isnull(@EmpEmpgSSN, '') 
			, isnull(@EmpStatusType, 0)
			, isnull(@PayPayrollCompany, 0) 
			, isnull(@EmpDeviceGroupType , 0)
			, isnull(@EmpEmpgExempt, 0) 
			, isnull(@EmpJobCodeType, 0)
			, isnull(@EmpEmpgHourly, 0)
			, isnull(@EmpEmpgHireDate, '1/1/1900') 
			, isnull(@EmpRateChangeReasonType, 0) 
			, isnull(@EmpEmpgRateChangeDate, '1/1/1900') 
			, isnull(@EmpEmpgSeniorityDate, '1/1/1900')
			, isnull(@EmpEmpgTerminationDate , '1/1/1900')
			, @EmpTerminationReasonType 
			, @EmpWorkShift 
			, @EmpEmpgBenefitsPercentage 
			, @EmpEmpgScheduledHours 
			, @EmpEmpgUnion 
			, @EmpEmpgCrothallEmployee 
			, @EmployeeNumberNew

			, @EmpEmpgPayRate 
			, @EmpEmpgPayRateEnteredBy 
			, @EmpEmpgPayRateEnteredAt 
			, @EmpEmpgPrevPayRate 
			, @EmpEmpgPrevPayRateEnteredBy 
			, @EmpEmpgPrevPayRateEnteredAt 
			, @EmpEmpgPrevPrevPayRate 
			, @EmpEmpgPrevPrevPayRateEnteredBy 
			, @EmpEmpgPrevPrevPayRateEnteredAt 


			, IsNull(@EmpEmpgAlternatePayRateA, '') 
			, IsNull(@EmpEmpgAlternatePayRateB, '')
			, @EmpEmpgAlternatePayRateC  
			, @EmpEmpgAlternatePayRateD 
			, @EmpEmpgPTOStartDate 
			, @EmpEmpgPTOAccruedHourEntryAutomatic 
			, @EmpEmpgOriginalHireDate 
			, @EmpEmpgEffectiveDate 
			, @EmpUnionType 
			, @EmpStatusCategoryType 
			
			, @EmpGenderType 
			, @EmpEthnicityType 
			, @EmpEmpgBirthDate 
			, @EmpEmpgReviewDate 
			, @EmpEmpgWorkPhone 
			, @EmpEmpgWorkPhoneExt 
			, @EmpEmpgBackGroundCheckDate 
			, @EmpEmpgFederalExemptions 
			, @EmpFederalAdjustmentType 
			, @EmpMaritalStatusFederalTaxType 
			, @EmpEmpgFederalAdjustmentAmount
			, @EmpEmpgPrimaryState 
			, @EmpEmpgSecondaryState 
			, @EmpMaritalStatusStateTaxTypePrimary 
			, @EmpMaritalStatusStateTaxTypeSecondary 
			, @EmpEmpgStateExemptions 
			, @EmpStateAdjustmentType 
			, @EmpEmpgStateAdjustmentAmount 
			, @EmpSDIAdjustmentType 
			, @EmpEmpgSDIRate 
			, @EmpLocalTaxAdjustmentType 
			, @EmpEmpgLocalTaxAdjustmentAmount 
			, @EmpEmpgLocalTaxCode1 
			, @EmpEmpgLocalTaxCode2 
			, @EmpEmpgLocalTaxCode3 
			, @EmpEmpgPayrollStatus 
			, @EmpEmpgPreviousPayrollStatus 
			, 1
			, @PayPayFrequencyType 
			, @HcmHouseCodeJob 
			, @EmpI9Type 
			, @EmpVetType 
			, @EmpSeparationCode 
			, @EmpJobStartReasonType 
			, @EmpEmpgEffectiveDateJob 
			, @EmpEmpgEffectiveDateCompensation 
			, @EmpMaritalStatusType 
			, @ModBy
			, getDate()
			, @ModBy
			, getdate()
			, '1'
			, 1
			, @HcmHouseCode

			)
End Try
Begin Catch
	Select 'TeamfinV2.dbo.EmpEmplyeeGenerals' As TableName, Error_Line() as ErrorLine
	, Error_Message() as ErrorMessage
End Catch

Set @MinId = @MinId + 1
if (@MinId > @MaxId) break
End
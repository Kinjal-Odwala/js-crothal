/*
Truncate Table [TeamFinv2_DC].[dbo].EmpEmployeeGenerals
Truncate Table [Esmv2_DC].[dbo].PplPersonRoles
Truncate Table [Esmv2_DC].[dbo].PplPeople

Select Top 100 * From [TeamFinv2_DC].[dbo].EmpEmployeeGenerals
Select Top 100 * From [Esmv2_DC].[dbo].PplPersonRoles
Select Top 100 * From [Esmv2_DC].[dbo].PplPeople

Select Top 100 * From [TeamFin].[dbo].Employees Order By Id Desc
*/

Set NoCount On

Declare
	@Id int, @EmployeeNum int, @bCrothallEmp bit, @bActive bit, @bExempt bit 
	, @SSN varchar(11), @FName varchar(25), @MInitial varchar(1), @LName varchar(25)
	, @CeridianCompany varchar(50), @JobCode varchar(25), @WorkShift varchar(50)
	, @bHourly bit, @PayRate money, @HireDate datetime 
	, @HireComments varchar(2500), @EnteredBy varchar(25), @EnteredAt datetime
	, @Site varchar(255), @Company varchar(10), @HouseCode varchar(10)
	, @Status smallint, @TermDate datetime, @TermComments varchar(2500)
	, @MaritalStatus varchar(1), @Sex varchar(1), @Address1 varchar(50)
	, @Address2 varchar(50), @Address3 varchar(100), @City varchar(50)
	, @State varchar(50), @Zip varchar(50), @PayrollStatus varchar(5) 
	, @PrevPayrollStatus varchar(5), @RateCode varchar(50)
	, @FedExemptions int, @FedAdjCode varchar(1), @FedAdj varchar(50)
	, @StateExemptions int, @StateAdjCode varchar(4), @StateAdj varchar(50)
	, @PriTaxState varchar(50), @PriLocAuth varchar(50)
	, @SecTaxState varchar(50), @SecLocAuth varchar(50)
	, @PayFreq varchar(50), @LocalTax varchar(50)
	, @StateDisbInsRate varchar(50), @AltPayRateA float
	, @AltPayRateB float, @AltPayRateC float, @AltPayRateD float
	, @ReviewDate datetime, @BirthDate datetime, @Phone varchar(50)
	, @bBenefitsEnrolled bit, @BenefitsEffectiveDate datetime
	, @BenefitsTermDate datetime, @HealthCarrier varchar(50)
	, @HealthLOC varchar(50), @DentalCarrier varchar(50)
	, @DentalLOC varchar(50), @CompPaidBenefitPerc float
	, @LaundryStatus varchar(50), @bExportETax bit
	, @bExportEBase bit, @bExportECard bit
	, @bExportEPerson bit, @bExportEJob bit
	, @bExportEComp bit, @bExportEPayroll bit
	, @bExportEEmploy bit, @bExportEUnion bit
	, @Ethnicity varchar(50), @RateChangeReason varchar(50)
	, @ScheduledHours float, @TermReason varchar(50)
	, @DiffPayRate float, @OtherPayRate float, @VacationDays float
	, @MeritIncrease bit, @LastIncreaseDate datetime
	, @PeriodOfIncrease int, @TypeMeritPromotion varchar(50)
	, @FiscalIncrease float, @EmpPosition varchar(50)
	, @DueIncreases bit, @PrevTermDate datetime, @bMoveHouseCode bit
	, @DeviceGroup varchar(50), @bUnion bit, @LastModifiedBy varchar(50)
	, @LastModifiedAt datetime, @PayRateEnteredBy varchar(50)
	, @PayrateEnteredAt datetime, @PrevPayRate money
	, @PrevPayRateEnteredBy varchar(50), @PrevPayRateEnteredAt datetime
	, @PrevPrevPayRate money, @PrevPrevPayRateEnteredBy varchar(50)
	, @PrevPrevPayRateEnteredAt datetime, @PayRatePercInc decimal(18,2)
	, @Position varchar(50), @PositionHours float, @SeniorityDate datetime
	, @PayWorkshift int, @PplPerson int
	, @Brief varchar(16), @MaxId int, @TotalCount int, @Count int, @AppStateType int
	, @EmpJobCodeType int, @PayPayrollCompany int, @EmpDeviceGroupType int 
	, @EmpRateChangeReasonType int, @EmpWorkShiftType int, @EmpTermReasonType int 
	, @EmpLaundryStatusType int, @HcmHouseCode int, @EmpEthnicityType int, @Gender int
	, @EmpFederalAdjustmentType int, @EmpStateAdjustmentType int, @EmpMaritalStatusType int
	, @PayPayFrequencyType int, @PriTaxStateType int, @SecTaxStateType int
	, @AppTransactionStatusType Int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From TeamFin.dbo.Employees

Set @Count = 0

Begin Try

	Begin Transaction

	While 1=1
	Begin

		Select @Id = [ID], @EmployeeNum = [EmployeeNum], @bCrothallEmp = [bCrothallEmp]
			, @bActive = [bActive], @bExempt = [bExempt], @SSN = [SSN], @Fname = [FName], @Minitial = [MInitial]
			, @Lname = [LName], @CeridianCompany = [CeridianCompany], @JobCode = [JobCode], @WorkShift = [WorkShift]
			, @bHourly = [bHourly], @PayRate = [PayRate], @HireDate = [HireDate], @HireComments = [HireComments]
			, @EnteredBy = [EnteredBy], @EnteredAt = [EnteredAt], @Site = [Site], @Company = [Company]
			, @HouseCode = [HouseCode], @Status = [Status], @TermDate = [TermDate], @TermComments = [TermComments]
			, @MaritalStatus = [MaritalStatus], @Sex = [Sex], @Address1 = [Address1], @Address2 = [Address2]
			, @Address3 = [Address3], @City = [City], @State = [State], @Zip = [Zip], @PayrollStatus = [PayrollStatus]
			, @PrevPayrollStatus = [PrevPayrollStatus], @RateCode = [RateCode], @FedExemptions = [FedExemptions]
			, @FedAdjCode = [FedAdjCode], @FedAdj = [FedAdj], @StateExemptions = [StateExemptions]
			, @StateAdjCode = [StateAdjCode], @StateAdj = [StateAdj], @PriTaxState = [PriTaxState]
			, @PriLocAuth = [PriLocAuth], @SecTaxState = [SecTaxState], @SecLocAuth = [SecLocAuth]
			, @PayFreq = [PayFreq], @LocalTax = [LocalTax], @StateDisbInsRate = IsNull([StateDisbInsRate], '0.0')
			, @AltPayRateA = [AltPayRateA], @AltPayRateB = [AltPayRateB], @AltPayRateC = [AltPayRateC]
			, @AltPayRateD = [AltPayRateD], @ReviewDate = [ReviewDate], @BirthDate = [BirthDate], @Phone = [Phone]
			, @bBenefitsEnrolled = [bBenefitsEnrolled], @BenefitsEffectiveDate = [BenefitsEffectiveDate]
			, @BenefitsTermDate = [BenefitsTermDate], @HealthCarrier = [HealthCarrier], @HealthLOC = [HealthLOC]
			, @DentalCarrier = [DentalCarrier], @DentalLOC = [DentalLOC], @CompPaidBenefitPerc = [CompPaidBenefitPerc]
			, @LaundryStatus = [LaundryStatus], @bExportETax = [bExportETax], @bExportEBase = [bExportEBase]
			, @bExportECard = [bExportECard]
			, @bExportEPerson = [bExportEPerson], @bExportEJob = [bExportEJob], @bExportEComp = [bExportEComp]
			, @bExportEPayroll = [bExportEPayroll], @bExportEEmploy = [bExportEEmploy], @bExportEUnion = [bExportEUnion]
			, @Ethnicity = [Ethnicity], @RateChangeReason= [RateChangeReason], @ScheduledHours = [ScheduledHours]
			, @TermReason = [TermReason], @DiffPayRate = [DiffPayRate], @OtherPayRate = [OtherPayRate]
			, @VacationDays = [VacationDays]
			, @MeritIncrease = [MeritIncrease], @LastIncreaseDate = [LastIncreaseDate], @PeriodOfIncrease = [PeriodOfIncrease]
			, @TypeMeritPromotion = [TypeMeritPromotion], @FiscalIncrease = [FiscalIncrease], @EmpPosition = [EmpPosition]
			, @DueIncreases = [DueIncreases], @PrevTermDate = [PrevTermDate], @bMoveHouseCode = [bMoveHouseCode]
			, @DeviceGroup = [DeviceGroup], @bUnion = [bUnion], @LastModifiedBy = [LastModifiedBy]
			, @LastModifiedAt = [LastModifiedAt]
			, @PayRateEnteredBy = [PayRateEnteredBy], @PayrateEnteredAt = [PayrateEnteredAt], @PrevPayRate = [PrevPayRate]
			, @PrevPayRateEnteredBy = [PrevPayRateEnteredBy], @PrevPayRateEnteredAt = [PrevPayRateEnteredAt]
			, @PrevPrevPayRate = [PrevPrevPayRate]
			, @PrevPrevPayRateEnteredBy = [PrevPrevPayRateEnteredBy], @PrevPrevPayRateEnteredAt = [PrevPrevPayRateEnteredAt]
			, @PayRatePercInc = [PayRatePercInc], @Position = [Position], @PositionHours = [PositionHours]
			, @SeniorityDate = [SeniorityDate]
		From [TeamFin].[dbo].[Employees] Where Id = @Id

		If @@RowCount > 0
		Begin
			Set @Count = @Count + 1
			Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))

			Select @AppStateType = IsNull(AppStateType, 0) From [ESMV2_DC].[dbo].[AppStateTypes] Where AppStatbrief = @State

			Insert Into [ESMV2_DC].[dbo].[PplPeople]
				( [PplPeoBrief]
				, [PplPeoFirstName]
				, [PplPeoLastName]
				, [PplPeoMiddleName]
				, [PplPeoAddressLine1]
				, [PplPeoAddressLine2]
				, [PplPeoCity]
				, [AppStateType] 
				, [PplPeoPostalCode]
				, [PplPeoHomePhone]
				, [PplPeoFax] 
				, [PplPeoCellPhone]
				, [PplPeoEmail] 
				, [PplPeoPager] 
				, [PplPeoActive]
				, [PplPeoModBy]
				, [PplPeoModAt]
				)
			Values(Left(@FNAme + @LName, 16)
				, IsNull(@FName, '')
				, IsNull(@LName, '')
				, IsNull(@Minitial, '')
				, IsNull(@Address1, '')
				, IsNull(@Address2, '')
				, IsNull(@City, '')
				, IsNull(@AppStateType, 0)
				, IsNull(@Zip,'')
				, IsNull(@Phone,'')
				, ''
				, ''
				, ''
				, ''
				, @bActive
				, IsNull(@EnteredBy, 'Persistech\Data Conversion')
				, IsNull(@EnteredAt, GetDate())
			)

			Set @PplPerson = (Select Max(PplPerson) From ESMV2_DC.dbo.PplPeople ) -- @@Identity
			
			Select @Brief = Left(@FNAme + @LName, 16) From ESMV2_DC.dbo.PplPeople Where PplPerson = @PplPerson

			Select @HcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
				Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit
			Where AU.AppUniBrief = @HouseCode
		
			Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
			Select @EmpJobCodeType = [EmpJobCodeType] From TeamFinV2_DC.dbo.[EmpJobCodeTypes] Where EmpjobctTitle = @Jobcode
			Select @PayPayrollCompany = [PayPayrollCompany] From TeamFinV2_DC.dbo.[PayPayrollCompanies] Where PaypaycBrief = @CeridianCompany
			Select @EmpDeviceGroupType = [EmpDeviceGroupType] From TeamFinV2_DC.dbo.[EmpDeviceGroupTypes] Where EmpdevgtBrief = @DeviceGroup 
			Select @EmpRateChangeReasonType = [EmpRateChangeReasonType] From TeamFinV2_DC.dbo.[EmpRateChangeReasonTypes] Where EmpratcrtTitle = @RateChangeReason 
			Select @EmpTermReasonType = [EmpTerminationReasonType] From TeamFinV2_DC.dbo.[EmpTerminationReasonTypes] Where EmpterrtTitle = @TermReason
			Select @EmpWorkShiftType = [EmpWorkShift] From TeamFinV2_DC.dbo.[EmpWorkShifts] Where EmpworsTitle = @WorkShift 
			Select @EmpEthnicityType = [EmpEthnicityType] From TeamFinV2_DC.dbo.[EmpEthnicityTypes ] Where EmpEthtBrief = @Ethnicity
			Select @EmpFederalAdjustmentType = [EmpFederalAdjustmentType] From TeamFinV2_DC.dbo.[EmpFederalAdjustmentTypes] Where EmpFedatBrief = @FedAdjCode
			Select @EmpStateAdjustmentType = [EmpStateAdjustmentType] From TeamFinV2_DC.dbo.[EmpStateAdjustmentTypes] Where EmpStaatBrief = @StateAdjCode
			Select @PriTaxStateType = [AppStateType] From [ESMV2_DC].dbo.[AppStateTypes] Where AppstatBrief = @PriTaxState
			Select @SecTaxStateType = [AppStateType] From [ESMV2_DC].dbo.[AppStateTypes] Where AppstatBrief = @SecTaxState
			Select @EmpMaritalStatusType = [EmpMaritalStatusType] From TeamFinV2_DC.dbo.[EmpMaritalStatusTypes] Where EmpMarstBrief = @MaritalStatus
			Select @PayPayFrequencyType = [PayPayFrequencyType] From TeamFinV2_DC.dbo.[PayPayFrequencyTypes] Where PayPayftBrief = @PayFreq
			/*
			Select * From TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentStates
			Select * From TeamFinV2_DC.dbo.EmpLocalTaxAdjustmentTypes
			Select * From TeamFinV2_DC.dbo.EmpLocalTaxCodePayrollCompanyStates
			Select * From TeamFinV2_DC.dbo.EmpMaritalStatusFederalTaxTypes
			Select * From TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxStates
			Select * From TeamFinV2_DC.dbo.EmpMaritalStatusStateTaxTypes		
			Select * From TeamFinV2_DC.dbo.EmpSDIAdjustmentStates
			Select * From TeamFinV2_DC.dbo.EmpSDIAdjustmentTypes
			Select * From TeamFinV2_DC.dbo.EmpStateAdjustmentStates
			*/
			Set @FedAdj = Replace(@FedAdj, '$', '')
			Set @StateAdj = Replace(@StateAdj, '$', '')
			
			Set @Gender = 0
			If @Sex = 'M' 
				Set @Gender = 1 
			Else If @Sex = 'F' 
				Set @Gender = 2			

			Insert Into [TeamFinV2_DC].[dbo].[EmpEmployeeGenerals]
				( [PplPerson]          
				, [HcmHouseCode]
				, [HcmHouseCodeJob]
				, [PayPayrollCompany]
				, [PayPayFrequencyType]
				, [AppTransactionStatusType]
				, [EmpI9Type]
				, [EmpVetType]
				, [EmpSeparationCode]
				, [EmpJobStartReasonType]
				, [EmpStatusType]
				, [EmpStatusCategoryType]
				, [EmpJobCodeType]
				, [EmpWorkShift]
				, [EmpMaritalStatusType]
				, [EmpDeviceGroupType]
				, [EmpUnionType]
				, [EmpGenderType]
				, [EmpEthnicityType]				
				, [EmpEmpgBrief]
				, [EmpEmpgActive]
				, [EmpEmpgSSN]
				, [EmpEmpgEmployeeNumber]
				, [EmpEmpgCrothallEmployee]
				, [EmpRateChangeReasonType]
				, [EmpEmpgRateChangeDate]
				, [EmpTerminationReasonType]
				, [EmpEmpgTerminationDate]
				, [EmpEmpgExempt]				
				, [EmpEmpgHourly]
				, [EmpEmpgHireDate]
				, [EmpEmpgOriginalHireDate]
				, [EmpEmpgEffectiveDate]
				, [EmpEmpgSeniorityDate]				
				, [EmpEmpgBenefitsPercentage]
				, [EmpEmpgScheduledHours]
				, [EmpEmpgUnion]				
				, [EmpEmpgExportETax]
				, [EmpEmpgExportEBase]
				, [EmpEmpgExportECard]
				, [EmpEmpgExportEPerson]
				, [EmpEmpgExportEJob]
				, [EmpEmpgExportEComp]           	   
				, [EmpEmpgExportEPayroll]
				, [EmpEmpgExportEEmploy]
				, [EmpEmpgExportEUnion]
				, [EmpEmpgAlternatePayRateA]
				, [EmpEmpgAlternatePayRateB]
				, [EmpEmpgAlternatePayRateC]
				, [EmpEmpgAlternatePayRateD]
				, [EmpEmpgPTOStartDate]
				, [EmpEmpgPTOAccruedHourEntryAutomatic]
				, [EmpEmpgPayRate]
				, [EmpEmpgPayRateEnteredBy]
				, [EmpEmpgPayRateEnteredAt]
				, [EmpEmpgPrevPayRate]
				, [EmpEmpgPrevPayRateEnteredBy]
				, [EmpEmpgPrevPayRateEnteredAt]
				, [EmpEmpgPrevPrevPayRate]
				, [EmpEmpgPrevPrevPayRateEnteredBy]
				, [EmpEmpgPrevPrevPayRateEnteredAt]
				, [EmpEmpgBirthDate]
				, [EmpEmpgReviewDate]
				, [EmpEmpgWorkPhone]
				, [EmpEmpgWorkPhoneExt]
				, [EmpEmpgBackGroundCheckDate]
				, [EmpEmpgFederalExemptions]
				, [EmpFederalAdjustmentType]
				, [EmpMaritalStatusFederalTaxType]
				, [EmpEmpgFederalAdjustmentAmount]
				, [EmpEmpgPrimaryState]
				, [EmpEmpgSecondaryState]
				, [EmpMaritalStatusStateTaxTypePrimary]
				, [EmpMaritalStatusStateTaxTypeSecondary]
				, [EmpEmpgStateExemptions]
				, [EmpStateAdjustmentType]
				, [EmpEmpgStateAdjustmentAmount]
				, [EmpSDIAdjustmentType]
				, [EmpEmpgSDIRate]
				, [EmpLocalTaxAdjustmentType]
				, [EmpEmpgLocalTaxAdjustmentAmount]
				, [EmpEmpgLocalTaxCode1]
				, [EmpEmpgLocalTaxCode2]
				, [EmpEmpgLocalTaxCode3]
				, [EmpEmpgPayrollStatus]
				, [EmpEmpgPreviousPayrollStatus]				
				, [EmpEmpgEffectiveDateJob]
				, [EmpEmpgEffectiveDateCompensation]
				, [EmpEmpgVersion]
				, [EmpEmpgCrtdBy]
				, [EmpEmpgCrtdAt]
				, [EmpEmpgModBy]
				, [EmpEmpgModAt]
				)
			Values
				( IsNull(@PplPerson, 0)
				, IsNull(@HcmHouseCode, 0)
				, Null -- HcmHouseCodeJob
				, IsNull(@PayPayrollCompany, 0)
				, IsNull(@PayPayFrequencyType, 0)
				, @AppTransactionStatusType
				, Null-- EmpI9Type
				, Null -- EmpVetType
				, Null -- EmpSeparationCode
				, Null -- EmpJobStartReasonType
				, @bActive -- EmpStatusType
				, Null -- EmpStatusCategoryType
				, IsNull(@EmpJobCodeType, 0)
				, IsNull(@EmpWorkShiftType, 0) 
				, IsNull(@EmpMaritalStatusType, 0) 
				, IsNull(@EmpDeviceGroupType, 0)
				, Null --EmpUnionType
				, IsNull(@Gender, 0)
				, IsNull(@EmpEthnicityType, 0)				
				, @Brief
				, @bActive
				, IsNull(@SSN, '')
				, IsNull(@EmployeeNum, 0)			
				, IsNull(@bCrothallEmp, 0)
				, IsNull(@EmpRateChangeReasonType, 0)
				, IsNull(@PayrateEnteredAt, '') -- EmpEmpgRateChangeDate
				, IsNull(@EmpTermReasonType, 0)
				, IsNull(@TermDate, '')				
				, IsNull(@bExempt, 0)				  
				, IsNull(@bHourly,0)			  
				, IsNull(@HireDate, '')
				, Null -- EmpEmpgOriginalHireDate
				, Null -- EmpEmpgEffectiveDate				
				, IsNull(@SeniorityDate, '')
				, IsNull(@CompPaidBenefitPerc, 0)
				, IsNull(@ScheduledHours, 0)
				, IsNull(@bUnion, 0)				
				, IsNull(@bExportETax, 0)
				, IsNull(@bExportEBase, 0)
				, IsNull(@bExportECard, 0)
				, IsNull(@bExportEPerson, 0)
				, IsNull(@bExportEJob, 0)
				, IsNull(@bExportEComp, 0)
				, IsNull(@bExportEPayroll, 0)
				, IsNull(@bExportEEmploy, 0)
				, IsNull(@bExportEUnion, 0)
				, IsNull(Convert(Decimal, @AltPayRateA), 0)
				, IsNull(Convert(Decimal, @AltPayRateB), 0)
				, IsNull(Convert(decimal, @AltPayRateC), 0)
				, IsNull(Convert(Decimal, @AltPayRateD), 0)
				, Null -- EmpEmpgPTOStartDate
				, Null -- EmpEmpgPTOAccruedHourEntryAutomatic
				, IsNull(@PayRate, 0)
				, @PayRateEnteredBy
				, @PayrateEnteredAt
				, @PrevPayRate
				, @PrevPayRateEnteredBy
				, @PrevPayRateEnteredAt
				, @PrevPrevPayRate
				, @PrevPrevPayRateEnteredBy
				, @PrevPrevPayRateEnteredAt
				, IsNull(@BirthDate, '')
				, IsNull(@ReviewDate, '') 
				, Null -- EmpEmpgWorkPhone
				, Null -- EmpEmpgWorkPhoneExt
				, Null -- EmpEmpgBackGroundCheckDate			
				, IsNull(@FedExemptions, 0)
				, IsNull(@EmpFederalAdjustmentType, 0) 
				, Null -- EmpMaritalStatusFederalTaxType
				, IsNull(@FedAdj, 0)
				, IsNull(@PriTaxStateType, 0)
				, IsNull(@SecTaxStateType, 0)
				, Null -- EmpMaritalStatusStateTaxTypePrimary
				, Null -- EmpMaritalStatusStateTaxTypeSecondary
				, IsNull(@StateExemptions, 0)
				, IsNull(@EmpStateAdjustmentType, 0)   
				, IsNull(@StateAdj, 0)
				, Null -- EmpSDIAdjustmentType
				, IsNull(@StateDisbInsRate, 0)
				, Null -- EmpLocalTaxAdjustmentType
				, Null -- IsNull(@LocalTax, '') EmpEmpgLocalTaxAdjustmentAmount
				, Null -- EmpEmpgLocalTaxCode1
				, Null -- EmpEmpgLocalTaxCode2
				, Null -- EmpEmpgLocalTaxCode3
				, IsNull(@PayrollStatus, '')
				, IsNull(@PrevPayrollStatus, '')
				, Null -- EmpEmpgEffectiveDateJob
				, Null -- EmpEmpgEffectiveDateCompensation
				, 1 -- EmpEmpgVersion
				, IsNull(@EnteredBy, 'Persistech\Data Conversion')
				, IsNull(@EnteredAt, GetDate())
				, IsNull(@EnteredBy, 'Persistech\Data Conversion')
				, IsNull(@EnteredAt, GetDate())
				)			

			Insert Into [ESMV2_DC].dbo.[PplPersonRoles]
				( PplPerson
				, PplRole
				, PplPerrModBy
				, PplPerrModAt
				)   
			Values
				( @PplPerson
				, 2 -- Employee, 1-User, 3-Performer
				, 'Persistech\Data Conversion'
				, GetDate()
				)
		End

		Set @Id = @Id + 1		
		If @Id > @MaxId Break

	End
	Commit Transaction

End Try

Begin Catch
	Print @@Error 
	Print @Id
	Rollback Transaction
End Catch
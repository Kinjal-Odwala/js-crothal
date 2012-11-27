/*
Select Top 100 * From [TeamFinV2].[dbo].EmpEmployeeGenerals

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
	, @EmpFederalAdjustmentType int, @EmpStateAdjustmentType int, @EmpTaxMaritalStatusType int
	, @PayPayFrequencyType int, @PriTaxStateType int, @SecTaxStateType int, @EmpPositionType int
	, @AppTransactionStatusType Int, @EmpEmployeeGeneral Int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From TeamFin.dbo.Employees

Set @Count = 0

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
		Print 'Updating Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))

		Select Top 1 @EmpEmployeeGeneral = EmpEmployeeGeneral 
		From [TeamFinV2].[dbo].EmpEmployeeGenerals EG
			Inner Join TeamFin.dbo.Employees TFE On EG.EmpEmpgEmployeeNumber = TFE.EmployeeNum
		Where TFE.Id = @Id
		
		If @@RowCount > 0
		Begin
		
			Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
			Select @EmpEthnicityType = [EmpEthnicityType] From TeamFinV2.dbo.[EmpEthnicityTypes ] Where EmpEthtBrief = @Ethnicity
			Select @EmpFederalAdjustmentType = [EmpFederalAdjustmentType] From TeamFinV2.dbo.[EmpFederalAdjustmentTypes] Where EmpFedatBrief = @FedAdjCode
			Select @EmpStateAdjustmentType = [EmpStateAdjustmentType] From TeamFinV2.dbo.[EmpStateAdjustmentTypes] Where EmpStaatBrief = @StateAdjCode
			Select @PriTaxStateType = [AppStateType] From [ESMV2].dbo.[AppStateTypes] Where AppstatBrief = @PriTaxState
			Select @SecTaxStateType = [AppStateType] From [ESMV2].dbo.[AppStateTypes] Where AppstatBrief = @SecTaxState
			Select @EmpTaxMaritalStatusType = [EmpTaxMaritalStatusType] From TeamFinV2.dbo.[EmpTaxMaritalStatusTypes] Where EmpTaxmstBrief = @MaritalStatus
			Select @PayPayFrequencyType = [PayPayFrequencyType] From TeamFinV2.dbo.[PayPayFrequencyTypes] Where PayPayftBrief = @PayFreq

			Set @FedAdj = Replace(@FedAdj, '$', '')
			Set @StateAdj = Replace(@StateAdj, '$', '')
			
			Set @Gender = 0
			If @Sex = 'M' 
				Set @Gender = 1 
			Else If @Sex = 'F' 
				Set @Gender = 2			
			
			Update [TeamFinV2].[dbo].[EmpEmployeeGenerals]
			Set EmpEmpgAlternatePayRateA = Convert(Decimal, @AltPayRateA)
			   , EmpEmpgAlternatePayRateB = Convert(Decimal, @AltPayRateB)
			   , EmpEmpgAlternatePayRateC = Convert(Decimal, @AltPayRateC)
			   , EmpEmpgAlternatePayRateD = Convert(Decimal, @AltPayRateD)	  
			   , EmpEmpgPayRate = IsNull(@PayRate, 0)
			   , EmpEmpgPayRateEnteredBy = @PayRateEnteredBy
			   , EmpEmpgPayRateEnteredAt = @PayRateEnteredAt
			   , EmpEmpgPrevPayRate = @PrevPayRate
			   , EmpEmpgPrevPayRateEnteredBy = @PrevPayRateEnteredBy
			   , EmpEmpgPrevPayRateEnteredAt = @PrevPayRateEnteredAt
			   , EmpEmpgPrevPrevPayRate = @PrevPrevPayRate
			   , EmpEmpgPrevPrevPayRateEnteredBy = @PrevPrevPayRateEnteredBy
			   , EmpEmpgPrevPrevPayRateEnteredAt = @PrevPrevPayRateEnteredAt
			   , EmpGenderType = @Gender
			   , EmpEthnicityType = @EmpEthnicityType
			   , EmpEmpgBirthDate = @BirthDate
			   , EmpEmpgReviewDate = @ReviewDate
			   , EmpEmpgWorkPhone = Null
			   , EmpEmpgWorkPhoneExt = Null
			   , EmpEmpgBackGroundCheckDate = Null
			   , EmpEmpgFederalExemptions = @FedExemptions
			   , EmpFederalAdjustmentType = @EmpFederalAdjustmentType
			   , EmpTaxMaritalStatusType = @EmpTaxMaritalStatusType
			   , EmpEmpgFederalAdjustmentAmount = @FedAdj
			   , EmpEmpgPrimaryState = @PriTaxStateType
			   , EmpEmpgSecondaryState = @SecTaxStateType
			   , EmpEmpgStateExemptions = @StateExemptions
			   , EmpStateAdjustmentType = @EmpStateAdjustmentType
			   , EmpEmpgStateAdjustmentAmount = @StateAdj
			   , EmpEmpgSDIRate = @StateDisbInsRate
			   , EmpEmpgPayrollStatus = @PayrollStatus
			   , EmpEmpgPreviousPayrollStatus = @PrevPayrollStatus
			   , AppTransactionStatusType = @AppTransactionStatusType
			   , PayPayFrequencyType = @PayPayFrequencyType
			Where EmpEmployeeGeneral = @EmpEmployeeGeneral
		End
		Else
			Print 'No Matching Record Found....'					
	End

	Set @Id = @Id + 1		
	If @Id > @MaxId Break

End
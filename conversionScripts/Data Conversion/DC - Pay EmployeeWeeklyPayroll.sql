/*
Select * From TeamFinV2_DC.dbo.[PayEmployeeWeeklyPayrolls]
Truncate Table TeamFinV2_DC.dbo.[PayEmployeeWeeklyPayrolls]
*/

Set NoCount On

Declare @Id int 
	, @EmployeeId int 
	, @PayCode varchar(11)
	, @Hours float 
	, @FixedAmount money 
	, @CurrentPayRate money 
	, @bHourly bit
	, @bExempt bit 
	, @bCrothallEmp bit 
	, @ShiftType varchar(50) 
	, @AltPayRate money 
	, @JobCode varchar(25) 
	, @ApprovedByDailyPayroll bit 
	, @Week int
	, @Period int 
	, @FiscalYear int 
	, @ExpenseDate datetime
	, @EnteredBy varchar(25)
	, @EnteredAt datetime
	, @Status smallint 
	, @HouseCode varchar(10)
	, @MaxId int
	, @EmpJobCodeType int
	, @PayPayCodeType int 
	, @PayWorkshift int
	, @HcmHouseCode int
	, @EmpEmployee int
	, @TotalCount int
	, @Count int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From TeamFin.dbo.Payroll 
Where FiscalYear In(9, 10, 19)

Set @Count = 0

While 1 = 1
Begin
	Select @EmployeeId = EmployeeId 
		, @PayCode = PayCode
		, @Hours = Hours 
		, @FixedAmount = FixedAmount
		, @CurrentPayRate = CurrentPayRate 
		, @bHourly = bHourly
		, @bExempt = bExempt
		, @bCrothallEmp = bCrothallEmp 
		, @ShiftType = ShiftType 
		, @AltPayRate = AltPayRate
		, @JobCode= JobCode
		, @ApprovedByDailyPayroll = ApprovedByDailyPayroll 
		, @Week = [Week]
		, @Period = Period 
		, @FiscalYear = FiscalYear 
		, @ExpenseDate =ExpenseDate 
		, @EnteredBy = EnteredBy
		, @EnteredAt = EnteredAt
		, @Status = Status  		
		, @HouseCode = HouseCode	
	From [TeamFin].dbo.[Payroll] 
	Where Id = @Id And (FiscalYear In(9, 10, 19))

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
		
		/*
		If (@FiscalYear = 19)
		Begin
			Set @FiscalYear = 9
			If (@Period = 1)
				Set @Period = 14
			Else If (@Period = 2)
				Set @Period = 15
		End
		*/
		
		Select @HcmHouseCode = HcmHouseCode From [ESMV2_DC].dbo.AppUnits AU
			Join [TeamFinV2_DC].dbo.HcmHouseCodes HC On HC.Appunit = AU.AppUnit
		Where AppUniBrief = @HouseCode
				
		Select Top 1 @EmpEmployee = EmpEmployeeGeneral 
		From [TeamFinV2_DC].dbo.EmpEmployeeGenerals EG
			Inner Join [TeamFin].dbo.employees TFE On EG.EmpEmpgEmployeeNumber = TFE.EmployeeNum
		Where TFE.Id = @EmployeeId
		
		Select @EmpJobCodeType = [EmpJobCodeType] From [TeamFinV2_DC].dbo.[EmpJobCodeTypes] Where EmpjobctTitle = @Jobcode
		Select @PayPayCodeType = [PayPayCode] From [TeamFinV2_DC].dbo.[PayPayCodes] Where PaypaycBrief = @PayCode
		Select @PayWorkshift = [EmpWorkshift] From [TeamFinV2_DC].dbo.EmpWorkshifts Where EmpworsTitle= @ShiftType				
		Select @FiscalYear = FscYear From [TeamFinV2_DC].dbo.FscYears Where FscYeaTitle = Cast((@FiscalYear  + 2000) As Varchar(4))
		Select @Period = FscPeriod From [TeamFinV2_DC].dbo.FscPeriods Where FscPerTitle = Cast(@Period As Varchar(4)) And FscYear = @FiscalYear
		Select @Status = AppTransactionStatusType From [TeamFinV2_DC].dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
		
		Insert Into [TeamFinV2_DC].dbo.[PayEmployeeWeeklyPayrolls]
			( [HcmHouseCode]
			, [HcmHouseCodeJob]
			, [PayrollHcmHouseCode]
			, [EmpEmployee]
			, [PayPayCode]
			, [EmpWorkshift]
			, [EmpJobCodeType]
			, [AppTransactionStatusType]
			, [PayEmpwpHours]
			, [PayEmpwpFixedAmount]
			, [PayEmpwpCurrentPayRate]
			, [PayEmpwpHourly]
			, [PayEmpwpExempt]
			, [PayEmpwpAlternatePayRate]
			, [PayEmpwpApprovedByDailyPayroll]
			, [PayEmpwpWeek]
			, [FscPeriod]
			, [FscYear]
			, [PayEmpwpExpenseDate]
			, [PayEmpwpModBy]
			, [PayEmpwpModAt]
			, [PayEmpwpActive]
			, [PayEmpwpVersion]
			, [OldId]
			)
		Values
			( @HcmHouseCode
			, Null
			, @HcmHouseCode
			, IsNull(@EmpEmployee, 0)
			, @PayPayCodeType
			, IsNUll(@PayWorkshift, 0)
			, IsNUll(@EmpJobCodeType, 0)
			, @Status
			, @Hours
			, @FixedAmount
			, @CurrentPayRate
			, @bHourly
			, @bExempt
			, @AltPayRate
			, @ApprovedByDailyPayroll
			, @Week
			, @Period
			, @FiscalYear 
			, @ExpenseDate
			, RTrim(@EnteredBy) 
			, IsNull(@EnteredAt, '') 
			, 1
			, 1
			, @Id
		    )
	End
		
	Set @Id = @Id + 1	
	If @Id > @MaxId Break

End
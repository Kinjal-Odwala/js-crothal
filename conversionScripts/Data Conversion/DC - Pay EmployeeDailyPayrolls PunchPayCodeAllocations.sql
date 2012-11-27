/*
Select * From TeamFinV2_DC.dbo.PayEmployeeDailyPayrolls
Select * From [TeamFinV2_DC].[dbo].PayEmployeePunchPaycodeAllocations
Truncate Table TeamFinV2_DC.dbo.PayEmployeeDailyPayrolls
Truncate Table [TeamFinV2_DC].[dbo].PayEmployeePunchPaycodeAllocations
*/

Set Nocount On

Declare 
	@Id	Int
	, @EmployeeId Int
	, @PayrollDate Datetime
	, @Shift	varchar(50)
	, @GrossHours Float
	, @NetHours	Float
	, @UseLunch	Bit
	, @UseBreak	Bit
	, @PostedDateTime Datetime
	, @PostedBy	varchar(100)
	, @UnapprovedDateTime Datetime
	, @UnapprovedBy Varchar(100)
	, @EmpEmployee Int
	, @EmpWorkShift Int
	, @MaxId Int
	, @StartDate DateTime
	, @EndDate DateTime
	, @MaxPayEmployeeDailyPayrollId Int
	, @TotalCount Int
	, @Count Int

-- To limit the records conversion to Fiscal Year 2009, 2010, 2019
Select @StartDAte = Min(StartDate), @EndDate = Max(EndDate) 
From TeamFin.dbo.PeriodDefinition
Where FiscalYear In(2009, 2010, 2019)

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From TeamFin.dbo.EmpDailyPayroll
Where PayrollDate Between @StartDAte And @EndDate

Set @Count = 0

While 1=1
Begin

	Select @EmployeeId = EmployeeId 
		, @PayrollDate = PayrollDate
		, @Shift = Shift 
		, @GrossHours = GrossHours
		, @NetHours = NetHours
		, @UseLunch = UseLunch		
		, @UseBreak = UseBreak
		, @PostedDateTime = PostedDateTime
		, @PostedBy = PostedBy
		, @UnapprovedDateTime = UnapprovedDateTime		
		, @UnapprovedBy = UnapprovedBy
	From TeamFin.dbo.empDailyPayroll 
	Where ID = @Id And (PayrollDate Between @StartDAte And @EndDate)

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
		
		Select Top 1 @EmpEmployee = EmpEmployeeGeneral 
		From TeamFinV2_DC.dbo.EmpEmployeeGenerals EG
			Inner Join TeamFin.dbo.Employees TFE On EG.EmpEmpgEmployeeNumber = TFE.EmployeeNum
		Where TFE.Id = @EmployeeId

		Select @EmpWorkShift = EmpWorkShift From TeamFinV2_DC.dbo.EmpWorkShifts Where EmpWorsTitle = @Shift
		
		Insert Into TeamFinV2_DC.dbo.PayEmployeeDailyPayrolls
			( EmpEmployee
			, PayEmpdpDate
			, EmpWorkShift
			, PayEmpdpGrossHours
			, PayEmpdpNetHours
			, PayEmpdpLunch
			, PayEmpdpBreak
			, PayEmpdpPostedBy
			, PayEmpdpPostedAt
			, PayEmpdpUnapprovedBy
			, PayEmpdpUnapprovedAt
			, PayEmpdpModBy
			, PayEmpdpModAt
			) 
		Values
			( IsNull(@EmpEmployee, 0)
			, @PayrollDate
			, @EmpWorkShift	
			, @GrossHours
			, @NetHours 
			, @UseLunch 		
			, @UseBreak
			, IsNull(@PostedBy, 'Persistech\Data Conversion')
			, @PostedDateTime
			, IsNull(@UnapprovedBy, 'Persistech\Data Conversion')
			, @UnapprovedDateTime				
			, 'Persistech\Data Conversion'
			, GetDate()
			)
	
		Select @MaxPayEmployeeDailyPayrollId = Max(PayEmployeeDailyPayroll) 
		From [TeamFinV2_DC].[dbo].PayEmployeeDailyPayrolls 

		Insert Into [TeamFinV2_DC].[dbo].PayEmployeePunchPaycodeAllocations
			( PayEmployeeDailyPayroll
			, PayPayCode
			, PayEmpppaHours
			, PayEmpppaModBy
			, PayEmpppaModAt
			)		 
		Select 
			@MaxPayEmployeeDailyPayrollId
			, PPC.PayPayCode
			, EPPL.Hours
			, IsNull(EnteredBy, 'Persistech\Data Conversion')
			, EPPL.EnteredAt				
		From [TeamFin].[dbo].[empPunchPaycodeAllocation] EPPL 		
			Inner Join TeamFinV2_DC.dbo.PayPaycodes PPC On EPPL.PayCode = PPC.payPaycBrief	
		Where EPPL.EmployeeId = @EmployeeId	And EPPL.PunchDate = @PayrollDate		

	End

	Set @Id = @Id + 1	
	If @Id > @MaxId Break 

End

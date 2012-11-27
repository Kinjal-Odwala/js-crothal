SET NOCOUNT ON

/*
Select Top 100 * From [TeamFin].[dbo].[EmpPunches]

Select * From [TeamFinV2_DC].[dbo].[PayEmployeePunches]
Truncate Table [TeamFinV2_DC].[dbo].[PayEmployeePunches]
*/

Declare @Id Int
	, @PunchTime DateTime
	, @OverrideTime DateTime
	, @EmployeeNum Int
	, @EmpPunchType Int
	, @GateCode Int
	, @GateNumber Int
	, @DeviceName NVarchar(30)
	, @DeviceGroup NVarchar(30)
	, @ApprovedPunchDate DateTime
	, @EnteredBy NVarchar(50)
	, @EnteredAt DateTime	
	, @EmpEmployee Int	
	, @EmpDeviceGroupType Int
	, @StartDate DateTime
	, @EndDate DateTime
	, @MaxId Int
	, @TotalCount Int
	, @Count Int

-- To limit the records conversion to Fiscal Year 2009, 2010, 2019
Select @StartDAte = Min(StartDate), @EndDate = Max(EndDate) 
From TeamFin.dbo.PeriodDefinition
Where FiscalYear In(2009, 2010, 2019)

Select @Id = Min([EmpPunch]), @MaxId = Max([EmpPunch]), @TotalCount = Count(EmpPunch) 
From TeamFin.dbo.[EmpPunches]
Where PunchTime Between @StartDAte And @EndDate

Set @Count = 0

While 1=1
Begin

	Select @PunchTime = [PunchTime]
		, @OverrideTime = [OverrideTime]
		, @EmployeeNum = [EmployeeNum]
		, @EmpPunchType = [EmpPunchType]
		, @GateCode = [GateCode]
		, @GateNumber = [GateNumber]
		, @DeviceName = [DeviceName]
		, @DeviceGroup = [DeviceGroup]
		, @ApprovedPunchDate = [ApprovedPunchDate]
		, @Enteredby = Enteredby
		, @EnteredAt = EnteredAt
	From [TeamFin].[dbo].[EmpPunches] 
	Where [EmpPunch] = @Id And (PunchTime Between @StartDAte And @EndDate)

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
		
		Select @EmpEmployee = EmpEmployeeGeneral 
		From TeamFinV2_DC.dbo.EmpEmployeeGenerals TFEG
			Inner Join TeamFin.dbo.Employees TFIE On TFIE.EmployeeNum = TFEG.EmpEmpgEmployeeNumber
		Where ID = @EmployeeNum
		
		Select @EmpDeviceGroupType = EmpDeviceGroupType From TeamFinV2_DC.dbo.EmpDeviceGroupTypes Where EmpDevgtTitle = @DeviceGroup
				
		Insert Into [TeamFinV2_DC].[dbo].[PayEmployeePunches]
			( EmpEmployee
			, PayEmployeePunchType
			, EmpDeviceGroupType
			, PayEmppDeviceName
			, PayEmppPunchTime
			, PayEmppOverrideTime
			, PayEmppApprovedTime
			, PayEmppModBy
			, PayEmppModAt
			)
		 Values
			( @EmpEmployee
			, @EmpPunchType
			, @EmpDeviceGroupType
			, @DeviceName
			, @PunchTime
			, @OverrideTime	
			, @ApprovedPunchDate
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, GetDate())
			)	
	End

	Set @Id = @Id + 1	
	If @Id > @MaxId Break

End

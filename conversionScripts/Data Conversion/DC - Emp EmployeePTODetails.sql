/*
Select * From [TeamFinV2_DC].[dbo].EmpEmployeePTODetails
Truncate Table [TeamFinV2_DC].[dbo].EmpEmployeePTODetails

Select Top 3 * From [TeamFin].[dbo].[EmployeePTODetails]
*/

Set NoCount On

Declare @Id	Int
	, @EmployeeId Int
	, @PayCode Varchar(11)
	, @PTODate DateTime
	, @Hours Decimal(18, 2)
	, @Notes Varchar(256)
	, @AdjustmentHours Decimal(10, 0)
	, @AdjustmentDate DateTime
	, @EmpEmployee  Int
	, @PayPayCodeType Int	
	, @StartDate DateTime
	, @EndDate DateTime
	, @MaxId Int
	, @TotalCount Int
	, @Count Int

-- To limit the records conversion to Fiscal Year 2009, 2010, 2019
Select @StartDAte = Min(StartDate), @EndDate = Max(EndDate)
From TeamFin.dbo.PeriodDefinition
Where FiscalYear In(2009, 2010, 2019)

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From TeamFin.dbo.[EmployeePTODetails]
Where PTODate Between @StartDAte And @EndDate

Set @Count = 0

While 1=1
Begin

	Select @EmployeeId = [EmployeeId]
		, @PayCode = [PayCode]
		, @PTODate = [PTODate]
		, @Hours = [Hours]
		, @Notes = [Notes]
		, @AdjustmentHours = [AdjustmentHours]
		, @AdjustmentDate = [AdjustmentDate]
	From [TeamFin].[dbo].[EmployeePTODetails]
	Where Id = @Id And (PTODate Between @StartDAte And @EndDate)
	
	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
		
		Select Top 1 @EmpEmployee = EmpEmployeeGeneral 
		From [TeamFinV2_DC].[dbo].EmpEmployeeGenerals EG
			Inner Join TeamFin.dbo.Employees TFE On EG.EmpEmpgEmployeeNumber = TFE.EmployeeNum
		Where TFE.Id = @EmployeeId
		
		Select @PayPayCodeType = PayPayCode From [TeamFinV2_DC].[dbo].PayPayCodes Where PayPaycBrief = @PayCode
		
		Insert Into [TeamFinV2_DC].[dbo].EmpEmployeePTODetails
		    ( EmpEmployee
			, PayPayCode
			, EmpEmppdPTODate
			, EmpEmppdHours
			, EmpEmppdAdjustmentHours
			, EmpEmppdAdjustmentDate
			, EmpEmppdNotes
			, EmpEmppdModBy
			, EmpEmppdModAt
			)
		 Values
			( Isnull(@EmpEmployee, 0)
			, @PayPayCodeType
			, @PTODate
			, IsNull(@Hours, 0)
			, @AdjustmentHours
			, @AdjustmentDate
			, @Notes 
			, 'Persistech\Data Conversion'
			, GetDate()
		    )	
	End

	Set @Id = @Id + 1	
	If @Id > @MaxId Break 

End
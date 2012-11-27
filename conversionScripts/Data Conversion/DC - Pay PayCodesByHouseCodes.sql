Set NoCount On

/*
Select * From [TeamFinV2_DC].[dbo].[PayPayCodesByHousecodes]
Truncate Table [TeamFinV2_DC].[dbo].[PayPayCodesByHousecodes]
*/

Declare @Id int
	, @PayCode varchar(50)
	, @EnteredBy varchar(50)
	, @EnteredAt Datetime
	, @EmployeeId int
	, @FixedAmount money
	, @HouseCode Int
	, @PayCodeNew int
	, @EmployeeIdNew int
	, @HouseCodeNew Int
	, @MaxId int
	, @TotalCount int
	, @Count int

Select @Id = Min(ID), @MaxId = Max(Id), @TotalCount = Count(Id) 
From TeamFin.dbo.PayCodesBySite Where Id > 4

Set @Count = 0

While 1=1
Begin

	Select @Id = ID
		, @PayCode = Paycode
		, @EnteredBy = Enteredby
		, @EnteredAt = EnteredAt
		, @EmployeeId = EmployeeId
		, @FixedAmount = FixedAmount
		, @HouseCode = HouseCode
	From TeamFin.dbo.PayCodesBySite Where Id = @Id

	If @@Rowcount > 0
	Begin

		Set @HouseCodeNew = 0
		Set @PayCodeNew = 0 

		Select @PayCodeNew = PayPayCode From [TeamFinV2_DC].[dbo].[PayPayCodes] Where PayPaycBrief = @PayCode

		Select @HouseCodeNew = HC.HcmHouseCode 
		From [ESMV2_DC].[dbo].[AppUnits] AU
			Join [TeamFinV2_DC].[dbo].[HcmHouseCodes] HC On HC.AppUnit = AU.AppUnit
		Where AppUniBrief = @HouseCode

		Select @EmployeeIdNew = EG.EmpEmployeeGeneral 
		From [TeamFinV2_DC].[dbo].[EmpEmployeeGenerals] EG
		Where EG.EmpEmpgEmployeeNumber = (Select EmployeeNum From TeamFin.dbo.Employees Where Id = @EmployeeId)

		If @HouseCodeNew > 0 And @PayCodeNew > 0 And @EmployeeIdNew > 0
		Begin
			Set @Count = @Count + 1
			Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
			
			Insert Into [TeamFinV2_DC].[dbo].[PayPayCodesByHousecodes]
				( [HcmHouseCode]
				, [PayPayCode]
				, [EmpEmployee]
				, [PayPaycbhFixedAmount]
				, [PayPaycbhModBy]
				, [PayPaycbhModAt]
				, [PayPaycbhActive])
			 Values
			    ( @HouseCodeNew
			    , @PayCodeNew
			    , @EmployeeIdNew
			    , @FixedAmount
			    , IsNull(@EnteredBy, 'Persistech\Data Conversion')
			    , IsNull(@EnteredAt, Getdate())
			    , 1 -- Active
				)
		End
	End	

	Set @Id = @Id + 1	
	If @Id > @MaxId Break
	
End
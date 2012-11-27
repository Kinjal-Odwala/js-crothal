/*
Select Top 10 * From TeamFin.[dbo].[OtherRevenue]
Select Top 10 * From [TeamFinV2_DC].[dbo].[RevOtherRevenues]

Truncate Table [TeamFinV2_DC].[dbo].[RevOtherRevenues]
*/

Set NoCount on

Declare @Id Int
Declare @AccountCode Int
Declare @Amount Float
Declare @Status SmallInt
Declare @Week Int
Declare @Period Int
Declare @FiscalYear Int
Declare @ExpenseDate DateTime
Declare @HouseCode Varchar(10)
Declare @BAssocRecFixedCost Bit
Declare @JDEId Int
Declare @TblType Varchar(8)
Declare @EnteredBy Varchar(25)
Declare @EnteredAt DateTime
Declare @HcmHouseCode Int
Declare @AppTransactionStatusType Int
Declare @RevTableType Int
Declare @FscAccount Int
Declare @FscYear Int
Declare @FscPeriod Int
Declare @MaxId Int
Declare @TotalCount Int 
Declare @Count Int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From TeamFin.dbo.[OtherRevenue] 
Where FiscalYear In(9, 10, 19)

Set @Count = 0

While 1=1
Begin

	Select @AccountCode = [Account]
		, @Amount = [Amount]
		, @Status = [Status]
		, @Week = [Week]
		, @Period = [Period]
		, @FiscalYear = [FiscalYear]
		, @ExpenseDate = [ExpenseDate]
		, @HouseCode = [HouseCode]
		, @BAssocRecFixedCost = [bAssocRecFixedCost]
		, @JDEId = [JDEId]
		, @TblType = [TblType]
		, @EnteredBy = [TFUser]
		, @EnteredAt = [EnteredAt]
	From TeamFin.[dbo].[OtherRevenue] 
	Where Id = @Id And FiscalYear In(9, 10, 19)

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
		
		Select @HcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @HouseCode

		Select @FscAccount = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @AccountCode
		Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
		Select @RevTableType = RevTableType From TeamFinV2_DC.dbo.RevTableTypes Where RevTabtTitle = @TblType
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period

		Insert Into [TeamFinV2_DC].[dbo].[RevOtherRevenues]
			( [FscAccount]
			, [RevOthrAmount]
			, [AppTransactionStatusType]
			, [RevOthrWeek]
			, [FscPeriod]
			, [FscYear]
			, [RevOthrExpenseDate]
			, [HcmHouseCode]
			, [RevOthrAssociatedRecurringFixedCost]
			, [RevOthrJDEId]
			, [revTableType]
			, [revOthrActive]
			, [RevOthrCrtddBy]
			, [RevOthrCrtdAt]
			, [RevOthrModBy]
			, [RevOthrModAt]
			, [OldId]
			)   
		Values
			( IsNull(@FscAccount, 0)
			, @Amount	
			, @AppTransactionStatusType 
			, @Week
			, @FscPeriod
			, @FscYear
			, @ExpenseDate
			, IsNull(@HcmHouseCode, 0)
			, @BAssocRecFixedCost
			, @JDEId
			, @RevTableType
			, 1
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
		    , IsNull(@EnteredAt, GetDate())
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
		    , IsNull(@EnteredAt, GetDate())
			, @Id
			)	
	End

	Set @Id = @Id + 1	
	If @Id > @MaxId Break

End
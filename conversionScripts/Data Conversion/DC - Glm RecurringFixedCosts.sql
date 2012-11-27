/*
Select Top 100 * From [TeamFinV2_DC].[dbo].[GlmRecurringFixedCosts]
Truncate Table [TeamFinV2_DC].[dbo].[GlmRecurringFixedCosts]

Select Top 10 * From [TeamFin].[dbo].[RecurringFixedCosts]
*/

Set NoCount ON

Declare @Id Int
Declare @AccountCode Int
Declare @Amount Float
Declare @Status Smallint
Declare @Week Int
Declare @Period Int
Declare @FiscalYear Int
Declare @ExpenseDate DateTime
Declare @HouseCode Varchar(10)
declare @SourceType Varchar(10)
Declare @SourceId Int
Declare @SetupId Int
declare @bModified Bit
Declare @bAssocRecFixedCost Bit
Declare @JDEId Int
Declare @TblType Varchar(8)
Declare @EnteredBy Varchar(50)
Declare @EnteredAt DateTime	
Declare @HcmHouseCode Int
Declare @RevTableType Int
Declare @AppTransactionStatusType Int
Declare @FscAccount Int
Declare @FscYear Int
Declare @FscPeriod Int
Declare @MaxId Int
Declare @TotalCount Int 
Declare @Count Int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From [TeamFin].[dbo].[RecurringFixedCosts] 
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
		, @SourceType = [SourceType]
		, @SourceId = [SourceId]
		, @SetupId = [SetupId]
		, @bModified = [bModified]
		, @bAssocRecFixedCost = [bAssocRecFixedCost]
		, @JDEId = [JDEId]
		, @TblType = [TblType]
		, @EnteredBy = TFUser
		, @EnteredAt = [EnteredAt]
	From [TeamFin].[dbo].[RecurringFixedCosts] 
	Where Id = @Id And FiscalYear In(9, 10, 19)

	If @@RowCount > 0
	Begin	
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
				
		Select @FscAccount = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @AccountCode
		
		Select @HcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @HouseCode

		Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
		Select @RevTableType = RevTableType From TeamFinV2_DC.dbo.RevTableTypes Where RevTabtTitle = @TblType
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period

		If (@SourceType = 'SW')
		Begin
			Select @SourceId = GlmSalaryWage From TeamFinV2_DC.dbo.GlmSalaryWages Where OldId = @SourceId
			If @@RowCount = 0
				Set @SourceId = Null
		End
		
		Select @SetupId = GlmRecurringExpense From TeamFinV2_DC.dbo.GlmRecurringExpenses Where OldId = @SetupId
		If @@RowCount = 0
			Set @SetupId = Null
		
		Insert Into [TeamFinV2_DC].[dbo].[GlmRecurringFixedCosts]
           ( [HcmHouseCode]
           , [FscAccount]
           , [GlmRecfcAmount]
           , [AppTransactionStatusType]
           , [GlmRecfcWeek]
           , [FscPeriod]
           , [FscYear]
           , [GlmRecfcExpenseDate]
           , [GlmRecfcSourceType]
           , [GlmRecfcSourceId]
           , [GlmRecfcSetupId]
           , [GlmRecfcModified]
           , [GlmRecfcAssociatedRecurringFixedCost]
           , [GlmRecfcJDEId]
           , [RevTableType]
           , [GlmRecfcCrtdBy]
           , [GlmRecfcCrtdAt]
           , [GlmRecfcModBy]
           , [GlmRecfcModAt]
           , [GlmRecfcActive]
           )
		Values
           ( IsNull(@HcmHouseCode, 0)
           , @FscAccount
           , @Amount
           , @AppTransactionStatusType
           , @Week
		   , @FscPeriod
           , @FscYear
           , @ExpenseDate
           , @SourceType
           , @SourceId
           , @SetupId
           , @bModified
           , @bAssocRecFixedCost
           , @JDEId
           , @RevTableType
           , IsNull(@EnteredBy, 'Persistech\Data Conversion')
		   , IsNull(@EnteredAt, GetDate())
           , IsNull(@EnteredBy, 'Persistech\Data Conversion')
		   , IsNull(@EnteredAt, GetDate())
           , 1
           )           	
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End
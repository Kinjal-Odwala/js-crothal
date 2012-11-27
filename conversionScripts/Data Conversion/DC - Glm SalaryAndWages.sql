/*
-- Estimated records for an year 10million

Select * From [TeamFinV2_DC].[dbo].[GlmSalaryWages]
Truncate Table [TeamFinV2_DC].[dbo].[GlmSalaryWages]
Select Top 3 * From [TeamFin].[dbo].[SalaryWages]
*/

SET NOCOUNT ON

Declare 
	  @Id Int
	, @AccountCode Int
	, @Amount Float
	, @Status SmallInt	
	, @Week Int
	, @Period Int
	, @FiscalYear Int
	, @ExpenseDate DateTime
	, @HouseCode Varchar(10)
	, @BAssocRecFixedCost Bit
	, @JDEId Int
	, @TblType Varchar(8)	
	, @EnteredBy Varchar(50)
	, @EnteredAt DateTime	
	, @HcmHouseCode Int
	, @AppTransactionStatusType Int
	, @RevTableType Int
	, @FscAccount Int
	, @FscYear Int
	, @FscPeriod Int	
	, @MaxId Int
	, @TotalCount Int 
	, @Count Int

-- To limit the records conversion to Fiscal Year 2005, 2009, 2019
Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From Teamfin.dbo.[SalaryWages]
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
		, @EnteredBy = TFUser
		, @EnteredAt = EnteredAt
	From [TeamFin].[dbo].[SalaryWages] 
	Where Id = @Id And FiscalYear In(9, 10, 19)

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
		
		Select @HcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @HouseCode

		Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
		Select @FscAccount = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @AccountCode
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period
		Select @RevTableType = RevTableType From TeamFinV2_DC.dbo.RevTableTypes Where RevTabtTitle = @TblType
				
		Insert Into [TeamFinV2_DC].[dbo].[GlmSalaryWages]
			( HcmHouseCode
			, HcmHouseCodeJob
			, FscAccount
			, GlmSalwAmount
			, AppTransactionStatusType
			, GlmSalwWeek
			, FscPeriod
			, FscYear
			, GlmSalwExpenseDate
			, GlmSalwAssociatedRecurringFixedCost
			, GlmSalwJDEId
			, RevTableType
			, GlmSalwActive
			, GlmSalwCrtdBy
			, GlmSalwCrtdAt
			, GlmSalwModBy
			, GlmSalwModAt
			, OldId
			)
		Values
			( @HcmHouseCode
			, Null
			, @FscAccount
			, @Amount	
			, @AppTransactionStatusType
			, @Week
			, @FscPeriod
			, @FscYear
			, @ExpenseDate
			, @BAssocRecFixedCost
			, @JDEId
			, @RevTableType
			, 1
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, Getdate())
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, Getdate())
			, @Id
			)	
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End
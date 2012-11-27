/*
-- Estimated records for an year 10 Million

Select * From [TeamFinV2_DC].[dbo].[BudBudgetSummaries]
Select * From [TeamFinV2_DC].[dbo].[BudBudgetWORForecasts]

Truncate Table [TeamFinV2_DC].[dbo].[BudBudgetSummaries]
Truncate Table [TeamFinV2_DC].[dbo].[BudBudgetWORForecasts]

Select Top 10 * From [TeamFin].[dbo].[BudgetSummary]
*/

Set NoCount on

Declare @Id int
Declare @AccountCode int
Declare @Amount float
Declare @Status int
Declare @fscAccount int
Declare @hcmHouseCode as varchar(10)
Declare @HouseCode as varchar(10)
Declare @ActualAmt float
Declare @ForecastAmt float
Declare @ForecastStatus int
Declare @LastForecastChange datetime
Declare @bBudgetModified int
Declare @bForecastModified int
Declare @TFUser varchar(20)
Declare @NonBudgetedCode int
Declare @Period int
declare @FscPeriod int
Declare @FiscalYear int
Declare @FscYear int
Declare @JDEId int
Declare @ExceptionId int
Declare @TblType varchar(10)
Declare @Comment varchar(2000)
Declare @EnteredAt DateTime
Declare @Company varchar(500)
Declare @perPerson int
Declare @AppTransactionStatusTypes int
Declare @revTableType int
Declare @jcmJDECompany int
Declare @BudBudgetSummaryIdentity int
Declare @MaxId int 
Declare @TotalCount int 
Declare @Count int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From TeamFin.dbo.BudgetSummary Where FiscalYear In (9, 10, 19)

Set @Count = 0

While 1=1
Begin

	Select @Id = Id
		, @AccountCode = AccCode 
		, @Amount = Amount
		, @Status = Status
		, @HouseCode = HouseCode
		, @ActualAmt = ActualAmt 
		, @ForecastAmt = ForecastAmt
		, @ForecastStatus = ForecastStatus
		, @LastForecastChange = LastForecastChange 
		, @bBudgetModified = bBudgetModified 
		, @bForecastModified = bForecastModified 
		, @TFUser = TFUser 
		, @NonBudgetedCode = NonBudgetedCode
		, @Period = Period
		, @FiscalYear = FiscalYear 
		, @JDEId = JDEId 
		, @ExceptionId = ExceptionId 
		, @TblType = TblType 
		, @Comment = Comment
		, @EnteredAt = EnteredAt
		, @Company = Company
	From TeamFin.dbo.BudgetSummary Where Id = @Id And FiscalYear In (9, 10, 19)

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
		
		Select @hcmHouseCode = HcmHouseCode 
		From TeamFinV2_DC.dbo.hcmHouseCodes hcmh
			Inner Join ESMV2_DC.dbo.AppUnits appu On appu.AppUnit = hcmh.AppUnit	
		Where appu.AppUniBrief = @HouseCode

		Select @fscAccount = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @AccountCode
		Select @AppTransactionStatusTypes = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
		Select @revTableType = RevTableType From TeamFinV2_DC.dbo.[RevTableTypes] Where RevTabtTitle = @TblType	
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period
		
		Insert Into [TeamFinV2_DC].[dbo].[BudBudgetSummaries]
			( [FscAccount]
			, [BudBudsAmount]
			, [BudBudsActualAmount]
			, [BudBudsForecastAmount]
			, [AppTransactionStatusType]
			, [BudBudsForecastStatus]
			, [BudBudsLastForecastChange]
			, [BudBudsBudgetModified]
			, [BudBudsForecastModified]
			, [BudBudsNonBudgetedCode]
			, [HcmHouseCode]
			, [BudBudsjcmJDECompany]
			, [FscPeriod]
			, [FscYear]
			, [BudBudsJDEId]
			, [RevTableType]
			, [BudBudsComment]
			, [BudBudsActive]
			, [BudBudsCrtdBy]
			, [BudBudsCrtddAt]
			, [BudBudsModBy]
			, [BudBudsModAt]
			, [OldId]
			)
		Values
			( @fscAccount
			, @Amount
			, @ActualAmt
			, @ForecastAmt
			, @AppTransactionStatusTypes
			, @ForecastStatus
			, @LastForecastChange
			, @bBudgetModified
			, @bForecastModified
			, @NonBudgetedCode
			, IsNull(@hcmHouseCode, 0)
			, IsNull(@jcmJDECompany, 0)					
			, @FscPeriod
			, @FscYear
			, @JDEId
			, IsNull(@revTableType, 0)
			, @Comment
			, 1
			, @TFUser
			, @EnteredAt
			, 'Persistech\Data Conversion'
			, GetDate()
			, @Id
			)

		Select @BudBudgetSummaryIdentity = Max(BudBudgetSummary) From TeamFinV2_DC.dbo.BudBudgetSummaries

		Insert Into [TeamFinV2_DC].[dbo].[BudBudgetWORForecasts]
			( [BudBudgetSummary]
			, [BudBudworfAmount]
			, [BudBudworfBudWeek]
			, [FscPeriod]
			, [FscYear]
			, [BudBudworfModified]
			, [BudBudworfActive]
			, [BudBudworfCrtdAt]
			, [BudBudworfCrtdBy]
			, [BudBudworfModBy]
			, [BudBudworfModAt]
			, [AppTransactionStatusType]
			, [OldId]
			)
		Select
			@BudBudgetSummaryIdentity
			, BW.Amount
			, BW.Week
			, FP.FscPeriod
			, FY.FscYear
			, BW.bModified
			, 1
			, BW.EnteredAt
			, BW.TFUser
			, BW.TFUser
			, BW.EnteredAt
			, IsNull(C.AppTransactionStatusType, 1)
			, Bw.ID
		From TeamFin.dbo.BudgetWORForecast BW	
			Left Outer Join TeamFinV2_DC.dbo.AppTransactionStatusTypes C On c.AppTransactionStatusType = BW.status	
			Left Outer Join TeamFinV2_DC.dbo.FscYears FY On FY.FscYeaTitle = BW.FiscalYear + 2000
			Left Outer Join TeamFinV2_DC.dbo.FscPeriods FP On FP.FscPerTitle = BW.Period			
		Where BW.BudgetId = @Id And FY.FscYear = FP.FscYear
	
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End
/*
Select * From [TeamFinV2_DC].[dbo].[GlmRecurringExpenses]
Truncate Table [TeamFinV2_DC].[dbo].[GlmRecurringExpenses]

Select Top 3 * From [TeamFin].[dbo].[RecurringFixedCostsSetup]
*/

Set NoCount On

Declare @Id Int
	, @ToAccCode Int	
	, @FixedAmt Float
	, @Percent Float
	, @FrAccCode Int
	, @HouseCode Varchar(10)
	, @Period Int
	, @FiscalYear Int
	, @Interval Varchar(25)
	, @Type Varchar(15)
	, @Readonly Varchar(5)
	, @RuleId Int	
	, @EnteredBy Varchar(50)
	, @EnteredAt DateTime	
	, @StartDate DateTime
	, @EndDate DateTime
	, @MaxId Int	
	, @TotalCount Int
	, @Count Int	
	, @FscAccountTo Int
	, @FscAccountFrom Int
	, @HcmHouseCode Int
	, @GlmRecurringFixedCostIntervalType Int
	, @GlmRecurringFixedCostType Int
	, @FscYear Int	
	, @FscPeriod Int
	
-- To limit the records conversion to Fiscal Year 2009, 2010, 2019
Select @StartDAte = Min(StartDate), @EndDate = Max(EndDate)
From TeamFin.dbo.PeriodDefinition
Where FiscalYear In(2009, 2010, 2019)

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From [TeamFin].[dbo].[RecurringFixedCostsSetup]
Where EnteredAt Between @StartDAte And @EndDate

Set @Count = 0

While 1=1
Begin

	Select @ToAccCode = [ToAccCode]
		, @FixedAmt = [FixedAmt]
		, @Percent = [Percent]
		, @FrAccCode = [FrAccCode]
		, @HouseCode = [HouseCode]		
		, @Period = [Period]
		, @FiscalYear = [FiscalYear]
		, @Interval = [Interval]
		, @Type = [Type]
		, @Readonly = [Readonly]
		, @RuleId = [RuleId]
		, @EnteredBy = TFUser
		, @EnteredAt = [EnteredAt]		  
	From [TeamFin].[dbo].[RecurringFixedCostsSetup] 
	Where Id = @Id And (EnteredAt Between @StartDAte And @EndDate)

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
			
		Select @HcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @HouseCode

		Select @GlmRecurringFixedCostIntervalType = GlmRecurringFixedCostIntervalType From TeamFinV2_DC.dbo.GlmRecurringFixedCostIntervalTypes Where GlmRecfcitBrief = @Interval
		Select @FscAccountTo = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @ToAccCode
		Select @FscAccountFrom = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @FrAccCode
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period
		Select @GlmRecurringFixedCostType = GlmRecurringFixedCostType From TeamFinV2_DC.dbo.GlmRecurringFixedCostTypes Where GlmRecfctBrief = @Type

		Insert Into [TeamFinV2_DC].[dbo].[GlmRecurringExpenses]
			( [HcmHouseCode]
			, [FscAccountTo]
			, [FscAccountFrom]
			, [HcmHouseCodeJobTo]
			, [HcmHouseCodeJobFrom]
			, [GlmreFixedAmount]
			, [GlmrePercent]
			, [FscPeriod]
			, [FscYear]
			, [GlmRecurringFixedCostIntervalType]
			, [GlmRecurringFixedCostType]
			, [GlmreRule]
			, [GlmreReadOnly]
			, [GlmreActive]
			, [GlmreVersion]
			, [GlmreCrtdBy]
			, [GlmreCrtdAt]
			, [GlmreModBy]
			, [GlmreModAt]
			, [OldId]		   
			)
		Values
			( IsNull(@HcmHouseCode, 0)
			, IsNull(@FscAccountTo, 0)
			, IsNull(@FscAccountFrom, 0)
			, Null
			, Null
			, @FixedAmt
			, @Percent
			, @FscPeriod
			, @FscYear
			, IsNull(@GlmRecurringFixedCostIntervalType, 0)
			, IsNull(@GlmRecurringFixedCostType, 0)
			, @RuleId
			, @Readonly
			, 1
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
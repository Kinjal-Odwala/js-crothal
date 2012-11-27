/*
Select Top 10 * From [TeamFin].[dbo].[bgtAnnualInformation]
Select * From [TeamFinV2_DC].[dbo].[BudAnnualBudgetDetails]
Truncate Table [TeamFinV2_DC].[dbo].[BudAnnualBudgetDetails]
*/

Set NoCount on

Declare @id int
	, @StartDate dateTime
	, @CutOffDate DateTime
	, @GenLiabilityRate decimal(10,1)
	, @GenLiabilityAccCodes varchar(1000)
	, @BenefitAdjStartPeriod int
	, @BenefitAdjEndPeriod int
	, @BenefitAdjPercent varchar(10)
	, @FiscalYear varchar(10)
	, @Announcement varchar(1000)
	, @FscYear int
	, @BudAnnbdStartFscPeriod int
	, @BudAnnbdEndFscPeriod int
	, @MaxId int

Select @Id = Min(bgtAnnualInformation), @MaxId = Max(bgtAnnualInformation)
From [TeamFin].[dbo].[bgtAnnualInformation]
Where FiscalYear > 2008

While (1=1)
Begin

	Select @StartDate = [StartDate]
		, @CutOffDate = [CutOffDate]
		, @GenLiabilityRate = [GenLiabilityRate]
		, @GenLiabilityAccCodes = [GenLiabilityAccCodes]
		, @BenefitAdjStartPeriod = [BenefitAdjStartPeriod]
		, @BenefitAdjEndPeriod = [BenefitAdjEndPeriod]
		, @BenefitAdjPercent = [BenefitAdjPercent]
		, @FiscalYear = [FiscalYear]
		, @Announcement = [Announcement]
	From [TeamFin].[dbo].[bgtAnnualInformation]
	Where [bgtAnnualInformation] = @Id And FiscalYear > 2008
	
	If @@RowCount > 0
	Begin

		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear
		Select @BudAnnbdStartFscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @BenefitAdjStartPeriod
		Select @BudAnnbdEndFscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @BenefitAdjEndPeriod

		Insert Into [TeamFinV2_DC].[dbo].[BudAnnualBudgetDetails]
			( [BudAnnbdStartDate]
			, [BudAnnbdCutOffDate]
			, [BudAnnbdLiabilityRate]
			, [BudAnnbdLiabilityFscAccounts]
			, [BudAnnbdStartFscPeriod]
			, [BudAnnbdEndFscPeriod]
			, [BudAnnbdPercent]
			, [FscYear]
			, [BudAnnbdAnnouncement]
			)
		 Values
			( @StartDate
			, @CutOffDate
			, @GenLiabilityRate
			, @GenLiabilityAccCodes
			, @BudAnnbdStartFscPeriod
			, @BudAnnbdEndFscPeriod
			, @BenefitAdjPercent
			, @FscYear
			, @Announcement
			)
	End
	
	Set @Id = @Id + 1
	If @Id > @MaxId Break

End
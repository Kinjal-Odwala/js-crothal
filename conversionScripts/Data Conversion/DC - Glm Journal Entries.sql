/*
Select Top 10 * From TeamFin.dbo.[FieldTransHead]
Select Top 10 * From [TeamFin].[dbo].[FieldTrans]

Select Top 10 * From [TeamFinV2_DC].[dbo].[GlmJournalEntries]
Select Top 10 * From [TeamFinV2_DC].[dbo].[GlmJournalEntryItems]

Truncate Table [TeamFinV2_DC].[dbo].[GlmJournalEntries]
Truncate Table [TeamFinV2_DC].[dbo].[GlmJournalEntryItems]
*/

Set NoCount ON

Declare @Id int
Declare @CreditHCode Varchar(10)
Declare @CreditEmail Varchar(50)
Declare @CreditPhone Varchar(15)
Declare @DebitHCode Varchar(10)
Declare @DebitEmail Varchar(50)
Declare @DebitPhone Varchar(15)
Declare @Week Int
Declare @Period Int
Declare @FiscalYear Int
Declare @ExpenseDate DateTime
Declare @EnteredBy Varchar(50)
Declare @EnteredAt DateTime
Declare @GlmJournalEntry Int
Declare @FscYear Int
Declare @FscPeriod Int
Declare @ChcmHouseCode Int
Declare @DhcmHouseCode Int
Declare @MaxId int
Declare @TotalCount Int 
Declare @Count Int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From TeamFin.dbo.[FieldTransHead] 
Where FiscalYear In(9, 10, 19)

Set @Count = 0

While 1=1
Begin

	Select @CreditHCode = [CreditHCode]
		, @CreditEmail = [CreditEmail]
		, @CreditPhone = [CreditPhone]
		, @DebitHCode = [DebitHCode]
		, @DebitEmail = [DebitEmail]
		, @DebitPhone = [DebitPhone]
		, @Week = [Week]
		, @Period = [Period]
		, @FiscalYear = [FiscalYear]
		, @ExpenseDate = [ExpenseDate]
		, @EnteredBy = [TFUser]
		, @EnteredAt = [EnteredAt]
	From [TeamFin].[dbo].[FieldTransHead]
	Where Id = @Id And FiscalYear In(9, 10, 19)

	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))
	
		Select @ChcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @CreditHCode		

		Select @DhcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @DebitHCode	
		
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period

		If @FscPeriod Is Null Set @FscPeriod = 0
		If @FscYear Is Null Set @FscYear = 0

		Insert Into [TeamFinV2_DC].[dbo].[GlmJournalEntries]
           ( [HcmHouseCode]
           , [HcmHouseCodeCredit]
           , [HcmHouseCodeJobCredit]
           , [GlmJoueHouseCodeEmailCredit]
           , [GlmJoueHouseCodePhoneCredit]
           , [HcmHouseCodeDebit]
           , [HcmHouseCodeJobDebit]
           , [GlmJoueHouseCodeEmailDebit]
           , [GlmJoueHouseCodePhoneDebit]
           , [GlmJoueJournalDate]
           , [GlmJoueWeek]
           , [FscPeriod]
           , [FscYear]
           , [GlmJoueModBy]
           , [GlmJoueModAt]
           , [GlmJoueActive]
           )
		Values
           ( @ChcmHouseCode
           , @ChcmHouseCode
           , Null
           , @CreditEmail
           , @CreditPhone
           , @DhcmHouseCode
           , Null
           , @DebitEmail
           , @DebitPhone
           , @ExpenseDate
           , @Week
           , @FscPeriod
           , @FscYear
           , IsNull(@EnteredBy, 'Persistech\Data Conversion')
		   , IsNull(@EnteredAt, GetDate())
           , 1
           )
	
		Select @GlmJournalEntry = Max(GlmJournalEntry) From [TeamFinV2_DC].[dbo].[GlmJournalEntries]
		
		Insert Into [TeamFinV2_DC].[dbo].[GlmJournalEntryItems]
			( [GlmJournalEntry]
			, [FscAccount]
			, [GlmJoueiAmount]
			, [AppTransactionStatusType]
			, [GlmJoueiAssociatedRecurringFixedCost]
			, [GlmJoueiExpenseDate]
			, [GlmJournalTransferType]
			, [GlmJoueiModBy]
			, [GlmJoueiModAt]
			, [GlmJoueiCrtdBy]
			, [GlmJoueiCrtdAt]
			, [GlmJoueiActive]
			, GlmJoueiJDEId
			)
		 Select
			@GlmJournalEntry
			, FA.FscAccount
			, Amount
			, ATST.AppTransactionStatusType
			, bAssocRecFixedCost
			, ExpenseDate
			, GJTT.GlmJournalTransferType
			, IsNull(TFUser, 'Persistech\Data Conversion')
			, IsNull(EnteredAt, GetDate())
			, IsNull(TFUser, 'Persistech\Data Conversion')
			, IsNull(EnteredAt, GetDate())
			, 1
			, FT.JDEId	
		From [TeamFin].[dbo].[FieldTrans] FT
			Left Join TeamFinV2_DC.dbo.FscAccounts FA On FT.Account = FA.FscAccCode
			Left Join TeamFinV2_DC.dbo.AppTransactionStatusTypes ATST On FT.Status = ATST.AppTrastBrief
			Left Join TeamFinV2_DC.dbo.GlmJournalTransferTypes GJTT On FT.TransferType = GJTT.GlmJouttTitle		
		Where FT.FieldTransHeadId = @Id
	
	End	

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End
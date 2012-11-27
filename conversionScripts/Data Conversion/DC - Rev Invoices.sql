
/*
Select Top 10 * From [TeamFin].[dbo].[Invoices]
Select Top 10 * From [TeamFin].[dbo].[InvoiceDetails]
Select Top 10 * From [TeamFin].[dbo].[AccountReceivables]

Select Top 10 * From [TeamFinV2_DC].[dbo].[RevInvoices] 
Select Top 10 * From [TeamFinV2_DC].[dbo].[RevInvoiceItems]
Select Top 10 * From [TeamFinV2_DC].[dbo].[RevAccountReceivables]

Truncate Table [TeamFinV2_DC].[dbo].[RevInvoices]
Truncate Table [TeamFinV2_DC].[dbo].[RevInvoiceItems]
Truncate Table [TeamFinV2_DC].[dbo].[RevAccountReceivables]
*/

Set NoCount on

Declare @Id Int
Declare @InvoiceNumber Int
Declare @SendTo Varchar(50)
Declare @Title Varchar(50)
Declare @StAddress1 Varchar(30)
Declare @StAddress2 Varchar(30)
Declare @City Varchar(25)
Declare @State Varchar(25)
Declare @Zip Varchar(10)
Declare @InvoiceDate DateTime
Declare @DueDate DateTime
Declare @ServicePeriodStartDate DateTime
Declare @ServicePeriodEndDate DateTime
Declare @Printed Varchar(3)
Declare @PrintedBy Varchar(25)
declare @LastPrinted DateTime
declare @CMLastPrinted DateTime
Declare @EnteredBy Varchar(25)
declare @EnteredAt DateTime
Declare @Week Int
Declare @Period Int
Declare @FiscalYear Int
Declare @TaxExempt Bit
declare @PaidOff Bit
Declare @Status SmallInt
Declare @HouseCode Varchar(10)
Declare @TaxRate Decimal
Declare @TaxId Varchar(50)
Declare @RevId Int
Declare @CheckNum Varchar(15)
Declare @Amount Decimal
Declare @CheckDate DateTime
Declare @DepositDate DateTime
Declare @Payer Varchar(50)
Declare @Notes Varchar(1024)
Declare @AssocRecFixedCost Bit		
Declare @TblType Varchar(8)
Declare @JDEId Int
Declare @RevInvoice Int
Declare @HcmHouseCode Int
declare @AppStateType Int
Declare @AppTransactionStatusType Int
Declare @RevTableType Int
Declare @FscYear Int
Declare @FscPeriod Int
Declare @RevAccountReceivable Int
Declare @RevAccountReceivableTemp Int
Declare @MaxId Int
Declare @TotalCount Int 
Declare @Count Int

Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From TeamFin.dbo.Invoices
Where FiscalYear In(9, 10, 19)

Set @Count = 0

While 1=1
Begin

	Select @InvoiceNumber = [InvoiceNum], @SendTo = [SendTo], @Title = [Title_Co], @StAddress1 = [StAddress1]
		, @StAddress2 = [StAddress2], @City = [City], @State = [State], @Zip = [Zip], @InvoiceDate = [InvoiceDate]
		, @DueDate = [DueDate], @ServicePeriodStartDate = [ServicePeriodStartDate]
		, @ServicePeriodEndDate = [ServicePeriodEndDate], @Printed = [Printed], @PrintedBy = [PrintedBy]
		, @LastPrinted = [LastPrinted], @CMLastPrinted = [CMLastPrinted], @EnteredBy = TFUser, @EnteredAt = [EnteredAt]
		, @Week = IsNull([Week], 0), @Period = IsNull([Period], 0), @FiscalYear = IsNull([FiscalYear], 0)
		, @TaxExempt = [bTaxExempt], @PaidOff = [bPaidOff], @Status = [Status]
		, @HouseCode = [HouseCode], @TaxRate = [taxrate], @TaxId = [taxid]
	From [TeamFin].[dbo].[Invoices] 
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
		If @Printed = 'Yes'
			Set @Printed = 1
		Else
			Set @Printed = 0		
		
		Select @AppStateType = IsNull(AppStateType, 0) From ESMV2_DC.dbo.AppStateTypes Where AppStatTitle = @State Or AppStatBrief = @State 
		
		Select @HcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes HC
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit	
		Where AU.AppUniBrief = @HouseCode

		Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period
		
		-- Insert Invoices
		Insert Into [TeamFinV2_DC].[dbo].[RevInvoices]
			( [HcmHouseCode]
			, [RevInvInvoiceNumber]
			, [RevInvInvoiceDate]
			, [RevInvDueDate]
			, [RevInvServicePeriodStartDate]
			, [RevInvServicePeriodEndDate]
			, [RevInvBillTo]
			, [RevInvCompany]
			, [RevInvAddress1]
			, [RevInvAddress2]
			, [RevInvCity]
			, [AppStateType]
			, [RevInvPostalCode]
			, [RevInvPrinted]
			, [RevInvPrintedBy]
			, [RevInvLastPrinted]
			, [RevInvCreditMemoLastPrinted]
			, [RevInvWeek]
			, [FscPeriod]
			, [FscYear]
			, [RevInvPaidOff]
			, [AppTransactionStatusType]
			, [RevInvTaxExempt]
			, [RevInvTaxNumber]
			, [RevInvStateTax]
			, [RevMunicipalityTax]
			, [RevInvOtherMunicipality]
			, [RevInvLocalTax]
			, [RevInvActive]
			, [RevInvVersion]
			, [RevInvCrtdBy]
			, [RevInvCrtdAt]
			, [RevInvModBy]
			, [RevInvModAt])
		Values
			( IsNull(@HcmHouseCode, 0)
			, @InvoiceNumber
			, @InvoiceDate
			, @DueDate
			, @ServicePeriodStartDate
			, @ServicePeriodEndDate
			, @SendTo
			, @Title
			, @StAddress1
			, @StAddress2
			, @City
			, IsNull(@AppStateType, 0)
			, @Zip
			, @Printed
			, @PrintedBy
			, @LastPrinted
			, @CMLastPrinted
			, @Week
			, @FscPeriod
			, @FscYear
			, @PaidOff
			, IsNull(@AppTransactionStatusType, 1)
			, @TaxExempt
			, @TaxId
			, Null
			, Null
			, Null
			, @TaxRate           
			, 'True'
			, 1
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, GetDate())
			, IsNull(@EnteredBy, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, GetDate())
			)

		Select @RevInvoice = Max(RevInvoice) From TeamFinV2_DC.dbo.RevInvoices
		
		-- Insert RevInvoiceItems
		Insert Into [TeamFinV2_DC].[dbo].[RevInvoiceItems]
			( [RevInvoice]
			, [FscAccount]
			, [HcmHouseCodeJob]
			, [RevInviTaxable]
			, [RevInviAmount]
			, [RevInviDescription]
			, [RevAccountReceivable]
			, [RevInviAssociatedRecurringFixedCost]
			, [RevInviJDEId]
			, [AppTransactionStatusType]
			, [RevTableType]
			, [RevInviCreditMemoNumber]
			, [RevInviCreditMemoPrintedDate]
			, [RevInviActive]
			, [RevInviVersion]
			, [RevInviCrtdBy]
			, [RevInviCrtdAt]
			, [RevInviModBy]
			, [RevInviModAt]
			)
		Select
			@RevInvoice
			, FA.FscAccount
			, Null
			, Null
			, Amount
			, ItemDescription
			, CM_ARRecId
			, bAssocRecFixedCost
			, JDEId
			, ATST.AppTransactionStatusType
			, RTT.RevTableType
			, cmnum
			, CMPrintDate
			, 1
			, 1
			, IsNull(TFUser, 'Persistech\Data Conversion')
			, IsNull(EnteredAt, GetDate())
			, IsNull(TFUser, 'Persistech\Data Conversion')
			, IsNull(EnteredAt, GetDate())
		From TeamFin.dbo.InvoiceDetails IND
			Left Join TeamFinV2_DC.dbo.FscAccounts FA On IND.AcctCode = FA.FscAccCode
			Left Join TeamFinV2_DC.dbo.AppTransactionStatusTypes ATST On IND.Status = ATST.AppTrastBrief
			Left Join TeamFinV2_DC.dbo.RevTableTypes RTT On IND.TblType = RTT.RevTabtTitle
		Where InvoiceNum = @InvoiceNumber
		
		--Insert RevAccountReceivables		
		
		Declare curAccountReceivables Cursor For
			Select [Id], [CheckNum], [Amount], [CheckDate]
				, [DepositDate], [Week], [Period], [FiscalYear], [Payer], [Status], [Notes]
				, [HouseCode], [bAssocRecFixedCost], [JDEId], [TblType], TFUser, EnteredAt
			From TeamFin.dbo.AccountReceivables 
			Where InvoiceNum = @InvoiceNumber

		Open curAccountReceivables
		
		Fetch Next From curAccountReceivables Into @RevId, @CheckNum, @Amount, @CheckDate
			, @DepositDate, @Week, @Period, @FiscalYear, @Payer, @Status, @Notes
			, @HouseCode, @AssocRecFixedCost, @JDEId, @TblType, @EnteredBy, @EnteredAt		
		
		While @@FETCH_STATUS = 0
		Begin		
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
		
			Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes Where AppTrastBrief = @Status	
			Select @RevTableType = RevTableType From TeamFinV2_DC.dbo.RevTableTypes Where RevTabtTitle = @TblType
			Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears Where FscYeaTitle = @FiscalYear + 2000
			Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period
		
			Insert Into [TeamFinV2_DC].[dbo].[RevAccountReceivables]
				( [RevInvoice]
				, [RevAccrCheckNumber]
				, [RevAccrCheckDate]
				, [RevAccrAmount]
				, [RevAccrDepositDate]
				, [RevAccrWeek]
				, [FscPeriod]
				, [FscYear]
				, [RevAccrPayer]
				, [AppTransactionStatusType]
				, [RevAccrNotes]
				, [HcmHouseCode]
				, [RevAccrAssociatedRecurringFixedCost]
				, [RevAccrJDEId]
				, [RevTableType]
				, [RevAccrActive]
				, [RevAccrVersion]
				, [RevAccrCrtdBy]
				, [RevAccrCrtdAt]
				, [RevAccrModBy]
				, [RevAccrModAt]					
				, [OldId]
				)
			Values
				( @RevInvoice
				, @CheckNum
				, @CheckDate
				, @Amount
				, @DepositDate
				, @Week
				, @FscPeriod
				, @FscYear
				, @Payer
				, @AppTransactionStatusType
				, @Notes
				, @HcmHouseCode
				, @AssocRecFixedCost
				, @JDEId
				, @RevTableType
				, 1
				, 1
				, IsNull(@EnteredBy, 'Persistech\Data Conversion')
				, IsNull(@EnteredAt, GetDate())
				, IsNull(@EnteredBy, 'Persistech\Data Conversion')
				, IsNull(@EnteredAt, GetDate())
				, @RevId
				)
				
			Select @RevAccountReceivable = Max([RevAccountReceivable]) From TeamFinV2_DC.dbo.[RevAccountReceivables]
			
			Update [TeamFinV2_DC].[dbo].[RevInvoiceItems]
			Set RevAccountReceivable = @RevAccountReceivable
			Where RevAccountReceivable = @RevId
			
			If (IsNumeric(@Payer) = 1 And CharIndex('.', @Payer) = 0)
			Begin					
				Select @RevAccountReceivableTemp = RevAccountReceivable From [TeamFinV2_DC].[dbo].[RevAccountReceivables]
				Where OldId = @Payer
				
				If @@RowCount > 0
				Begin				
					Update [TeamFinV2_DC].[dbo].[RevAccountReceivables]
					Set RevAccrPayer = @RevAccountReceivableTemp
					Where RevAccountReceivable = @RevAccountReceivable
				End
			End	
			
			Fetch Next From curAccountReceivables Into @RevId, @CheckNum, @Amount, @CheckDate
				, @DepositDate, @Week, @Period, @FiscalYear, @Payer, @Status, @Notes
				, @HouseCode, @AssocRecFixedCost, @JDEId, @TblType, @EnteredBy, @EnteredAt		
		End	
		
		Close curAccountReceivables 
		Deallocate curAccountReceivables		
	End	

	Set @Id = @Id + 1	
	If @Id > @MaxId Break

End
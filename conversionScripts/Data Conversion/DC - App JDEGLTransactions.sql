/*
	Select Top 10 * From TeamFin.dbo._JDEGLTransactions

	Select Top 10 * From [TeamFinV2_DC].[dbo].[AppJDEGLTransactions]
	Truncate Table [TeamFinV2_DC].[dbo].[AppJDEGLTransactions]
*/

Set Nocount On

Declare @Id	int
	, @DocType varchar(50)
	, @DocNo varchar(50)
	, @LineNo float
	, @TFId varchar(50)
	, @TFTableType varchar(20)
	, @HouseCode varchar(50)
	, @AccountNo varchar(50)
	, @GLDate Datetime
	, @POST varchar(10)
	, @Amount decimal(16,2)
	, @Vendor varchar(1000)
	, @Description varchar(1000)
	, @InvoiceNo varchar(50)
	, @InvoiceDate datetime
	, @PONo varchar(50)
	, @VendorNo varchar(50)
	, @OccurredAt datetime
	, @FscAccount varchar(50)
	, @hcmHouseCode varchar(50)
	, @MaxId int
	, @TotalCount int 
	, @Count int

Select  @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From TeamFin.dbo._JDEGLTransactions 
Where GLDATE Between '2008-08-03' And '2010-09-25'

Set @Count = 0

While 1=1
Begin

	Select @DocType = [DocType]
		, @DocNo = [DocNo]
		, @LineNo = [LineNo]
		, @TFId = [TFId]
		, @TFTableType = [TFTableType]
		, @HouseCode = [HouseCode]
		, @AccountNo = [AccountNo]
		, @GLDate = [GLDate]
		, @POST = [POST]
		, @Amount = [Amount]
		, @Vendor = [Vendor]
		, @Description = [Description]
		, @InvoiceNo = [InvoiceNo]
		, @InvoiceDate = [InvoiceDate]
		, @PONo = [PONo]
		, @VendorNo = [VendorNo]
		, @OccurredAt = [OccurredAt]
	From TeamFin.dbo._JDEGLTransactions
	Where ID = @Id And (GLDATE Between '2008-08-03' And '2010-09-25')
		
	If @@RowCount > 0
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))

		Select @hcmHouseCode = HcmHouseCode From TeamFinV2_DC.dbo.HcmHouseCodes hcmh
			Inner Join ESMV2_DC.dbo.AppUnits appu on appu.AppUnit = hcmh.AppUnit	
		Where appu.AppUniBrief = @HouseCode
		
		Select @FscAccount = FscAccount From TeamFinV2_DC.dbo.FscAccounts Where FscAccCode = @AccountNo

		Insert Into [TeamFinV2_DC].[dbo].[AppJDEGLTransactions]
           ( [AppJDEtDocumentType]
           , [AppJDEtDocumentNo]
           , [AppJDEtLineNumber]
           , [AppJDEtTeamFinId]
           , [AppJDEtTableType]
           , [HcmHouseCode]
           , [FscAccount]
           , [AppJDEtGLDate]
           , [AppJDEtPOST]
           , [AppJDEtAmount]
           , [AppJDEtVendor]
           , [AppJDEtDescription]
           , [AppJDEtInvoiceNo]
           , [AppJDEtInvoiceDate]
           , [AppJDEtPurchaseOrderNumber]
           , [AppJDEtVendorNumber]
           , [AppJDEtCrtdBy]
           , [AppJDEtCrtdAt]
		   , JDEId
		   )
		Values
           ( @DocType
           , @DocNo
           , @LineNo
           , @TFId
           , @TFTableType
           , @hcmHouseCode
           , @FscAccount
           , @GLDate
           , @POST
           , @Amount
           , @Vendor
           , @Description
           , @InvoiceNo
           , @InvoiceDate
           , @PONo
           , @VendorNo
           , 'Persistech\Data Conversion'
           , @OccurredAt
		   , @Id
		   )	
	End 

	Set @Id = @Id + 1
	If @Id > @MaxId Break 

End

/*
Select * From [TeamFinV2_DC].[dbo].[PurPurchaseOrders]
Select * From [TeamFinV2_DC].[dbo].[PurPurchaseOrderDetails]

Truncate Table [TeamFinV2_DC].[dbo].[PurPurchaseOrders]
Truncate Table [TeamFinV2_DC].[dbo].[PurPurchaseOrderDetails]
*/

Set NoCount on

Declare @OrderNumber varchar(50), @Status varchar(50), @Week varchar(10), @Period varchar(10)
	, @FiscalYear varchar(10), @OrderDate varchar(50), @DateReceived varchar(30)
	, @SupplierNumber varchar(50), @TFUser varchar(50), @EnteredAt varchar(50)
	, @HouseCode varchar(50), @ShipToContact varchar(50), @ShipToAddress1 varchar(100)
	, @ShipToAddress2 varchar(100), @ShipToCity varchar(50), @ShipToState  varchar(50)
	, @ShipToZip varchar(50), @ShipToPhone varchar(50), @ShipToFax varchar(50)
	, @AppTransactionStatusType int, @AppStateType int,	@FscYear int, @FscPeriod int
	, @HcmHouseCode int, @PurVendor int
	, @Id int, @MaxId int, @StartDate dateTime, @EndDate dateTime
	, @PurCatalogItem int, @PurPurchaseOrder int, @PurCatalog int, @TotalCount int, @Count int

-- To limit the records conversion to Fiscal Year 2009, 1010, 2019
Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id) 
From [TeamFin].[dbo].[PO]
Where FiscalYear In(9, 10, 19)

Set @Count = 0

While 1=1
Begin

	Select @OrderNumber = [OrderNumber]
		, @Status = [Status]
		, @Week = [Week]
		, @Period = [Period]
		, @FiscalYear = [FiscalYear]
		, @OrderDate = [OrderDate]
		, @DateReceived = [DateReceived]
		, @SupplierNumber = [SupplierNumber]
		, @TFUser = [TFUser]
		, @EnteredAt = [EnteredAt]
		, @HouseCode = [HouseCode]
		, @ShipToContact = [ShipToContact]
		, @ShipToAddress1 = [ShipToAddress1]
		, @ShipToAddress2 = [ShipToAddress2]
		, @ShipToCity = [ShipToCity]
		, @ShipToState = [ShipToState]
		, @ShipToZip = [ShipToZip]
		, @ShipToPhone = [ShipToPhone]
		, @ShipToFax = [ShipToFax]
	From [TeamFin].[dbo].[PO]
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
		
		Select @AppStateType = AppStateType from ESMV2_DC.dbo.AppStateTypes Where AppStatBrief = @ShipToState
		
		Select @HcmHouseCode = HcmHouseCode From HcmHouseCodes HC 
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit
		Where AU.AppUniBrief = @HouseCode

		Select @AppTransactionStatusType = AppTransactionStatusType From TeamFinV2_DC.dbo.AppTransactionStatusTypes where AppTrastBrief = Replace(@Status, '-2', '2')					
		Select @PurVendor = PurVendor From TeamFinV2_DC.dbo.PurVendors Where PurVenNumber = @SupplierNumber
		Select @FscYear = FscYear From TeamFinV2_DC.dbo.FscYears FY Where FY.FscYeaTitle = 2000 + @FiscalYear 
		Select @FscPeriod = FscPeriod From TeamFinV2_DC.dbo.FscPeriods Where FscYear = @FscYear And FscPerTitle = @Period
		Select @PurCatalog = PurCatalog From TeamFinV2_DC.dbo.PurCatalogs Where PurVendor = @PurVendor
		
		Insert Into [TeamFinV2_DC].[dbo].[PurPurchaseOrders]
			( [PurPuroOrderNumber]
			, [AppTransactionStatusType]
			, [PurPuroWeek]
			, [FscPeriod]
			, [FscYear]
			, [PurPuroOrderDate]
			, [PurPuroReceivedDate]
			, [PurVendor]
			, [HcmHouseCode]
			, [HcmHouseCodeJob]
			, [PurPuroShipToContact]
			, [PurPuroShipToAddress1]
			, [PurPuroShipToAddress2]
			, [PurPuroShipToCity]
			, [AppStateType]
			, [PurPuroShipToZip]
			, [PurPuroShipToPhone]
			, [PurPuroShipToFax]
			, [PurPuroModBy]
			, [PurPuroModAt]
			, [PurPuroCrtdBy]
			, [PurPuroCrtdAt])
		 Values
			( @OrderNumber
			, @AppTransactionStatusType
			, @Week
			, @FscPeriod
			, @FscYear
			, @OrderDate
			, @DateReceived
			, @PurVendor
			, IsNull(@HcmHouseCode, 0)
			, Null
			, @ShipToContact
			, @ShipToAddress1
			, @ShipToAddress2
			, @ShipToCity
			, @AppStateType
			, @ShipToZip
			, @ShipToPhone
			, @ShipToFax
			, IsNull(@TFUser, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, GetDate())
			, IsNull(@TFUser, 'Persistech\Data Conversion')
			, IsNull(@EnteredAt, GetDate())
			)

		Select @PurPurchaseOrder = Max(PurPurchaseOrder) From [TeamFinV2_DC].[dbo].[PurPurchaseOrders]

		-- Insert the new catalog and catalog items if it is not exists
		If @PurCatalog Is Null
		Begin
			Declare @Title Varchar(50)
			
			Select @Title = PurVenTitle From TeamFinV2_DC.dbo.PurVendors Where PurVendor = @PurVendor
			
			Insert Into TeamFinV2_DC.dbo.PurCatalogs
				( PurCatActive
				, PurCatTitle
				, PurVendor
				, PurCatDisplayOrder
				, PurCatModBy
				, PurCatModAt
				)
			Values(
				1
				, Left(@Title, 32)
				, @PurVendor
				, 0
				, 'Persistech\Data Conversion'
				, GetDate()
				)

			Select @PurCatalog = Max(PurCatalog) From TeamFinV2_DC.dbo.PurCatalogs
		End
		
		Insert Into TeamFinV2_DC.dbo.PurCatalogItems
			( PurCatalog
			, PurItem
			, PurCatiPrice
			, PurCatiDisplayOrder
			, PurCatiActive
			, PurCatiModBy
			, PurCatiModAt
			)
		Select 
			 @PurCatalog
			, PIT.PurItem
			, Price
			, 0
			, 1
			, IsNull(TfUser, 'Persistech\Data Conversion')
			, IsNull(EnteredAT, GetDate())
		From TeamFinV2_DC.dbo.PurItems PIT
			Join TeamFin.dbo.PO_Details POD On POD.ItemNumber = PIT.PurIteNumber
		Where OrderNumber = @OrderNumber And PIT.PurItem Not In(Select PurItem From TeamFinV2_DC.dbo.PurCatalogItems Where PurCatalog = @PurCatalog)

		Insert Into TeamFinV2_DC.dbo.PurPurchaseOrderDetails
			( PurPurchaseOrder
			, PurCatalogItem
			, HcmHouseCodeJob
			, PurPurodPrice
			, PurPurodQuantity
			, PurPurodQuantityReceived
			, PurPurodModBy
			, PurPurodModAt
		    )
		Select 
			@PurPurchaseOrder
			, PCI.PurCatalogItem
			, Null
			, Price
			, Qty
			, QtyReceived
			, IsNull(TfUser, 'Persistech\Data Conversion')
			, Isnull(EnteredAT, GetDate())
		From TeamFin.dbo.PO_Details
			Join TeamFinV2_DC.dbo.PurItems PIT On PIT.PurIteNumber = TeamFin.dbo.PO_Details.ItemNumber
			Join TeamFinV2_DC.dbo.PurCatalogItems PCI On PCI.PurItem = PIT.PurItem
			Join TeamFinV2_DC.dbo.PurCatalogs PC On PCI.PurCatalog = PC.PurCatalog And PC.PurVendor = @PurVendor
		Where OrderNumber = @OrderNumber

	End
	
	Set @Id = @Id + 1	
	If @Id > @MaxId Break
	
End

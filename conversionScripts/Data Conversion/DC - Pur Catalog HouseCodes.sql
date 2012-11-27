/*
Select Top 50 * From TeamFin.dbo.PO_HouseCodeSupplier

Truncate Table TeamFinV2_DC.dbo.PurCatalogHouseCodes
Select Top 50 * From TeamFinV2_DC.dbo.PurCatalogHouseCodes
*/

Set NoCount On

Declare @Id Int
	, @HouseCode Varchar(50)
	, @SupplierNumber  Varchar(50)
	, @EnteredBy Varchar(50)
	, @EnteredAt DateTime
	, @MaxId Int
	, @TotalCount Int
	, @Count Int
	, @HcmHouseCode Int
	, @PurCatalog Int
	
Select @Id = Min(Id), @MaxId = Max(Id), @TotalCount = Count(Id)
From TeamFin.dbo.PO_HouseCodeSupplier

Set @Count = 0

While 1=1
Begin

	Select @SupplierNumber = SupplierNumber
		, @HouseCode = HouseCode
		, @EnteredBy = TFUser
		, @EnteredAt = EnteredAt
	From TeamFin.dbo.PO_HouseCodeSupplier
	Where Id = @Id

	If @@Rowcount > 0 
	Begin
		Set @Count = @Count + 1
		Print 'Inserting Record ' + Cast(@Count As Varchar(10)) + ' of ' + Cast(@TotalCount As Varchar(10)) + ' - ID : ' + Cast(@Id As Varchar(10))

		Select @HcmHouseCode = HcmHouseCode From HcmHouseCodes HC 
			Inner Join ESMV2_DC.dbo.AppUnits AU On AU.AppUnit = HC.AppUnit
		Where AU.AppUniBrief = @HouseCode

		Select @PurCatalog = PurCatalog From TeamFinV2_DC.dbo.PurCatalogs PC
			Inner Join TeamFinV2_DC.dbo.PurVendors PV On PC.PurVendor = PV.PurVendor
		Where PurVenNumber = @SupplierNumber
		
		If @PurCatalog Is Not Null And @HcmHouseCode Is Not Null
		Begin
			Insert Into TeamFinV2_DC.dbo.PurCatalogHouseCodes
				( HcmHouseCode
				, PurCatalog
				, PurCatuModBy
				, PurCatuModAt
				)
			Values(
				@HcmHouseCode
				, @PurCatalog
				, IsNull(@EnteredBy, 'Persistech\Data Conversion')
				, IsNull(@EnteredAt, GetDate())
				)
		End
		Else
			Print 'No matching record found. Vendor Number - ' + Cast(@SupplierNumber As Varchar(10))
	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End

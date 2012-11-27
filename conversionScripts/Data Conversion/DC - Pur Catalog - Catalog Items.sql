/*
Select Top 50 * From TeamFinV2_DC.dbo.PurCatalogs
Select * From TeamFinV2_DC.dbo.PurCatalogItems

Truncate Table TeamFinV2_DC.dbo.PurCatalogs
Truncate Table TeamFinV2_DC.dbo.PurCatalogItems
*/

Set NoCount On

Declare @Id Int
	, @SupplierNumber Varchar(50)
	, @SupplierName Varchar(50)
	, @MaxId Int
	, @PurCatalog Int
	, @PurVendor Int

Select @Id = Min(Id), @MaxId = Max(Id) From TeamFin.dbo.PO_Supplier

While 1=1
Begin

	Select @SupplierNumber = SupplierNumber
		, @SupplierName = SupplierName
	From TeamFin.dbo.PO_Supplier 
	Where Id = @Id

	If @@Rowcount > 0 
	Begin

		Select @PurVendor = PurVendor From TeamFinV2_DC.dbo.PurVendors Where PurVenNumber = @SupplierNumber

		Insert Into TeamFinV2_DC.dbo.PurCatalogs
			( PurCatActive
			, PurCatTitle
			, PurVendor
			, PurCatDisplayOrder
			, PurCatModBy
			, PurCatModAt
			)
		Values(
			1 -- Active
			, Left(@SupplierName, 32)
			, @PurVendor
			, 0 -- DisplayOrder
			, 'Persistech\Data Conversion'
			, GetDate()
			)

		Select @PurCatalog = Max(PurCatalog) From TeamFinV2_DC.dbo.PurCatalogs

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
			, TeamFinV2_DC.dbo.PurItems.PurItem
			, Price
			, 0
			, 1
			, IsNull(TFUser, 'Persistech\Data Conversion')
			, IsNull(EnteredAt, GetDate())
		From TeamFinV2_DC.dbo.PurItems
			Join TeamFin.dbo.PO_SupplierItem PSI On PSI.ItemNumber = TeamFinV2_DC.dbo.PurItems.PurIteNumber
		Where SupplierNumber = @SupplierNumber

	End

	Set @Id = @Id + 1
	If @Id > @MaxId Break

End

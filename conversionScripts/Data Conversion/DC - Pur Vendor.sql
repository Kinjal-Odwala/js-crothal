
/*
Select * From [TeamFinV2_DC].[dbo].[PurVendors]
Truncate Table [TeamFinV2_DC].[dbo].[PurVendors]

Select * From [TeamFin].[dbo].[PO_Supplier]
*/

Set NoCount On
Declare @SupplierNumber varchar(30), @SupplierName varchar(250),@Address1 varchar(250)
	, @Address2 varchar(250), @City varchar(50), @State varchar(50), @Zip varchar(50)
	, @POSendMethod varchar(50),@ContactName varchar(100), @Email varchar(500)
	, @bAutoEmail as bit ,@FaxNumber Varchar(50),@PhoneNumber varchar(50), @AppStateType int
	, @PurPOSendMethod int, @Id int, @MaxId int

Select @ID = Min(Id), @MaxId = Max(Id) From [TeamFin].[dbo].[PO_Supplier]

While 1=1
Begin

	Select @SupplierNumber = [SupplierNumber]
		, @SupplierName = [SupplierName]
		, @Address1 = [Address1]
		, @Address2 = [Address2]
		, @City = [City]
		, @State = [State]
		, @Zip = [Zip]
		, @POSendMethod = [POSendMethod]
		, @ContactName = [ContactName]
		, @Email = [Email]
		, @bAutoEmail = [bAutoEmail]
		, @FaxNumber = [FaxNumber]
		, @PhoneNumber = [PhoneNumber]
	From [TeamFin].[dbo].[PO_Supplier]
	Where Id = @ID
	
	If @@RowCount > 0 
	Begin
		Select @AppStateType = AppStateType From ESMV2_DC.dbo.AppStateTypes Where AppStatBrief = @State
		Select @PurPOSendMethod = PurPOSendMethodType From TeamFinV2_DC.dbo.PurPOSendMethodTypes Where PurPosmtBrief = @POSendMethod

		Insert Into [TeamFinV2_DC].[dbo].[PurVendors]
			( [PurVenNumber]
			, [PurVenTitle]
			, [PurVenAddressLine1]
			, [PurVenAddressLine2]
			, [PurVenCity]
			, [AppStateType]
			, [PurVenZip]
			, [PurPOSendMethodType]
			, [PurVenContactName]
			, [PurVenEmail]
			, [PurVenAutoEmail]
			, [PurVenFaxNumber]
			, [PurVenPhoneNumber]
			, [PurVenDisplayOrder]
			, [PurVenActive]
			, [PurVenModBy]
			, [PurVenModAt])
		Values
			( @SupplierNumber
			, @SupplierName
			, IsNull(@Address1, '')
			, IsNull(@Address2, '')
			, @City
			, @AppStateType
			, @Zip
			, @PurPOSendMethod
			, @ContactName
			, @Email
			, @bAutoEmail
			, @FaxNumber
			, @PhoneNumber
			, 0
			, 'true'
			, 'Persistech\Data Conversion'
			, GetDate())
		End

	Set @ID = @ID + 1
	If @ID > @MaxId Break

End


/*
Select * From [TeamFinv2_DC].[dbo].[PurItems]
Truncate Table [TeamFinv2_DC].[dbo].[PurItems]

Select Top 10 * From [TeamFin].[dbo].[PO_ITEM]
*/

Set NoCount on

Declare @ItemNumberID varchar(100)
	, @ItemNumber varchar(100)
	, @ItemNumber2 varchar(100)
	, @Description varchar(250)
	, @ComClass varchar(240)
	, @ComSubClass varchar(250)
	, @SuppClass varchar(250)
	, @Uom varchar(250)
	, @GLAccountNumber varchar(50)
	, @FscAccount int
	, @Id int
	, @MaxId int

Select @ID = Min(Id), @MaxId = Max(Id) From [TeamFin].[dbo].[PO_ITEM]

While 1=1
Begin

	Select @ItemNumberID = [ItemNumberID]
		  , @ItemNumber = [ItemNumber]
		  , @ItemNumber2 = [ItemNumber2]
		  , @Description = [Description]
		  , @ComClass = [ComClass]
		  , @ComSubClass = [ComSubClass]
		  , @SuppClass = [SuppClass]
		  , @Uom = [Uom]
		  , @GLAccountNumber = [GLAccountNumber]
	From [TeamFin].[dbo].[PO_ITEM]
	Where Id = @ID

	If @@RowCount > 0 
	Begin

		Select @FscAccount = FscAccount From [TeamFinV2_DC].[dbo].[FscAccounts] Where FscAccCode = @GLAccountNumber

		Insert Into [TeamFinv2_DC].[dbo].[PurItems]
			( [PurIteMasterId]
			, [PurIteNumber]
			, [PurIteNumber2]
			, [PurIteDescription]
			, [PurIteComClass]
			, [PurIteComSubClass]
			, [PurIteSupplierClass]
			, [PurIteUom]
			, [FscAccount]
			, [PurItePrice]
			, [PurIteDisplayOrder]
			, [PurIteActive]
			, [PurIteModBy]
			, [PurIteModAt])
		 Values
			( @ItemNumberID
			, @ItemNumber
			, @ItemNumber2
			, @Description
			, @ComClass
			, @ComSubClass
			, @SuppClass
			, @Uom
			, @FscAccount
			, 0.00
			, 1
			, 1
			, 'Persistech\Data Conversion'
			, Getdate())
	End
	
	Set @ID = @ID + 1
	If @ID > @MaxId Break
	
End
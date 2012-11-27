-- Select * From TeamFinV2_DC.dbo.HcmRemitToLocations
-- Truncate Table TeamFinV2_DC.dbo.HcmRemitToLocations

Set NoCount On

Declare @PayTo varchar(100)
	, @PayToStreet1 varchar(100)
	, @PayToStreet2 varchar(100)
	, @PayToCity varchar(50)
	, @PayToState varchar(50)
	, @PayToZip varchar(15)
	, @AppStateType int

Declare tmpCur Cursor For
	Select Payto, PaytoStreet1, PaytoStreet2, PaytoCity, PaytoState, PaytoZip
	From TeamFin.dbo.SiteSetup
	Where Id In (
		Select Max(Id)
		From Teamfin.dbo.SiteSetup
		Group By Payto
		)
	And Payto Is Not Null And Payto <> ''

Open TmpCur

While 1=1
Begin

	Fetch Next From tmpCur Into @PayTo, @PayToStreet1, @PayToStreet2, @PayToCity, @PayToState, @PayToZip 
	If @@Fetch_STatus <> 0 Break

	Select @AppStateType = IsNull(AppStateType, 0) From ESMV2_DC.dbo.AppSTateTypes Where AppStatBrief = @PayToSTate

	Insert Into TeamFinV2_DC.dbo.HcmRemitToLocations
		(HcmRemtlTitle, HcmRemtlAddress1, HcmRemtlAddress2, HcmRemtlCity, AppStateType, HcmRemtlZip, HcmRemtlDisplayOrder, HcmRemtlACtive, HcmRemtlModAt, HcmRemtlModBy)
	Values(@PayTo, @PayToStreet1, @PayToStreet2, @PayToCity, IsNull(@AppStateType, 0), @PayToZip, 0, 1, Getdate(), 'Persistech\Data Conversion')

End

Close tmpCur
DeAllocate tmpCur
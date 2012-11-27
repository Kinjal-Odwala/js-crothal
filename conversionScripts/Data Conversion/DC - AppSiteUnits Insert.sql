use ESMV2_DC
go

Truncate Table ESMV2_DC.dbo.AppSiteUnits

Declare @AppUnit Int

Declare tmpCur Cursor For
	Select AppUnit From ESMV2_DC.dbo.AppUnits

Open tmpCur

While 1=1
Begin

	Fetch From tmpCur Into @AppUnit
	If @@Fetch_Status <> 0 Break

	Insert Into ESMV2_DC.dbo.AppSiteUnits Values(@AppUnit, @AppUnit)
End

Close tmpCur
Deallocate tmpCur

Declare 
	@AppUnit Int
	, @AppUniBrief Varchar(16)
	, @HirNode Int

Set NoCount On

-- AppUnit HirNode Update
Declare tmpCur Cursor For 
	Select AppUnit, AppUniBrief From ESMV2_DC.dbo.AppUnits

Open tmpCur

While 1=1
Begin

	Fetch from tmpCur Into @AppUnit, @AppUniBrief
	If @@Fetch_STatus <> 0 Break

	Select Top 1 @HirNode = Hirnode From ESMV2_DC.dbo.Hirnodes Where HirNodBrief = @AppUniBrief
	
	If @HirNode > 0
		Update ESMV2_DC.dbo.AppUnits 
		Set HirNode = @HirNode
		Where AppUnit = @AppUnit
	Else
		Print @AppUniBrief

End

Close tmpCur
Deallocate tmpCur
--End AppUnit HirNode Update

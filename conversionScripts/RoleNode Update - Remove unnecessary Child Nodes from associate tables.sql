Set NoCount On
Declare @FullPath Varchar(5000), @AppRole Int, @RowsAffected Int
--Security Nodes Clear
Declare tmpCur Cursor For
Select HirNodFullPath, AppRole 
	From AppRoleNodes arn, HirNodes hn
		Where arn.HirNode = hn.HirNode 
			Order by AppRole, HirNodFullPath Desc

Open tmpCur

While 1=1
Begin
	
	Fetch Next From tmpCur Into @FullPath, @AppRole
	If @@Fetch_Status <> 0  Break

	--Print @FullPath
	--Print @AppRole
	Delete From AppRoleNodes Where AppRole = @AppRole And HirNode In (
		Select hn.HirNode
			From AppRoleNodes arn, HirNodes hn
				Where HirHierarchy = 1 And arn.HirNode = hn.HirNode And AppRole = @AppRole And HirNodFullPath Like @FullPath + '\%'
	)
	Set @RowsAffected = @@Rowcount
	If @RowsAffected > 0 
	Begin
		Print Cast(@RowsAffected As Varchar) + ' : child node/s removed for AppRole:' + Cast(@AppRole As Varchar) + ', and parent node path: ' + @FullPath
	End
End

Close tmpCur
Deallocate tmpCur

--ORG Nodes Clear
Set NoCount On
Declare @FullPath Varchar(5000), @AppRole Int, @RowsAffected Int
Declare tmpCur Cursor For
Select HirNodFullPath, AppRole 
	From AppRoleNodes arn, HirNodes hn
		Where arn.HirNode = hn.HirNode
			Order by AppRole, HirNodFullPath Desc

Open tmpCur

While 1=1
Begin
	
	Fetch Next From tmpCur Into @FullPath, @AppRole
	If @@Fetch_Status <> 0  Break

	--Print @FullPath
	--Print @AppRole
	Delete From AppRoleNodes Where AppRole = @AppRole And HirNode In (
		Select hn.HirNode
			From AppRoleNodes arn, HirNodes hn
				Where HirHierarchy = 2 And arn.HirNode = hn.HirNode And AppRole = @AppRole And HirNodFullPath Like @FullPath + '\%'
	)
	Set @RowsAffected = @@Rowcount
	If @RowsAffected > 0 
	Begin
		Print Cast(@RowsAffected As Varchar) + ' : child node/s removed for AppRole:' + Cast(@AppRole As Varchar) + ', and parent node path: ' + @FullPath
	End
	
End

Close tmpCur
Deallocate tmpCur

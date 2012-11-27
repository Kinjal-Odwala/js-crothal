/*
This script builds HirNode Hierarchy (Management, Security) using old TeamFin DB. 
It also uses ESMV2_DC.AppMenuItemsMaster table which has pre-populated menu items for all applications.
ESM, Coach, TeamFin etc.
*/

Truncate Table ESMV2_DC.dbo.HirNodes
--Select Top 100 * From ESMV2_DC.dbo.HirNodes
--Select * From ESMV2_DC.dbo.hirnodes Where HirHierarchy = 1
--Select Top 100 * From ESMV2_DC.dbo.hirnodes Where HirHierarchy = 2

Set NoCount On

-- HirHierarchy >> Management - 2
-- HirLevel >> 37-ENT 2-SVP 3-RVP 4-RM 7-Unit
EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 2, 0, 37, 'crothall', 'crothall', 'crothall', 8, 1, 'Persistech\Data Conversion'

Declare @HirHierarchy int
	, @HirNodBrief varchar(16)
	, @HirNodTitle varchar(64)
	, @HirNodDescription varchar(256)
	, @HirNodeParent int
	, @HirNode int
	, @HirLevel int
	, @HirNodDisplayOrder int
	, @HirNodActive bit
	, @HirNodModBy varchar(50)
	, @DisplayOrder int
	, @Level Int
	, @ParentNode Int
	, @SiteName Varchar(500)
	, @HouseCode Varchar(20)
	, @RM Varchar(5)
	, @ParentSVP Varchar(500)
	, @ParentRVP Varchar(500)
	, @ParentRM Varchar(500)
	, @SVPCOde Varchar(3)
	, @RVPCOde Varchar(3)
	, @RMCOde Varchar(3)

Select @DisplayOrder = Max(HirnodDisplayOrder) From ESMV2_DC.dbo.HirNodes
--SVP
Set @Level = 2 --SVP

-- ii.framework.esm.crothall.chimes.fin.coa.svp
Declare tmpCurSVP Cursor For
--Select hirNode, hirHierarchy, hirNodeParent, hirLevel, hirNodTitle, hirNodBrief, hirNodDescription, hirNodDisplayOrder, hirNodActive, HirNodModBy
Select 0, 2, 1, 2, Left(Rtrim(Ltrim(SVP)),64), Left(Rtrim(Ltrim(Code)),16), Left(Rtrim(Ltrim(SVP)),256), 0, 1, 'Persistech\Data Conversion', Code
From TeamFin.dbo.SeniorVicePresident
Order By SVP

Open tmpCurSVP

While 1=1
Begin

	Fetch From tmpCurSVP Into @HirNode, @HirHierarchy,  @HirNodeParent, @HirLevel, @HirNodTitle, @HirNodBrief, @HirNodDescription, @HirNodDisplayOrder, @HirNodActive, @HirNodModBy, @SVPCode
	If @@Fetch_STatus <> 0 Break

	EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] @HirNode, @HirHierarchy, @HirNodeParent, @Level, 
		@HirNodTitle, @HirNodBrief, @HirNodDescription, @DisplayOrder, @HirNodActive, @HirNodModBy

	Set @ParentSVP = @HirNodDescription

	--RVP
	Set @Level = 3 --RVP

	Select @ParentNode = Max(HirNode) From ESMV2_DC.dbo.HirNodes Where HirHierarchy = 2

	Declare tmpCurRVP Cursor For
	 --Select hirNode, hirHierarchy, hirNodeParent, hirLevel, hirNodTitle, hirNodBrief, hirNodDescription, hirNodDisplayOrder, hirNodActive, HirNodModBy
	Select 0, 2, @ParentNode, @Level, Left(Rtrim(Ltrim(RVP.VP)),64), Left(Rtrim(Ltrim(RVP.Code)),16), Left(Rtrim(Ltrim(RVP.VP)),256), 0, 1, 'Persistech\Data Conversion', RVP.Code
	From TeamFin.dbo.Hierarchysvprvp HSVP
		Join TeamFin.dbo.SEniorVicePresident SVP On HSVP.SVP = SVP.Code
		Join TeamFin.dbo.RegionalVicePresident RVP On HSVP.RVP = RVP.Code
	Where SVP.SVP = @HirNodDescription
	Order By RVP.VP --SVP.SVP,
	
	Open tmpCurRVP

	While 1=1
	Begin

		Fetch From tmpCurRVP Into @HirNode, @HirHierarchy,  @HirNodeParent, @HirLevel, @HirNodTitle, @HirNodBrief, @HirNodDescription, @HirNodDisplayOrder, @HirNodActive, @HirNodModBy, @RVPCode
		If @@Fetch_STatus <> 0 Break

		EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] @HirNode, @HirHierarchy, @HirNodeParent, @HirLevel, 
		@HirNodTitle, @HirNodBrief, @HirNodDescription, @DisplayOrder, @HirNodActive, @HirNodModBy
		
		Set @ParentRVP = @HirNodDescription
		
		--RM
		Set @Level = 4  --RM

		Select @ParentNode = Max(HirNode) From ESMV2_DC.dbo.HirNodes Where HirHierarchy = 2

		Declare tmpCurRM Cursor For
		--Select hirNode, hirHierarchy, hirNodeParent, hirLevel, hirNodTitle, hirNodBrief, hirNodDescription, hirNodDisplayOrder, hirNodActive, HirNodModBy
		Select 0, 2, @ParentNode, @Level, Left(Rtrim(Ltrim(RM.Region)),64), Left(Rtrim(Ltrim(RM.Code)),16), Left(Rtrim(Ltrim(RM.Region)),256), 0, 1, 'Persistech\Data Conversion', RM.Code
		From TeamFin.dbo.Hierarchyrvprm HRVP
			Join TeamFin.dbo.RegionalVicePresident RVP On HRVP.RVP = RVP.Code
			Join TeamFin.dbo.RegionalManager RM On HRVP.RM = RM.Code
		Where RVP.VP = @HirNodDescription
		Order By RM.Region  --RVP.VP,
		
		Open tmpCurRM

		While 1=1
		Begin

			Fetch From tmpCurRM Into @HirNode, @HirHierarchy, @HirNodeParent, @HirLevel, @HirNodTitle, @HirNodBrief, @HirNodDescription, @HirNodDisplayOrder, @HirNodActive, @HirNodModBy, @RMCode
			If @@Fetch_STatus <> 0 Break

			EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] @HirNode, @HirHierarchy, @HirNodeParent, @HirLevel, 
			@HirNodTitle, @HirNodBrief, @HirNodDescription, @DisplayOrder, @HirNodActive, @HirNodModBy

			Set @ParentRM = @HirNodDescription
			
			-- Unit
			Set @Level = 7  --Unit

			Select @ParentNode = Max(HirNode) From ESMV2_DC.dbo.HirNodes Where HirHierarchy = 2

			Declare tmpCurUnit Cursor For
			--Select hirNode, hirHierarchy, hirNodeParent, hirLevel, hirNodTitle, hirNodBrief, hirNodDescription, hirNodDisplayOrder, hirNodActive, HirNodModBy
			Select 0, 2, @ParentNode, @Level, Left(Rtrim(Ltrim(SiteName)),64), Left(Rtrim(Ltrim(HouseCode)),16), Left(Rtrim(Ltrim(SiteName)),256), 0, 1, 'Persistech\Data Conversion'
			From TeamFin.dbo.SiteInfo
			Where RM = @RMCode And RVP = @RVPCode And SVP = @SVPCode 
			Order by Id
			
			Open tmpCurUnit

			While 1=1
			Begin

				Fetch From tmpCurUnit Into @HirNode, @HirHierarchy, @HirNodeParent, @HirLevel, @HirNodTitle, @HirNodBrief, @HirNodDescription, @HirNodDisplayOrder, @HirNodActive, @HirNodModBy
				If @@Fetch_STatus <> 0 Break

				If (@DisplayOrder > 0)
					EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] @HirNode, @HirHierarchy, @HirNodeParent, @HirLevel, 
						@HirNodTitle, @HirNodBrief, @HirNodDescription, @DisplayOrder, @HirNodActive, @HirNodModBy

				Set @DisplayOrder = @DisplayOrder + 1
			End

			Close tmpCurUnit
			Deallocate tmpCurUnit
			-- End Unit

			Set @DisplayOrder = @DisplayOrder + 1
		End

		Close tmpCurRM
		Deallocate tmpCurRM
		-- End RM

		Set @DisplayOrder = @DisplayOrder + 1
	End

	Close tmpCurRVP
	Deallocate tmpCurRVP
	-- End RVP

	Set @DisplayOrder = @DisplayOrder + 1

End

Close tmpCurSVP
Deallocate tmpCurSVP
--End SVP

/*Insert hinodes for Security Hierarchy (Application Menu Items) ESM, Coach, Fin*/

Declare @AppMenuItem Int
	, @AppMenuAction Int
	, @AppMenuActionPrevious Int
	, @AppMenuState Int
	, @AppMenIBrief Varchar(16)
	, @AppMenITitle Varchar(64)
	, @AppMenIActive Bit
	, @AppMenIDisplayOrder Int
	, @AppMenIId  Varchar(16)
	, @AppMenIActionData  Varchar(500)

-- HirHierarchy >> Sec - 1
-- HirLevel >> 8-Ent, 30-Suite, 32-Application, 33-Menu
-- hirNode, hirHierarchy, hirNodeParent, hirLevel, hirNodTitle, hirNodBrief, hirNodDescription, hirNodDisplayOrder, hirNodActive, HirNodModBy
EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, 0, 8, 'ii', 'ii', 'ii', 1, 1, 'Persistech\Data Conversion'
Set @HirNodeParent = (Select HirNode From ESMV2_DC.dbo.HirNodes Where HirNodFullPath = '\ii' And HirHierarchy = 1 )

EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, @HirNodeParent, 30, 'framework', 'framework', 'framework', 2, 1, 'Persistech\Data Conversion'
Set @HirNodeParent = @HirNodeParent + 1

EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, @HirNodeParent, 32, 'esm', 'esm', 'esm', 3, 1, 'Persistech\Data Conversion'

EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, 0, 8, 'crothall', 'crothall', 'crothall', 4, 1, 'Persistech\Data Conversion'
Set @HirNodeParent = @HirNodeParent + 2

EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, @HirNodeParent, 30, 'chimes', 'chimes', 'chimes', 5, 1, 'Persistech\Data Conversion'
Set @HirNodeParent = @HirNodeParent + 1

EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, @HirNodeParent, 32, 'fin', 'fin', 'fin', 6, 1, 'Persistech\Data Conversion'

EXEC ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, 1, @HirNodeParent, 32, 'coa', 'coa', 'coa', 7, 1, 'Persistech\Data Conversion'

Select @DisplayOrder = Max(HirnodDisplayOrder) From ESMV2_DC.dbo.HirNodes Where HirHierarchy = 1 
--Set @HirNodeParent (Select HirNode From ESMV2_DC.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin'

Set @HirLevel = 33
Set @HirHierarchy = 1

--ESMMenu
Declare tmpCur Cursor For 
	Select AppMenuItem, AppMenuAction, AppMenuState, AppMenIBrief, AppMenITitle, AppMenIActive, AppMenIDisplayOrder, AppMenIId, AppMenIActionData
	From ESMV2_DC.dbo.AppMenuItemsMaster 
	Where App = 'ESM'
	Order By AppMenIDisplayOrder

Open tmpCur

While 1=1
Begin

	Fetch From tmpCur Into @AppMenuItem, @AppMenuAction, @AppMenuState, @AppMenIBrief, @AppMenITitle, @AppMenIActive, @AppMenIDisplayOrder, @AppMenIId, @AppMenIActionData
	If @@Fetch_STatus <> 0 Break

	If @AppMenuAction = 1
		Set @HirNodeParent = (Select HirNode From ESMV2_DC.dbo.HirNodes Where HirNodFullPath = '\ii\framework\esm' And HirHierarchy = 1)
	Else If @AppMenuActionPrevious = 1
		Set @HirNodeParent = @HirNode

	EXEC @HirNode = ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, @HirHierarchy, @HirNodeParent, @HirLevel, 
		@AppMenITitle, @AppMenIBrief, @AppMenITitle, @DisplayOrder, 1, 'Persistech\Data Conversion'

	Update ESMV2_DC.dbo.AppMenuItems 
	Set HirNode = @HirNode 
	Where AppMenITitle = @AppMenITitle And AppMenIDisplayOrder = @AppMenIDisplayOrder
	
	If @@RowCount = 0
		Insert Into ESMV2_DC.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt)
		Values(@AppMenuAction, @AppMenuState, @HirNode, @AppMenIBrief, @AppMenITitle, @AppMenIActive, @AppMenIDisplayOrder, @AppMenIId, @AppMenIActionData, 'Persistech\Data Conversion', GetDate())
	
	Set @DisplayOrder = @DisplayOrder + 1
	Set @AppMenuActionPrevious = @AppMenuAction
End

Close tmpCur
Deallocate tmpCur
--End ESMMenu

--CoachMenu
Declare tmpCur Cursor For 
	Select AppMenuItem, AppMenuAction, AppMenuState, AppMenIBrief, AppMenITitle, AppMenIActive, AppMenIDisplayOrder, AppMenIId, AppMenIActionData
	From ESMV2_DC.dbo.AppMenuItemsMaster 
	Where App = 'Coach'
	Order By AppMenIDisplayOrder

Open tmpCur

While 1=1
Begin

	Fetch From tmpCur Into @AppMenuItem, @AppMenuAction, @AppMenuState, @AppMenIBrief, @AppMenITitle, @AppMenIActive, @AppMenIDisplayOrder, @AppMenIId, @AppMenIActionData
	If @@Fetch_STatus <> 0 Break

	If @AppMenuAction = 1
		Set @HirNodeParent = (Select HirNode From ESMV2_DC.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\coa' And HirHierarchy = 1)
	Else If @AppMenuActionPrevious = 1
		Set @HirNodeParent = @HirNode

	EXEC @HirNode = ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, @HirHierarchy, @HirNodeParent, @HirLevel, 
		@AppMenITitle, @AppMenIBrief, @AppMenITitle, @DisplayOrder, 1, 'Persistech\Data Conversion'

	Update ESMV2_DC.dbo.AppMenuItems 
	Set HirNode = @HirNode 
	Where AppMenITitle = @AppMenITitle And AppMenIDisplayOrder = @AppMenIDisplayOrder
	
	If @@RowCount = 0
		Insert Into ESMV2_DC.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt)
		Values(@AppMenuAction, @AppMenuState, @HirNode, @AppMenIBrief, @AppMenITitle, @AppMenIActive, @AppMenIDisplayOrder, @AppMenIId, @AppMenIActionData, 'Persistech\Data Conversion', GetDate())
	
	Set @DisplayOrder = @DisplayOrder + 1
	Set @AppMenuActionPrevious = @AppMenuAction
End

Close tmpCur
Deallocate tmpCur
--End CoachMenu

--Fin Menu
Declare tmpCur Cursor For 
	Select AppMenuItem, AppMenuAction, AppMenuState, AppMenIBrief, AppMenITitle, AppMenIActive, AppMenIDisplayOrder, AppMenIId, AppMenIActionData
	From ESMV2_DC.dbo.AppMenuItemsMaster 
	Where App = 'Fin'
	Order By AppMenIDisplayOrder

Open tmpCur

While 1=1
Begin

	Fetch From tmpCur Into @AppMenuItem, @AppMenuAction, @AppMenuState, @AppMenIBrief, @AppMenITitle, @AppMenIActive, @AppMenIDisplayOrder, @AppMenIId, @AppMenIActionData
	If @@Fetch_STatus <> 0 Break

	If @AppMenuAction = 1
		Set @HirNodeParent = (Select HirNode From ESMV2_DC.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin' And HirHierarchy = 1)
	Else If @AppMenuActionPrevious = 1
		Set @HirNodeParent = @HirNode

	EXEC @HirNode = ESMV2_DC.dbo.[HirNodeUpdateAltered] 0, @HirHierarchy, @HirNodeParent, @HirLevel, 
		@AppMenITitle, @AppMenIBrief, @AppMenITitle, @DisplayOrder, 1, 'Persistech\Data Conversion'

	Update ESMV2_DC.dbo.AppMenuItems 
	Set HirNode = @HirNode 
	Where AppMenITitle = @AppMenITitle And AppMenIDisplayOrder = @AppMenIDisplayOrder
	
	If @@RowCount = 0
		Insert Into ESMV2_DC.dbo.AppMenuItems(AppMenuAction, AppMenuState, HirNode, AppMeniBrief, AppMeniTitle, AppMeniActive, AppMeniDisplayOrder, AppMeniID, AppMeniActionData, AppMeniModBy, AppMeniModAt)
		Values(@AppMenuAction, @AppMenuState, @HirNode, @AppMenIBrief, @AppMenITitle, @AppMenIActive, @AppMenIDisplayOrder, @AppMenIId, @AppMenIActionData, 'Persistech\Data Conversion', GetDate())
	
	Set @DisplayOrder = @DisplayOrder + 1
	Set @AppMenuActionPrevious = @AppMenuAction
End

Close tmpCur
Deallocate tmpCur
--End FinMenu
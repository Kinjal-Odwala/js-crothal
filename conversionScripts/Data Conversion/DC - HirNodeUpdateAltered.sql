USE [ESMV2_DC]
GO
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
  
CREATE PROCEDURE [dbo].[HirNodeUpdateAltered](	
	@HirNode Int = Null
	, @HirHierarchy Int = Null
	, @HirNodeParent Int = Null 
	, @HirLevel Int = Null 
	, @HirNodTitle Varchar(64) 
	, @HirNodBrief Varchar(16) 
	, @HirNodDescription Varchar(256) 
	, @HirNodDisplayOrder Int = 0
	, @HirNodActive Bit
	, @HirNodModBy Varchar(50)  
)   
AS  
Begin  
	Declare @HirNodFullPath Varchar(1000)
		, @HirNodLevelList Varchar(1000)
		, @HirNodLevel Varchar(256)
		, @HirNodLevel1 Varchar(256)
		, @HirNodLevel2 Varchar(256)
		, @HirNodLevel3 Varchar(256)
		, @HirNodLevel4 Varchar(256)
		, @HirNodLevel5 Varchar(256) 
		, @HirNodLevel6 Varchar(256)
		, @HirNodLevel7 Varchar(256)
		, @HirNodLevel8 Varchar(256)
		, @HirNodLevel9 Varchar(256)
		, @HirNodLevel10 Varchar(256)
		, @HirNodLevel11 Varchar(256) 
		, @HirNodLevel12 Varchar(256)
		, @HirNodLevel13 Varchar(256)
		, @HirNodLevel14 Varchar(256)
		, @HirNodLevel15 Varchar(256)
		, @HirNodLevel16 Varchar(256)
		, @HirNodLevelCounter Int
		, @ChildNode Int
	  
		-- Find out if the record already exists  
		If EXISTS (Select * From dbo.HirNodes Where HirNode = @HirNode)  
		Begin  
			-- We are updating a current record  
			-- Get the variables that cannot be changed  
			Select @HirHierarchy = HirHierarchy --, @HirNodeParent = HirNodeParent --, @HirLevel = HirLevel  
			From dbo.HirNodes Where HirNode = @HirNode  
		End  
		Else
		Begin  
			-- This is a new record  
			-- Set the id to null  
			Set @HirNode = NULL  
		End 
	  
		-- Get the fullpath of the node  
		Set @HirNodFullPath = (Select HirNodFullPath From dbo.HirNodes Where HirNode = @HirNodeParent) + '\' + @HirNodTitle  

		-- In case of root element where we do not have parent node
		If @HirNodFullPath Is Null Set @HirNodFullPath = '\' + @HirNodTitle 
		  
		-- If there is a parent... add it to the full path  
		-- IF EXISTS (SELECT * FROM HirNodes WHERE HirNode = @HirNodeParent)  
		-- SET @HirNodFullPath = dbo.HirNodFullPathReturn(@HirNodeParent) + @HirNodFullPath  
		  
		-- Break down the full path so that it can be put into the hir node levels  
		Set @HirNodLevelCounter = 0  
		Set @HirNodLevelList = RTrim(@HirNodFullPath)  

		While Len(@HirNodLevelList) > 0  
		Begin  
			If CharIndex('\', @HirNodLevelList) > 0  
			Begin  
				Set @HirNodLevel = Left(@HirNodLevelList, CharIndex('\', @HirNodLevelList) - 1)  
				Set @HirNodLevelList = Right(@HirNodLevelList, Len(@HirNodLevelList) - CharIndex('\', @HirNodLevelList))  
			End  
			Else  
			Begin 
				Set @HirNodLevel = @HirNodLevelList  
				Set @HirNodLevelList = ''  
			End  
		  
			-- Find out which level we are going to set  
			-- This first iteration is ignored (because it is blank)  
			If @HirNodLevelCounter = 1 Set @HirNodLevel1 = @HirNodLevel  
			If @HirNodLevelCounter = 2 Set @HirNodLevel2 = @HirNodLevel  
			If @HirNodLevelCounter = 3 Set @HirNodLevel3 = @HirNodLevel  
			If @HirNodLevelCounter = 4 Set @HirNodLevel4 = @HirNodLevel  
			If @HirNodLevelCounter = 5 Set @HirNodLevel5 = @HirNodLevel  
			If @HirNodLevelCounter = 6 Set @HirNodLevel6 = @HirNodLevel  
			If @HirNodLevelCounter = 7 Set @HirNodLevel7 = @HirNodLevel  
			If @HirNodLevelCounter = 8 Set @HirNodLevel8 = @HirNodLevel  
			If @HirNodLevelCounter = 9 Set @HirNodLevel9 = @HirNodLevel  
			If @HirNodLevelCounter = 10 Set @HirNodLevel10 = @HirNodLevel  
			If @HirNodLevelCounter = 11 Set @HirNodLevel11 = @HirNodLevel  
			If @HirNodLevelCounter = 12 Set @HirNodLevel12 = @HirNodLevel  
			If @HirNodLevelCounter = 13 Set @HirNodLevel13 = @HirNodLevel  
			If @HirNodLevelCounter = 14 Set @HirNodLevel14 = @HirNodLevel  
			If @HirNodLevelCounter = 15 Set @HirNodLevel15 = @HirNodLevel  
			If @HirNodLevelCounter = 16 Set @HirNodLevel16 = @HirNodLevel  
		   
			Set @HirNodLevelCounter = @HirNodLevelCounter + 1		   
		End   
	  
		-- See if this is a new record or existing  
		If @HirNode Is Null
		Begin  
			-- This is a new record... insert it  
			Insert Into dbo.HirNodes
				( HirHierarchy
				, HirLevel
				, HirNodeParent
				, HirNodBrief
				, HirNodTitle
				, HirNodDescription
				, HirNodDisplayOrder
				, HirNodActive
				, HirNodFullPath
				, HirNodLevel1
				, HirNodLevel2
				, HirNodLevel3
				, HirNodLevel4
				, HirNodLevel5
				, HirNodLevel6
				, HirNodLevel7
				, HirNodLevel8
				, HirNodLevel9
				, HirNodLevel10
				, HirNodLevel11
				, HirNodLevel12
				, HirNodLevel13
				, HirNodLevel14
				, HirNodLevel15
				, HirNodLevel16
				, HirNodModBy
				, HirNodModAt
				)  
			Values 
				( @HirHierarchy
				, @HirLevel
				, @HirNodeParent
				, @HirNodBrief
				, @HirNodTitle
				, @HirNodDescription
				, @HirNodDisplayOrder
				, @HirNodActive
				, @HirNodFullPath
				, @HirNodLevel1
				, @HirNodLevel2
				, @HirNodLevel3
				, @HirNodLevel4
				, @HirNodLevel5
				, @HirNodLevel6
				, @HirNodLevel7
				, @HirNodLevel8
				, @HirNodLevel9
				, @HirNodLevel10
				, @HirNodLevel11
				, @HirNodLevel12
				, @HirNodLevel13
				, @HirNodLevel14
				, @HirNodLevel15
				, @HirNodLevel16
				, @HirNodModBy
				, GetDate())  
		  
			-- Get the identity of the new record  
			Set @HirNode = SCOPE_IDENTITY()  
		  
		End 
		Else
		Begin 
			-- This is an existing record... update it  
			Update dbo.HirNodes 
			Set HirLevel = @HirLevel
				, HirNodeParent = @HirNodeParent
				, HirNodBrief = @HirNodBrief
				, HirNodTitle = @HirNodTitle
				, HirNodDescription = @HirNodDescription
				, HirNodDisplayorder = @HirNodDisplayOrder 
				, HirNodActive = @HirNodActive
				, HirNodFullPath = @HirNodFullPath
				, HirNodLevel1 = @HirNodLevel1
				, HirNodLevel2 = @HirNodLevel2
				, HirNodLevel3 = @HirNodLevel3
				, HirNodLevel4 = @HirNodLevel4
				, HirNodLevel5 = @HirNodLevel5
				, HirNodLevel6 = @HirNodLevel6
				, HirNodLevel7 = @HirNodLevel7
				, HirNodLevel8 = @HirNodLevel8
				, HirNodLevel9 = @HirNodLevel9
				, HirNodLevel10 = @HirNodLevel10
				, HirNodLevel11 = @HirNodLevel11
				, HirNodLevel12 = @HirNodLevel12
				, HirNodLevel13 = @HirNodLevel13
				, HirNodLevel14 = @HirNodLevel14
				, HirNodLevel15 = @HirNodLevel15
				, HirNodLevel16 = @HirNodLevel16
				, HirNodModBy = @HirNodModBy
				, HirNodModAt = GetDate()  
			Where HirNode = @HirNode  
		  
		End
End
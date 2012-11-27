-- Test Server Path [TST-SQL2005-AZ1]
CREATE DATABASE [ESMv2_DC]  ON (NAME = N'ESMv2_DC', FILENAME = N'D:\Microsoft SQL Server\MSSQL.1\MSSQL\DATA\ESMv2_DC.mdf', SIZE = 20, FILEGROWTH = 1) LOG ON (NAME = N'ESMv2_DC_log', FILENAME = N'D:\Microsoft SQL Server\MSSQL.1\MSSQL\DATA\ESMv2_DC_log.LDF', MAXSIZE = 2097152, FILEGROWTH = 10%)
COLLATE SQL_Latin1_General_CP1_CI_AS
GO

/*
-- Local Server Path [SSI-SQL2]
CREATE DATABASE [ESMv2_DC]  ON (NAME = N'ESMv2_DC', FILENAME = N'D:\MSSQL\Data\ESMv2_DC.mdf', SIZE = 20, FILEGROWTH = 1) LOG ON (NAME = N'ESMv2_DC_log', FILENAME = N'D:\MSSQL\Data\ESMv2_DC_log.LDF', MAXSIZE = 2097152, FILEGROWTH = 10%)
COLLATE SQL_Latin1_General_CP1_CI_AS
GO
*/

exec sp_dboption N'ESMv2_DC', N'autoclose', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'bulkcopy', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'trunc. log', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'torn page detection', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'read only', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'dbo use', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'single', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'autoshrink', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'ANSI null default', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'recursive triggers', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'ANSI nulls', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'concat null yields null', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'cursor close on commit', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'default to local cursor', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'quoted identifier', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'ANSI warnings', N'false'
GO

exec sp_dboption N'ESMv2_DC', N'auto create statistics', N'true'
GO

exec sp_dboption N'ESMv2_DC', N'auto update statistics', N'true'
GO

if( (@@microsoftversion / power(2, 24) = 8) and (@@microsoftversion & 0xffff >= 724) )
	exec sp_dboption N'ESMv2_DC', N'db chaining', N'false'
GO

USE ESMv2_DC

CREATE TABLE [AppAlertClearTypes] (
	[AppAlertClearType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppAlectBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAlectTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAlectDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAlectDisplayOrder] [int] NULL ,
	[AppAlectActive] [bit] NOT NULL CONSTRAINT [DF_AppAlertClearTypes_AppAlectActive] DEFAULT ((1)),
	[AppAlectModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAlectModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppAlertClearType] PRIMARY KEY CLUSTERED 
	(
		[AppAlertClearType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppAlertDisplayTypes] (
	[AppAlertDisplayType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppAledtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAledtTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAledtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAledtDisplayOrder] [int] NULL ,
	[AppAledtActive] [bit] NOT NULL CONSTRAINT [DF_AppAlertDisplayTypes_AppAledtActive] DEFAULT ((1)),
	[AppAledtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAledtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppAlertDisplayType] PRIMARY KEY CLUSTERED 
	(
		[AppAlertDisplayType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppAlertExclusions] (
	[AppAlertExclusion] [int] IDENTITY (1, 1) NOT NULL ,
	[AppAlert] [int] NOT NULL ,
	[AppAlertClearType] [int] NOT NULL ,
	[AppUser] [int] NOT NULL ,
	[AppAleeModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAleeModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppAlertExclusion] PRIMARY KEY CLUSTERED
	(
		[AppAlertExclusion]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppAlerts] (
	[AppAlert] [int] IDENTITY (1, 1) NOT NULL ,
	[AppAlertType] [int] NOT NULL ,
	[AppAlertDisplayType] [int] NOT NULL ,
	[AppAlertClearType] [int] NOT NULL ,
	[HirNode] [int] NULL ,
	[AppUser] [int] NULL ,
	[AppAleModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAleModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppAlert] PRIMARY KEY CLUSTERED
	(
		[AppAlert]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppAlertTypes] (
	[AppAlertType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppAletBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAletTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAletDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAletDisplayOrder] [int] NULL ,
	[AppAletActive] [bit] NOT NULL CONSTRAINT [DF_AppAlertTypes_AppAletActive] DEFAULT ((1)),
	[AppAletModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppAletModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppAlertType] PRIMARY KEY CLUSTERED 
	(
		[AppAlertType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppFunctionalAreas] (
	[AppFunctionalArea] [int] IDENTITY (1, 1) NOT NULL ,
	[AppFunaBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppFunaTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppFunaDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppFunaActive] [bit] NOT NULL CONSTRAINT [DF_AppFunctionalAreas_AppFunaActive] DEFAULT ((1)),
	[AppFunaModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppFunaModAt] [datetime] NULL ,
	CONSTRAINT [PK_AppFunctionalArea] PRIMARY KEY CLUSTERED
	(
		[AppFunctionalArea]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppGPOTypes] (
	[AppGPOType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppGPOtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppGPOtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppGPOtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppGPOtDisplayOrder] [int] NULL ,
	[AppGPOtActive] [bit] NOT NULL ,
	[AppGPOtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppGPOtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppGPOType] PRIMARY KEY CLUSTERED
	(
		[AppGPOType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppGroupUsers] (
	[AppGroupUser] [int] IDENTITY (1, 1) NOT NULL ,
	[HirGroup] [int] NOT NULL ,
	[AppUser] [int] NOT NULL ,
	[AppGrouModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppGrouModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppGroupUser] PRIMARY KEY CLUSTERED
	(
		[AppGroupUser]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppIndustryTypes] (
	[AppIndustryType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppIndtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppIndtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppIndtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppIndtDisplayOrder] [int] NULL ,
	[AppIndtActive] [bit] NOT NULL ,
	[AppIndtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppIndtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppIndustryType] PRIMARY KEY CLUSTERED
	(
		[AppIndustryType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppLocationTypes] (
	[AppLocationType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppLoctBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppLoctTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppLoctDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppLoctDisplayOrder] [int] NULL ,
	[AppLoctActive] [bit] NOT NULL ,
	[AppLoctModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppLoctModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppLocationType] PRIMARY KEY CLUSTERED 
	(
		[AppLocationType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppMenuActions] (
	[AppMenuAction] [int] IDENTITY (1, 1) NOT NULL ,
	[AppMenaBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMenaTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMenaDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMenaDisplayOrder] [int] NULL ,
	[AppMenaActive] [bit] NOT NULL CONSTRAINT [DF_AppMenuActions_AppMenaActive] DEFAULT ((1)),
	[AppMenaModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMenaModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppMenuAction] PRIMARY KEY CLUSTERED 
	(
		[AppMenuAction]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppMenuDisplayTypes] (
	[AppMenuDisplayType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppMendtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMendtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMendtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMendtDisplayOrder] [int] NOT NULL ,
	[AppMendtActive] [bit] NOT NULL ,
	[AppMendtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMendtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppMenuDisplayType] PRIMARY KEY CLUSTERED
	(
		[AppMenuDisplayType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppMenuItems] (
	[AppMenuItem] [int] IDENTITY (1, 1) NOT NULL ,
	[AppMenuAction] [int] NOT NULL ,
	[AppMenuState] [int] NOT NULL ,
	[AppMenuDisplayType] [int] NOT NULL CONSTRAINT [DF_AppMenuItems_AppMenuDisplayType] DEFAULT ((1)),
	[HirNode] [int] NOT NULL ,
	[AppMeniBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppMeniTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMeniDisplayOrder] [int] NULL ,
	[AppMeniActive] [bit] NOT NULL CONSTRAINT [DF_AppMenuItems_AppMeniActive] DEFAULT ((1)),
	[AppMeniID] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMeniActionData] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppMeniModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMeniModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppMenuItem] PRIMARY KEY CLUSTERED
	(
		[AppMenuItem]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppMenuItemsMaster] (
	[AppMenuItem] [int] IDENTITY (1, 1) NOT NULL ,
	[AppMenuAction] [int] NOT NULL ,
	[AppMenuState] [int] NOT NULL ,
	[AppMenIBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppMenITitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
    [AppMenIDisplayOrder] [int] NULL ,
	[AppMenIActive] [bit] NOT NULL ,	
	[AppMenIId] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMenIActionData] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[App] [varchar] (5) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL 
) ON [PRIMARY]
GO


CREATE TABLE [AppMenuStates] (
	[AppMenuState] [int] IDENTITY (1, 1) NOT NULL ,
	[AppMensBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMensTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMensDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMensDisplayOrder] [int] NULL ,
	[AppMensActive] [bit] NOT NULL CONSTRAINT [DF_AppMenuStates_AppMensActive] DEFAULT ((1)),
	[AppMensModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppMensModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppMenuState] PRIMARY KEY CLUSTERED 
	(
		[AppMenuState]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppOwnershipTypes] (
	[AppOwnershipType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppOwntBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppOwntTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppOwntDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppOwntDisplayOrder] [int] NULL ,
	[AppOwntActive] [bit] NOT NULL ,
	[AppOwntModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppOwntModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppOwnershipType] PRIMARY KEY CLUSTERED 
	(
		[AppOwnershipType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppPrimaryBusinessTypes] (
	[AppPrimaryBusinessType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppPribtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppPribtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppPribtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppPribtDisplayOrder] [int] NULL ,
	[AppPribtActive] [bit] NOT NULL ,
	[AppPribtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppPribtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppPrimaryBusinessType] PRIMARY KEY CLUSTERED 
	(
		[AppPrimaryBusinessType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppProfitDesignationTypes] (
	[AppProfitDesignationType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppProdtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppProdtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppProdtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppProdtDisplayOrder] [int] NULL ,
	[AppProdtActive] [bit] NOT NULL ,
	[AppProdtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppProdtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppProfitDesignationType] PRIMARY KEY CLUSTERED 
	(
		[AppProfitDesignationType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppRoleGroups] (
	[AppRoleGroup] [int] IDENTITY (1, 1) NOT NULL ,
	[AppRole] [int] NOT NULL ,
	[HirGroup] [int] NOT NULL ,
	[AppRolgModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppRolgModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppRoleGroup] PRIMARY KEY CLUSTERED 
	(
		[AppRoleGroup]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppRoleNodes] (
	[AppRoleNode] [int] IDENTITY (1, 1) NOT NULL ,
	[AppRole] [int] NOT NULL ,
	[HirNode] [int] NOT NULL ,
	[AppRolnModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppRolnModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppRoleNode] PRIMARY KEY CLUSTERED 
	(
		[AppRoleNode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppRoles] (
	[AppRole] [int] IDENTITY (1, 1) NOT NULL ,
	[AppUser] [int] NOT NULL ,
	[HirNodeTop] [int] NULL ,
	[HirNodeCurrent] [int] NULL ,
	[AppRolTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[AppRolModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppRolModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppRole] PRIMARY KEY CLUSTERED 
	(
		[AppRole]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppSites] (
	[AppSite] [int] IDENTITY (1, 1) NOT NULL ,
	[AppIndustryType] [int] NULL ,
	[AppPrimaryBusinessType] [int] NOT NULL ,
	[AppLocationType] [int] NULL ,
	[AppTraumaLevelType] [int] NULL ,
	[AppProfitDesignationType] [int] NULL ,
	[AppGPOType] [int] NULL ,
	[AppOwnershipType] [int] NULL ,
	[AppSitTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSitAddressLine1] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSitAddressLine2] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppSitCity] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppStateType] [int] NOT NULL ,
	[AppSitPostalCode] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSitCounty] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[AppSitSpecifyGPO] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[AppSitActive] [bit] NOT NULL ,
	[AppSitVersion] [int] NOT NULL ,
	[AppSitCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSitCrtdAt] [datetime] NOT NULL ,
	[AppSitModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSitModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_AppSite] PRIMARY KEY CLUSTERED 
	(
		[AppSite]
	)  ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [AppSiteUnits] (
	[AppSiteUnit] [int] IDENTITY (1, 1) NOT NULL ,
	[AppSite] [int] NOT NULL ,
	[AppUnit] [int] NOT NULL ,
	CONSTRAINT [PK_AppSiteUnit] PRIMARY KEY CLUSTERED 
	(
		[AppSiteUnit]
	)  ON [PRIMARY]
) ON [PRIMARY]
GO

CREATE TABLE [AppStateTypes] (
	[AppStateType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppStatBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppStatTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppStatDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppStatDisplayOrder] [int] NULL ,
	[AppStatActive] [bit] NOT NULL ,
	[AppStatModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppStatModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppStateType] PRIMARY KEY CLUSTERED 
	(
		[AppStateType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppTraumaLevelTypes] (
	[AppTraumaLevelType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppTraltBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTraltTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTraltDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTraltDisplayOrder] [int] NULL ,
	[AppTraltActive] [bit] NOT NULL ,
	[AppTraltModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTraltModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppTraumaLevelType] PRIMARY KEY CLUSTERED 
	(
		[AppTraumaLevelType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppUnits] (
	[AppUnit] [int] IDENTITY (1, 1) NOT NULL ,
	[HirNode] [int] NOT NULL ,
	[AppUniBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppUniTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppUniDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppUniDisplayOrder] [int] NULL ,
	[AppUniActive] [bit] NOT NULL ,
	[AppUniModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppUniModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppUnit] PRIMARY KEY CLUSTERED 
	(
		[AppUnit]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE TABLE [AppUsers] (
	[AppUser] [int] IDENTITY (1, 1) NOT NULL ,
	[PplPerson] [int] NOT NULL ,
	[AppRoleCurrent] [int] NULL ,
	[HirNodeTop] [int] NULL ,
	[HirNodeCurrent] [int] NULL ,
	[AppUseBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF_AppUsers_AppUseBrief] DEFAULT (''),	
	[AppUseUserName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppUsePassword] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppUseActive] [bit] NOT NULL CONSTRAINT [DF_AppUsers_AppUseActive] DEFAULT ((1)),
	[AppUseModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppUseModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_AppUser] PRIMARY KEY CLUSTERED 
	(
		[AppUser]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppZipCodeTypes] (
	[AppZipCodeType] [int] IDENTITY (1, 1) NOT NULL ,
	[AppStateType] [int] NOT NULL ,
	[AppZipctZipCode] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppZipctCity] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppZipctCounty] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	CONSTRAINT [PK_AppZipCodeType] PRIMARY KEY CLUSTERED  
	(
		[AppZipCodeType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HirGroupNodes] (
	[HirGroupNode] [int] IDENTITY (1, 1) NOT NULL ,
	[HirNode] [int] NOT NULL ,
	[HirGroup] [int] NOT NULL ,
	[HirGronModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGronModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HirGroupNode] PRIMARY KEY CLUSTERED
	(
		[HirGroupNode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HirGroups] (
	[HirGroup] [int] IDENTITY (1, 1) NOT NULL ,
	[hirGroupType] [int] NOT NULL ,
	[HirGroBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGroTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGroDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGroActive] [bit] NOT NULL CONSTRAINT [DF_HirGroups_HirGroActive] DEFAULT ((1)),
	[HirGroModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGroModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HirGroup] PRIMARY KEY CLUSTERED 
	(
		[HirGroup]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HirGroupTypes] (
	[HirGroupType] [int] IDENTITY (1, 1) NOT NULL ,
	[HirHierarchy] [int] NOT NULL ,
	[HirGrotBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGrotTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGrotDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[HirGrotDisplayOrder] [int] NOT NULL CONSTRAINT [DF_HirGroupTypes_HirGrotDisplayOrder] DEFAULT ((1)),
	[HirGrotActive] [bit] NOT NULL CONSTRAINT [DF_HirGroupTypes_HirGrotActive] DEFAULT ((0)),
	[HirGrotModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirGrotModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HirGroupType] PRIMARY KEY CLUSTERED
	(
		[HirGroupType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HirHierarchies] (
	[HirHierarchy] [int] IDENTITY (1, 1) NOT NULL ,
	[HirHieBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirHieTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirHieDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirHieActive] [bit] NOT NULL ,
	[HirHieHirLevelDepthToTrack] [tinyint] NOT NULL ,
	[HirHieWarnDepthExceeded] [bit] NOT NULL CONSTRAINT [DF_HirHierarchies_HirHieWarnDepthExceeded] DEFAULT ((0)),
	[HirHieErrorDepthExceeded] [bit] NOT NULL CONSTRAINT [DF_HirHierarchies_HirHieErrorDepthExceeded] DEFAULT ((0)),
	[HirHieEditable] [bit] NOT NULL CONSTRAINT [DF_HirHierarchies_HirHieEditable] DEFAULT ((1)),
	[HirHieModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirHieModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_HirHierarchy] PRIMARY KEY CLUSTERED 
	(
		[HirHierarchy]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE TABLE [HirLevels] (
	[HirLevel] [int] IDENTITY (1, 1) NOT NULL ,
	[HirHierarchy] [int] NOT NULL ,
	[HirLevelParent] [int] NULL ,
	[HirLevBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirLevTitle] [varchar] (30) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirLevDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirLevDisplayOrder] [int] NULL ,
	[HirLevActive] [bit] NOT NULL CONSTRAINT [DF_HirLevels_HirLevActive] DEFAULT ((1)),
	[HirLevFullPath] [varchar] (2000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirLevSource] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirLevReference] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirLevModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirLevModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_HirLevel] PRIMARY KEY CLUSTERED 
	(
		[HirLevel]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HirNodes] (
	[HirNode] [int] IDENTITY (1, 1) NOT NULL ,
	[HirHierarchy] [int] NOT NULL ,
	[HirLevel] [int] NULL ,
	[HirNodeParent] [int] NULL ,
	[HirNodBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirNodTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirNodDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirNodDisplayOrder] [int] NULL ,
	[HirNodActive] [bit] NOT NULL CONSTRAINT [DF_HirNodes_HirNodActive] DEFAULT ((1)),
	[HirNodFullPath] [varchar] (1000) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirNodLevel1] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel2] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel3] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel4] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel5] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel6] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel7] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel8] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel9] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel10] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel11] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel12] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel13] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel14] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel15] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodLevel16] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodSource] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodReference] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HirNodModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HirNodModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_HirNode] PRIMARY KEY CLUSTERED 
	(
		[HirNode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE INDEX [IX_HirNodeParent] ON [dbo].[HirNodes]([HirNodeParent]) ON [PRIMARY]
GO

/*
CREATE TABLE [META_DB_DEPLOY_CONFIGURATIONS] (
	[META_DB_DEPLOY_CONFIGURATION] [bigint] IDENTITY (1, 1) NOT NULL ,
	[META_DB_DEPLOY_TYPE] [bigint] NOT NULL ,
	[META_DB_DEPLOY_TBL_SEL_SCHEMA] [bigint] NOT NULL CONSTRAINT [DF__META_DB_D__META___027D5126] DEFAULT ((1)),
	[META_DB_DEPLOY_TBL_SEL_DATA] [bigint] NOT NULL CONSTRAINT [DF__META_DB_D__META___0371755F] DEFAULT ((2)),
	[META_DBDC_TITLE] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[META_DBDC_TRANSFER_STATIC_DATA] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___04659998] DEFAULT ('Y'),
	[META_DBDC_TRANSFER_TYPES_DATA] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___0559BDD1] DEFAULT ('Y'),
	[META_DB_DEPLOY_LOG_TYPE] [bigint] NOT NULL CONSTRAINT [DF__META_DB_D__META___064DE20A] DEFAULT ((1)),
	[META_DBDC_TEMP_EXCLUDE_SCHEMA] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___07420643] DEFAULT ('Y'),
	[META_DBDC_TEMP_EXCLUDE_DATA] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___08362A7C] DEFAULT ('Y'),
	[META_DBDC_BACKUP_PERFORM] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___092A4EB5] DEFAULT ('Y'),
	[META_DBDC_BACKUP_LOCATION] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[META_DBDC_TRANSFER_MAX_ROWS] [bigint] NOT NULL CONSTRAINT [DF__META_DB_D__META___0A1E72EE] DEFAULT ((0)),
	CONSTRAINT [CC1259719567282] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_CONFIGURATION]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_DATA_TABLES] (
	[META_DB_DEPLOY_DATA_TABLE] [bigint] IDENTITY (1, 1) NOT NULL ,
	[META_DB_DEPLOY_CONFIGURATION] [bigint] NOT NULL ,
	[META_DBDDT_NAME] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[META_DBDDT_ACTIVE] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___0CFADF99] DEFAULT ('Y'),
	CONSTRAINT [CC1259720459938] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_DATA_TABLE]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_DDL_LOG_TYPES] (
	[META_DB_DEPLOY_LOG_TYPE] [bigint] NOT NULL ,
	[META_DBDLT_TITLE] [varchar] (32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	CONSTRAINT [CC1260293708207] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_LOG_TYPE]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_FILTER_TABLES] (
	[META_DB_DEPLOY_FILTER_TABLE] [bigint] IDENTITY (1, 1) NOT NULL ,
	[META_DB_DEPLOY_CONFIGURATION] [bigint] NOT NULL ,
	[META_DBDFT_NAME] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[META_DBDFT_ACTIVE] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___11BF94B6] DEFAULT ('Y'),
	[META_DBDFT_FILTER_CLAUSE] [varchar] (2048) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	CONSTRAINT [CC1260413366782] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_FILTER_TABLE]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_SCHEMA_TABLES] (
	[META_DB_DEPLOY_SCHEMA_TABLE] [bigint] IDENTITY (1, 1) NOT NULL ,
	[META_DB_DEPLOY_CONFIGURATION] [bigint] NOT NULL ,
	[META_DBDST_NAME] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[META_DBDST_ACTIVE] [char] (1) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF__META_DB_D__META___149C0161] DEFAULT ('Y'),
	CONSTRAINT [CC1259720281001] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_SCHEMA_TABLE]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_TARGETS] (
	[META_DB_DEPLOY_TARGET] [bigint] IDENTITY (1, 1) NOT NULL ,
	[META_DBDT_SERVER] [varchar] (32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[META_DBDT_NAME] [varchar] (128) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[META_DBDT_CONNECTION_STRING] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	CONSTRAINT [CC1259718308063] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_TARGET]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_TBL_SELECT_TYPES] (
	[META_DB_DEPLOY_TBL_SELECT_TYPE] [bigint] NOT NULL ,
	[META_DBDTST_TITLE] [varchar] (96) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	CONSTRAINT [CC1259720026126] PRIMARY KEY CLUSTERED 
	(
		[META_DB_DEPLOY_TBL_SELECT_TYPE]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [META_DB_DEPLOY_TYPES] (
	[META_DB_DEPLOY_TYPE] [bigint] NOT NULL ,
	[META_DBDT_TITLE] [varchar] (32) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	CONSTRAINT [CC1259718546126] PRIMARY KEY  CLUSTERED 
	(
		[META_DB_DEPLOY_TYPE]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO
*/

CREATE TABLE [PplPeople] (
	[PplPerson] [int] IDENTITY (1, 1) NOT NULL ,
	[HirNode] [int] NULL ,
	[PplPeoBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoFirstName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoLastName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoMiddleName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoAddressLine1] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoAddressLine2] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoCity] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppStateType] [tinyint] NOT NULL ,
	[PplPeoPostalCode] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoHomePhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoFax] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoCellPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoEmail] [varchar] (150) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoPager] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoActive] [bit] NOT NULL ,
	[PplPeoModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPeoModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PplPerson] PRIMARY KEY CLUSTERED 
	(
		[PplPerson]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PplPerformers] (
	[PplPerformer] [int] IDENTITY (1, 1) NOT NULL ,
	[PplPerson] [int] NOT NULL ,
	[HirNodeDefaultUnit] [int] NULL ,
	[AppFunctionalArea] [int] NOT NULL CONSTRAINT [DF_PplPerformers_AppFunctionalArea] DEFAULT ((0)),
	[PplPerBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPerActive] [bit] NOT NULL ,
	[PplPerPin] [int] NOT NULL ,
	[PplPerJobTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PplPerZone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[PplPerModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPerModAt] [datetime] NOT NULL CONSTRAINT [DF_PplPerformers_PplPerModAt] DEFAULT (getdate()),
	CONSTRAINT [PK_PplPerformer] PRIMARY KEY CLUSTERED 
	(
		[PplPerformer]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PplPerformerSkills] (
	[PplPerformerSkill] [int] IDENTITY (1, 1) NOT NULL ,
	[PplPerformer] [int] NOT NULL ,
	[PplSkill] [int] NOT NULL ,	
	[PplPersBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPersYearsOfExperience] [int] NOT NULL ,
	[PplPersActive] [bit] NOT NULL ,
	[PplPersModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPersModAt] [datetime] NOT NULL CONSTRAINT [DF_PplPerformerSkills_PplPersModAt] DEFAULT (getdate()),
	CONSTRAINT [PK_PplPerformerSkill] PRIMARY KEY CLUSTERED
	(
		[PplPerformerSkill]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PplPersonRoles] (
	[PplPersonRole] [int] IDENTITY (1, 1) NOT NULL ,
	[PplPerson] [int] NOT NULL ,
	[PplRole] [int] NOT NULL ,
	[PplPerrModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplPerrModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PplPeopleRole] PRIMARY KEY CLUSTERED 
	(
		[PplPersonRole]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PplRoles] (
	[PplRole] [int] IDENTITY (1, 1) NOT NULL ,
	[PplRolBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplRolTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplRolDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplRolDisplayOrder] [int] NOT NULL ,
	[PplRolActive] [bit] NOT NULL ,
	[PplRolModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplRolModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PplRole] PRIMARY KEY CLUSTERED 
	(
		[PplRole]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PplSkills] (
	[PplSkill] [int] IDENTITY (1, 1) NOT NULL ,
	[PplSkillType] [int] NOT NULL ,	
	[PplSkiBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplSkiTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplSkiActive] [bit] NOT NULL ,
	[PplSkiModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplSkiModAt] [datetime] NOT NULL CONSTRAINT [DF_PplSkills_PplSkiModAt] DEFAULT (getdate()),
	CONSTRAINT [PK_PplSkill] PRIMARY KEY CLUSTERED 
	(
		[PplSkill]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PplSkillTypes] (
	[PplSkillType] [int] IDENTITY (1, 1) NOT NULL ,
	[PplSkitBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplSkitTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PplSkitDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF_PplSkillTypes_PplSkitDescription] DEFAULT (''),
	[PplSkitDisplayOrder] [int] NOT NULL CONSTRAINT [DF_PplSkillTypes_PplSkitDisplayOrder] DEFAULT ((0)),
	[PplSkitActive] [bit] NOT NULL ,
	[PplSkitModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL CONSTRAINT [DF_PplSkillTypes_PplSkitModBy] DEFAULT (''),
	[PplSkitModAt] [datetime] NOT NULL CONSTRAINT [DF_PplSkillTypes_PplSkitModAt] DEFAULT (getdate()),
	CONSTRAINT [PK_PplSkillType] PRIMARY KEY CLUSTERED 
	(
		[PplSkillType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO
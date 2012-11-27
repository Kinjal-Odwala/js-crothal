-- Test Server Path [TST-SQL2005-AZ1]
CREATE DATABASE [TeamFinv2_DC]  ON (NAME = N'TeamFinv2_DC', FILENAME = N'D:\Microsoft SQL Server\MSSQL.1\MSSQL\DATA\TeamFinv2_DC.mdf', SIZE = 20, FILEGROWTH = 1) LOG ON (NAME = N'TeamFinv2_DC_log', FILENAME = N'D:\Microsoft SQL Server\MSSQL.1\MSSQL\DATA\TeamFinv2_DC_log.LDF', SIZE = 1, MAXSIZE = 2097152, FILEGROWTH = 10%)
COLLATE SQL_Latin1_General_CP1_CI_AS
GO

-- Local Server Path [SSI-SQL2]
/*
CREATE DATABASE [TeamFinv2_DC]  ON (NAME = N'TeamFinv2_DC', FILENAME = N'D:\MSSQL\Data\TeamFinv2_DC.mdf', SIZE = 20, FILEGROWTH = 1) LOG ON (NAME = N'TeamFinv2_DC_log', FILENAME = N'D:\MSSQL\Data\TeamFinv2_DC_log.LDF', SIZE = 1, MAXSIZE = 2097152, FILEGROWTH = 10%)
COLLATE SQL_Latin1_General_CP1_CI_AS
GO
*/

exec sp_dboption N'TeamFinv2_DC', N'autoclose', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'bulkcopy', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'trunc. log', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'torn page detection', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'read only', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'dbo use', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'single', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'autoshrink', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'ANSI null default', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'recursive triggers', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'ANSI nulls', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'concat null yields null', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'cursor close on commit', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'default to local cursor', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'quoted identifier', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'ANSI warnings', N'false'
GO

exec sp_dboption N'TeamFinv2_DC', N'auto create statistics', N'true'
GO

exec sp_dboption N'TeamFinv2_DC', N'auto update statistics', N'true'
GO

if( (@@microsoftversion / power(2, 24) = 8) and (@@microsoftversion & 0xffff >= 724) )
	exec sp_dboption N'TeamFinv2_DC', N'db chaining', N'false'
GO

USE TeamFinv2_DC

CREATE TABLE [AppJDEGLTransactions] (
	[AppJDEGLTransaction] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscAccount] [int] NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[AppJDEtDocumentType] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppJDEtDocumentNo] [int] NOT NULL ,
	[AppJDEtLineNumber] [float] NOT NULL ,
	[AppJDEtTeamFinId] [int] NULL ,
	[AppJDEtTableType] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[AppJDEtGLDate] [datetime] NULL ,
	[AppJDEtPost] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtAmount] [float] NULL ,
	[AppJDEtVendor] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtDescription] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtInvoiceNo] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtInvoiceDate] [datetime] NULL ,
	[AppJDEtPurchaseOrderNumber] [int] NULL ,
	[AppJDEtVendorNumber] [float] NULL ,	
	[AppJDEtCentury] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtDocumentCompany] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppJDEtCrtdAt] [datetime] NULL CONSTRAINT [DF_AppJDEGLTransactions_AppJDEtCrtdAt] DEFAULT (getdate()),
	[JDEId] [int] NULL ,
	CONSTRAINT [PK_AppJDEGLTransaction] PRIMARY KEY CLUSTERED 
	(
		[AppJDEGLTransaction]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_AppJDEGLTransaction] ON [dbo].[AppJDEGLTransactions]([AppJDEtDocumentType], [AppJDEtDocumentNo], [AppJDEtLineNumber], [AppJDEtGLDate]) ON [PRIMARY]
GO

CREATE  INDEX [IX_AppJDEGLTransaction_HouseCode] ON [dbo].[AppJDEGLTransactions]([HcmHouseCode], [FscAccount], [AppJDEtGLDate]) ON [PRIMARY]
GO


CREATE TABLE [AppSystemVariables] (
	[AppSystemVariable] [int] IDENTITY (1, 1) NOT NULL ,
	[AppSysBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppSysTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppSysDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppSysVariableName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSysVariableValue] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppSysDisplayOrder] [int] NULL ,
	[AppSysActive] [bit] NOT NULL CONSTRAINT [DF_AppSystemVariables_AppSysActive] DEFAULT ((1)),
	[AppSysModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppSysModAt] [datetime] NOT NULL CONSTRAINT [DF_AppSystemVariables_AppSysModAt] DEFAULT (getdate()),
	CONSTRAINT [PK_AppSystemVariable] PRIMARY KEY CLUSTERED 
	(
		[AppSystemVariable]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [AppTransactionStatusTypes] (
	[AppTransactionStatusType] [int] NOT NULL ,
	[AppTrastBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTrastTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTrastDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTrastDisplayOrder] [int] NULL ,
	[AppTrastActive] [bit] NOT NULL ,
	[AppTrastModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppTrastModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_AppTransactionStatusType] PRIMARY KEY CLUSTERED 
	(
		[AppTransactionStatusType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudAnnualBudgetDetails] (
	[BudAnnualBudgetDetail] [int] IDENTITY (1, 1) NOT NULL ,
	[FscYear] [int] NULL ,
	[BudAnnbdStartDate] [datetime] NULL ,
	[BudAnnbdCutOffDate] [datetime] NULL ,
	[BudAnnbdLiabilityRate] [decimal](10, 1) NULL ,
	[BudAnnbdLiabilityFscAccounts] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudAnnbdStartFscPeriod] [int] NULL ,
	[BudAnnbdEndFscPeriod] [int] NULL ,
	[BudAnnbdPercent] [decimal](18, 0) NULL ,	
	[BudAnnbdAnnouncement] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	CONSTRAINT [PK_BudAnnualBudgetDetail] PRIMARY KEY CLUSTERED 
	(
		[BudAnnualBudgetDetail]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudAnnualBudgets] (
	[BudAnnualBudget] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscYear] [int] NULL ,
	[BudAnnbLockedDown] [bit] NULL CONSTRAINT [DF_BudAnnualBudgets_BudAnnbLockedDown] DEFAULT ((0)),
	[BudAnnbExported] [bit] NULL ,
	[BudAnnbBudgetStartDate] [datetime] NULL ,
	[BudAnnbBudgetStartedBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudAnnbCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudAnnbCrtdAt] [datetime] NULL ,	
	CONSTRAINT [PK_BudAnnualBudget] PRIMARY KEY CLUSTERED 
	(
		[BudAnnualBudget]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudBillingPeriods] (
	[BudBillingPeriod] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[FscYear] [int] NULL ,
	[BudBillpRate] [decimal](16, 2) NULL ,
	[BudBillpPercentIncrease] [decimal](16, 2) NULL ,
	[BudBillpDateEffective] [datetime] NULL ,
	[BudBillpDescription] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudBillpCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudBillpCrtdAt] [datetime] NULL ,
	CONSTRAINT [PK_BudBillingPeriod] PRIMARY KEY CLUSTERED 
	(
		[BudBillingPeriod]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudBudgetSummaries] (
	[BudBudgetSummary] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscAccount] [int] NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[AppTransactionStatusType] [int] NULL CONSTRAINT [DF_BudBudgetSummaries_AppTransactionStatusType] DEFAULT ((1)),
	[RevTableType] [varchar] (8) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudBudsAmount] [decimal](16, 2) NULL ,
	[BudBudsActualAmount] [decimal](16, 2) NULL ,
	[BudBudsForecastAmount] [decimal](16, 2) NULL ,	
	[BudBudsForecastStatus] [int] NULL ,
	[BudBudsLastForecastChange] [datetime] NULL ,
	[BudBudsBudgetModified] [bit] NULL ,
	[BudBudsForecastModified] [bit] NULL ,
	[BudBudsNonBudgetedCode] [bit] NULL ,	
	[BudBudsjcmJDECompany] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[BudBudsJDEId] [int] NULL ,	
	[BudBudsComment] [varchar] (2500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudBudsActive] [bit] NULL CONSTRAINT [DF_BudBudgetSummaries_BudBudsActive] DEFAULT ((1)),
	[BudBudsCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudBudsCrtddAt] [datetime] NULL CONSTRAINT [DF_BudBudgetSummaries_BudBudsCrtddAt] DEFAULT (getdate()),
	[BudBudsModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudBudsModAt] [datetime] NULL CONSTRAINT [DF_BudBudgetSummaries_BudBudsModAt] DEFAULT (getdate()),
	[OldId] [int] NULL CONSTRAINT [DF_BudBudgetSummaries_OldId] DEFAULT ((0)),
	CONSTRAINT [PK_BudBudgetSummary] PRIMARY KEY CLUSTERED 
	(
		[BudBudgetSummary]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudBudgetWORForecasts] (
	[BudBudgetWORForecast] [int] IDENTITY (1, 1) NOT NULL ,
	[BudBudgetSummary] [int] NOT NULL ,
	[FscYear] [int] NULL CONSTRAINT [DF_BudBudgetWORForecasts_FscYear] DEFAULT ((0)),
	[FscPeriod] [int] NULL CONSTRAINT [DF_BudBudgetWORForecasts_FscPeriod] DEFAULT ((0)),
	[AppTransactionStatusType] [int] NULL ,
	[BudBudworfAmount] [decimal](16, 2) NOT NULL CONSTRAINT [DF_BudBudgetWORForecasts_BudBudworfAmount] DEFAULT ((0)),
	[BudBudworfBudWeek] [int] NULL CONSTRAINT [DF_BudBudgetWORForecasts_BudBudworfBudWeek] DEFAULT ((0)),
	[BudBudworfModified] [bit] NOT NULL CONSTRAINT [DF_BudBudgetWORForecasts_BudBudworfModified] DEFAULT ((0)),
	[BudBudworfActive] [bit] NOT NULL CONSTRAINT [DF_BudBudgetWORForecasts_BudBudworfActive] DEFAULT ((1)),
	[BudBudworfCrtdAt] [datetime] NOT NULL CONSTRAINT [DF_BudBudgetWORForecasts_BudBudworfCrtdAt] DEFAULT (getdate()),
	[BudBudworfCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudBudworfModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudBudworfModAt] [datetime] NOT NULL ,	
	[OldId] [int] NULL CONSTRAINT [DF_BudBudgetWORForecasts_OldId] DEFAULT ((0)),
	CONSTRAINT [PK_BudBudgetWORForecast] PRIMARY KEY CLUSTERED 
	(
		[BudBudgetWORForecast]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudIncomeTypes] (
	[BudIncomeType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[FscAccount] [int] NOT NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[BudInctAmount] [decimal](16, 2) NULL CONSTRAINT [DF_BudIncomeTypes_BudInctAmount] DEFAULT ((0.00)),
	[BudInctCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudInctCrtdAt] [datetime] NULL ,
	CONSTRAINT [PK_BudIncomeType] PRIMARY KEY CLUSTERED 
	(
		[BudIncomeType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudShiftTypes] (
	[BudShiftType] [int] IDENTITY (1, 1) NOT NULL ,
	[BudShitBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudShitTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudShitDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudShitDisplayOrder] [int] NOT NULL ,
	[BudShitActive] [bit] NOT NULL ,
	[BudShitModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudShitModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_BudShiftType] PRIMARY KEY CLUSTERED 
	(
		[BudShiftType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudStaffingHours] (
	[BudStaffingHour] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[FscYear] [int] NOT NULL ,
	[BudUnit] [int] NOT NULL ,
	[BudShiftType] [int] NOT NULL ,
	[BudStahCurrentSunday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentSunday] DEFAULT ((0)),
	[BudStahCurrentMonday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentMonday] DEFAULT ((0)),
	[BudStahCurrentTuesday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentTuesday] DEFAULT ((0)),
	[BudStahCurrentWednesday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentWednesday] DEFAULT ((0)),
	[BudStahCurrentThursday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentThursday] DEFAULT ((0)),
	[BudStahCurrentFriday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentFriday] DEFAULT ((0)),
	[BudStahCurrentSaturday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentSaturday] DEFAULT ((0)),
	[BudStahCurrentHolidays] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahCurrentHolidays] DEFAULT ((0)),
	[BudStahProposedSunday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedSunday] DEFAULT ((0)),
	[BudStahProposedMonday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedMonday] DEFAULT ((0)),
	[BudStahProposedTuesday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedTuesday] DEFAULT ((0)),
	[BudStahProposedWednesday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedWednesday] DEFAULT ((0)),
	[BudStahProposedThursday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedThursday] DEFAULT ((0)),
	[BudStahProposedFriday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedFriday] DEFAULT ((0)),
	[BudStahProposedSaturday] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedSaturday] DEFAULT ((0)),
	[BudStahProposedHolidays] [decimal](8, 2) NOT NULL CONSTRAINT [DF_BudStaffingHours_BudStahProposedHolidays] DEFAULT ((0)),
	[BudStahModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudStahModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_BudStaffingHour] PRIMARY KEY CLUSTERED 
	(
		[BudStaffingHour]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [BudUnits] (
	[BudUnit] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[BudUniBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudUniTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudUniDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[BudUniDisplayOrder] [int] NULL ,
	[BudUniActive] [bit] NOT NULL ,
	[BudUniModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[BudUniModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_BudUnit] PRIMARY KEY CLUSTERED 
	(
		[BudUnit]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpDeviceGroupTypes] (
	[EmpDeviceGroupType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpDevgtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpDevgtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpDevgtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpDevgtDisplayOrder] [int] NULL ,
	[EmpDevgtActive] [bit] NOT NULL ,
	[EmpDevgtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpDevgtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpDeviceGroupType] PRIMARY KEY CLUSTERED 
	(
		[EmpDeviceGroupType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpEmployeeGenerals] (
		[EmpEmployeeGeneral] [int] IDENTITY (1, 1) NOT NULL ,
		[PplPerson] [int] NOT NULL ,
		[HcmHouseCode] [int] NULL ,	
		[HcmHouseCodeJob] [int] NULL ,
		[PayPayrollCompany] [int] NOT NULL ,
		[PayPayFrequencyType] [int] NULL ,
		[AppTransactionStatusType] [int] NULL ,
		[EmpI9Type] [int] NULL ,
		[EmpVetType] [int] NULL ,
		[EmpSeparationCode] [int] NULL ,
		[EmpJobStartReasonType] [int] NULL ,				
		[EmpStatusType] [int] NOT NULL ,
		[EmpStatusCategoryType] [int] NULL ,	
		[EmpJobCodeType] [int] NULL ,
		[EmpWorkShift] [int] NULL ,
		[EmpMaritalStatusType] [int] NULL ,
		[EmpDeviceGroupType] [int] NULL ,
		[EmpUnionType] [int] NULL ,
		[EmpGenderType] [int] NULL,
		[EmpEthnicityType] [int] NULL,
		[EmpEmpgBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
		[EmpEmpgActive] [bit] NULL ,
		[EmpEmpgSSN] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
		[EmpEmpgEmployeeNumber] [int] NOT NULL ,
		[EmpEmpgCrothallEmployee] [bit] NOT NULL ,	
		[EmpRateChangeReasonType] [int] NULL ,
		[EmpEmpgRateChangeDate] [datetime] NULL ,
		[EmpTerminationReasonType] [int] NULL ,
		[EmpEmpgTerminationDate] [datetime] NULL ,	
		[EmpEmpgExempt] [bit] NOT NULL ,	
		[EmpEmpgHourly] [bit] NOT NULL ,
		[EmpEmpgHireDate] [datetime] NOT NULL ,		
		[EmpEmpgOriginalHireDate] [datetime] NULL ,
		[EmpEmpgEffectiveDate] [datetime] NULL ,
		[EmpEmpgSeniorityDate] [datetime] NULL ,		
		[EmpEmpgBenefitsPercentage] [int] NOT NULL ,
		[EmpEmpgScheduledHours] [int] NOT NULL ,
		[EmpEmpgUnion] [bit] NOT NULL ,	
		[EmpEmpgExportETax] [bit] NULL ,
		[EmpEmpgExportEBase] [bit] NULL ,
		[EmpEmpgExportECard] [bit] NULL ,
		[EmpEmpgExportEPerson] [bit] NULL ,
		[EmpEmpgExportEJob] [bit] NULL ,
		[EmpEmpgExportEComp] [bit] NULL ,
		[EmpEmpgExportEPayroll] [bit] NULL ,
		[EmpEmpgExportEEmploy] [bit] NULL ,
		[EmpEmpgExportEUnion] [bit] NULL ,	
		[EmpEmpgAlternatePayRateA] [decimal](8, 2) NULL ,
		[EmpEmpgAlternatePayRateB] [decimal](8, 2) NULL ,
		[EmpEmpgAlternatePayRateC] [decimal](8, 2) NULL ,
		[EmpEmpgAlternatePayRateD] [decimal](8, 2) NULL ,
		[EmpEmpgPTOStartDate] [datetime] NULL ,
		[EmpEmpgPTOAccruedHourEntryAutomatic] [bit] NULL ,
		[EmpEmpgPayRate] [decimal](12, 2) NOT NULL ,
		[EmpEmpgPayRateEnteredBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
		[EmpEmpgPayRateEnteredAt] [datetime] NULL ,
		[EmpEmpgPrevPayRate] [decimal](12, 2) NULL ,
		[EmpEmpgPrevPayRateEnteredBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
		[EmpEmpgPrevPayRateEnteredAt] [datetime] NULL ,
		[EmpEmpgPrevPrevPayRate] [decimal](12, 2) NULL ,
		[EmpEmpgPrevPrevPayRateEnteredBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
		[EmpEmpgPrevPrevPayRateEnteredAt] [datetime] NULL ,	
		[EmpEmpgBirthDate] [datetime] NULL,
		[EmpEmpgReviewDate] [datetime] NULL,
		[EmpEmpgWorkPhone] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
		[EmpEmpgWorkPhoneExt] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
		[EmpEmpgBackGroundCheckDate] [datetime] NULL,
		[EmpEmpgFederalExemptions] [int] NULL,
		[EmpFederalAdjustmentType] [int] NULL,
		[EmpMaritalStatusFederalTaxType] [int] NULL,
		[EmpEmpgFederalAdjustmentAmount] [decimal](15, 2) NULL,
		[EmpEmpgPrimaryState] [int] NULL,
		[EmpEmpgSecondaryState] [int] NULL,
		[EmpMaritalStatusStateTaxTypePrimary] [int] NULL,
		[EmpMaritalStatusStateTaxTypeSecondary] [int] NULL,
		[EmpEmpgStateExemptions] [int] NULL,
		[EmpStateAdjustmentType] [int] NULL,
		[EmpEmpgStateAdjustmentAmount] [decimal](15, 2) NULL,
		[EmpSDIAdjustmentType] [int] NULL,
		[EmpEmpgSDIRate] [decimal](15, 2) NULL,
		[EmpLocalTaxAdjustmentType] [int] NULL,
		[EmpEmpgLocalTaxAdjustmentAmount] [decimal](15, 2) NULL,
		[EmpEmpgLocalTaxCode1] [int] NULL,
		[EmpEmpgLocalTaxCode2] [int] NULL,
		[EmpEmpgLocalTaxCode3] [int] NULL,
		[EmpEmpgPayrollStatus] [varchar](2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
		[EmpEmpgPreviousPayrollStatus] [varchar](2) COLLATE SQL_Latin1_General_CP1_CI_AS NULL,
		[EmpEmpgEffectiveDateJob] [datetime] NULL ,
		[EmpEmpgEffectiveDateCompensation] [datetime] NULL ,
		[EmpEmpgVersion] [int] NOT NULL ,
		[EmpEmpgCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
		[EmpEmpgCrtdAt] [datetime] NOT NULL ,
		[EmpEmpgModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
		[EmpEmpgModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpEmployeeGeneral] PRIMARY KEY CLUSTERED 
	(
		[EmpEmployeeGeneral]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_EmpEmployeeGeneral] ON [dbo].[EmpEmployeeGenerals]([EmpEmployeeGeneral], [PplPerson], [HcmHouseCode]) ON [PRIMARY]
GO


CREATE TABLE [EmpEmployeePTODefaults] (
	[EmpEmployeePTODefault] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpEmployee] [int] NOT NULL ,
	[FscYear] [int] NOT NULL ,
	[PayPayCode] [int] NOT NULL ,
	[EmpEmppdOpeningBalanceHours] [int] NOT NULL ,
	[EmpEmppdModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpEmppdModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpEmployeePTODefault] PRIMARY KEY CLUSTERED 
	(
		[EmpEmployeePTODefault]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpEmployeePTODetails] (
	[EmpEmployeePTODetail] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpEmployee] [int] NOT NULL ,
	[PayPayCode] [int] NOT NULL ,
	[EmpEmppdPTODate] [datetime] NOT NULL ,
	[EmpEmppdHours] [decimal](6, 2) NOT NULL ,
	[EmpEmppdAdjustmentHours] [decimal](6, 2) NULL ,
	[EmpEmppdAdjustmentDate] [datetime] NULL ,
	[EmpEmppdNotes] [varchar] (500) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[EmpEmppdModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[EmpEmppdModAt] [datetime] NULL ,
	CONSTRAINT [PK_EmpEmployeePTODetail] PRIMARY KEY CLUSTERED 
	(
		[EmpEmployeePTODetail]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpEmployees] (
	[EmpEmployee] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[EmpJobCodeType] [int] NULL ,
	[EmpEmpEmployeeNumber] [int] NOT NULL ,
	[EmpEmpEffectiveDate] [datetime] NOT NULL ,
	[EmpEmpHourly] [bit] NOT NULL ,
	[EmpEmpAmount] [decimal](13, 2) NOT NULL ,	
	[EmpEmpSSN] [varchar] (9) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[EmpEmpPayRate] [decimal](13, 2) NULL ,
	[EmpEmpModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpEmpModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpEmployee] PRIMARY KEY CLUSTERED 
	(
		[EmpEmployee]
	)  ON [PRIMARY]
) ON [PRIMARY]
GO


CREATE TABLE [EmpEthnicityTypes] (
	[EmpEthnicityType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpEthtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpEthtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpEthtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpEthtDisplayOrder] [int] NULL ,
	[EmpEthtActive] [bit] NOT NULL ,
	[EmpEthtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpEthtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpEthnicityType] PRIMARY KEY CLUSTERED 
	(
		[EmpEthnicityType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpFederalAdjustmentTypes] (
	[EmpFederalAdjustmentType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpFedatBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpFedatTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpFedatDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpFedatDisplayOrder] [int] NULL ,
	[EmpFedatActive] [bit] NOT NULL ,
	[EmpFedatModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpFedatModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpFederalAdjustmentType] PRIMARY KEY CLUSTERED 
	(
		[EmpFederalAdjustmentType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpGenderTypes] (
	[EmpGenderType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpGentBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpGentTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpGentDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpGentDisplayOrder] [int] NOT NULL ,
	[EmpGentActive] [bit] NOT NULL ,
	[EmpGentModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpGentModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpGenderType] PRIMARY KEY CLUSTERED 
	(
		[EmpGenderType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpI9Types] (
	[EmpI9Type] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpI9tBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpI9tTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpI9tDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpI9tDisplayOrder] [int] NULL ,
	[EmpI9tActive] [bit] NOT NULL ,
	[EmpI9tModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpI9tModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpI9Type] PRIMARY KEY CLUSTERED 
	(
		[EmpI9Type]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpJobCodeTypes] (
	[EmpJobCodeType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpJobctBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobctTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobctDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobctDisplayOrder] [int] NULL ,
	[EmpJobctActive] [bit] NOT NULL ,
	[EmpJobctModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobctModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpJobCodeType] PRIMARY KEY CLUSTERED 
	(
		[EmpJobCodeType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpJobEndReasonTypes] (
	[EmpJobEndReasonType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpJobertBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobertTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobertDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobertDisplayOrder] [int] NULL ,
	[EmpJobertActive] [bit] NOT NULL ,
	[EmpJobertModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobertModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpJobEndReasonType] PRIMARY KEY CLUSTERED 
	(
		[EmpJobEndReasonType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpJobStartReasonTypes] (
	[EmpJobStartReasonType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpJobsrtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobsrtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobsrtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobsrtDisplayOrder] [int] NULL ,
	[EmpJobsrtActive] [bit] NOT NULL ,
	[EmpJobsrtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpJobsrtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpJobStartReasonType] PRIMARY KEY CLUSTERED 
	(
		[EmpJobStartReasonType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpLaundryStatusTypes] (
	[EmpLaundryStatusType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpLaustBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpLaustTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpLaustDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpLaustDisplayOrder] [int] NULL ,
	[EmpLaustActive] [bit] NOT NULL ,
	[EmpLaustModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpLaustModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpLaundryStatusType] PRIMARY KEY CLUSTERED 
	(
		[EmpLaundryStatusType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[EmpLocalTaxAdjustmentStates](
	[EmpLocalTaxAdjustmentState] [int] IDENTITY(1,1) NOT NULL,
	[EmpLocalTaxAdjustmentType] [int] NOT NULL,
	[AppStateType] [int] NOT NULL,
	CONSTRAINT [PK_EmpLocalTaxAdjustmentState] PRIMARY KEY CLUSTERED 
	(
		[EmpLocalTaxAdjustmentState]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE TABLE [dbo].[EmpLocalTaxAdjustmentTypes](
	[EmpLocalTaxAdjustmentType] [int] IDENTITY(1,1) NOT NULL,
	[EmpLoctatBrief] [varchar](16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpLoctatTitle] [varchar](64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpLoctatDescription] [varchar](256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpLoctatDisplayOrder] [int] NULL,
	[EmpLoctatActive] [bit] NOT NULL,
	[EmpLoctatModBy] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpLoctatModAt] [datetime] NOT NULL,
	CONSTRAINT [PK_EmpLocalTaxAdjustmentType] PRIMARY KEY CLUSTERED 
	(
		[EmpLocalTaxAdjustmentType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[EmpLocalTaxCodePayrollCompanyStates](
	[EmpLocalTaxCodePayrollCompanyState] [int] IDENTITY(1,1) NOT NULL,
	[PayPayrollCompany] [int] NOT NULL,
	[AppStateType] [int] NOT NULL,
	[EmpLoctcpcsLocalTaxCode] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpLoctcpcsLocalTaxDescription] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,	
	CONSTRAINT [PK_EmpLocalTaxCodePayrollCompanyState] PRIMARY KEY CLUSTERED 
	(
		[EmpLocalTaxCodePayrollCompanyState]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpMaritalStatusFederalTaxTypes] (
	[EmpMaritalStatusFederalTaxType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpMarsfttBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarsfttTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarsfttDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarsfttDisplayOrder] [int] NULL ,
	[EmpMarsfttActive] [bit] NOT NULL ,
	[EmpMarsfttModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarsfttModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpMaritalStatusFederalTaxType] PRIMARY KEY CLUSTERED 
	(
		[EmpMaritalStatusFederalTaxType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpMaritalStatusStateTaxStates] (
	[EmpMaritalStatusStateTaxState] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpMaritalStatusStateTaxType] [int] NULL ,
	[AppStateType] [bit] NOT NULL ,
	CONSTRAINT [PK_EmpMaritalStatusStateTaxState] PRIMARY KEY CLUSTERED 
	(
		[EmpMaritalStatusStateTaxState]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpMaritalStatusStateTaxTypes] (
	[EmpMaritalStatusStateTaxType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpMarssttBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarssttTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarssttDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarssttDisplayOrder] [int] NULL ,
	[EmpMarssttActive] [bit] NOT NULL ,
	[EmpMarssttModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarssttModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpMaritalStatusStateTaxType] PRIMARY KEY CLUSTERED 
	(
		[EmpMaritalStatusStateTaxType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpMaritalStatusTypes] (
	[EmpMaritalStatusType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpMarstBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarstTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarstDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarstDisplayOrder] [int] NULL ,
	[EmpMarstActive] [bit] NOT NULL ,
	[EmpMarstModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpMarstModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpMaritalStatusType] PRIMARY KEY CLUSTERED 
	(
		[EmpMaritalStatusType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpPositionTypes] (
	[EmpPositionType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpPostBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpPostTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpPostDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpPostDisplayOrder] [int] NULL ,
	[EmpPostActive] [bit] NOT NULL ,
	[EmpPostModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpPostModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpPositionType] PRIMARY KEY CLUSTERED 
	(
		[EmpPositionType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpRateChangeReasonTypes] (
	[EmpRateChangeReasonType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpRatcrtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpRatcrtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpRatcrtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[EmpRatcrtDisplayOrder] [int] NULL ,
	[EmpRatcrtActive] [bit] NULL ,
	[EmpRatcrtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpRatcrtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpRateChangeReasonType] PRIMARY KEY CLUSTERED 
	(
		[EmpRateChangeReasonType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[EmpSDIAdjustmentStates](
	[EmpSDIAdjustmentState] [int] IDENTITY(1,1) NOT NULL,
	[EmpSDIAdjustmentType] [int] NOT NULL,
	[AppStateType] [int] NOT NULL,
	CONSTRAINT [PK_EmpSDIAdjustmentState] PRIMARY KEY CLUSTERED 
	(
		[EmpSDIAdjustmentState]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[EmpSDIAdjustmentTypes](
	[EmpSDIAdjustmentType] [int] IDENTITY(1,1) NOT NULL,
	[EmpSDIatBrief] [varchar](16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSDIatTitle] [varchar](64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSDIatDescription] [varchar](256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSDIatDisplayOrder] [int] NOT NULL,
	[EmpSDIatActive] [bit] NOT NULL,
	[EmpSDIatModBy] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSDIatModAt] [datetime] NOT NULL,
	CONSTRAINT [PK_EmpSDIAdjustmentType] PRIMARY KEY CLUSTERED 
	(
		[EmpSDIAdjustmentType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[EmpSeparationCodes](
	[EmpSeparationCode] [int] IDENTITY(1,1) NOT NULL,
	[EmpSepcBrief] [varchar](16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSepcTitle] [varchar](64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSepcDescription] [varchar](256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSepcDisplayOrder] [int] NOT NULL,
	[EmpSepcActive] [bit] NOT NULL,
	[EmpSepcModBy] [varchar](50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,
	[EmpSepcModAt] [datetime] NOT NULL,
	CONSTRAINT [PK_EmpSeparationCode] PRIMARY KEY CLUSTERED 
	(
		[EmpSeparationCode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [dbo].[EmpStateAdjustmentStates](
	[EmpStateAdjustmentState] [int] IDENTITY(1,1) NOT NULL,
	[EmpStateAdjustmentType] [int] NOT NULL,
	[AppStateType] [int] NOT NULL,
	CONSTRAINT [PK_EmpStateAdjustmentState] PRIMARY KEY CLUSTERED 
	(
		[EmpStateAdjustmentState]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpStateAdjustmentTypes] (
	[EmpStateAdjustmentType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpStaatBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStaatTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStaatDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStaatDisplayOrder] [int] NULL ,
	[EmpStaatActive] [bit] NOT NULL ,
	[EmpStaatModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStaatModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpStateAdjustmentType] PRIMARY KEY CLUSTERED 
	(
		[EmpStateAdjustmentType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpStatusCategoryTypes] (
	[EmpStatusCategoryType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpStatusType] [int] NOT NULL ,
	[EmpStactBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStactTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStactDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStactDisplayOrder] [int] NULL ,
	[EmpStactActive] [bit] NOT NULL ,
	[EmpStactModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStactModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpStatusCategoryType] PRIMARY KEY CLUSTERED 
	(
		[EmpStatusCategoryType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpStatusTypes] (
	[EmpStatusType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpStatBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStatTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStatDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStatDisplayOrder] [int] NOT NULL ,
	[EmpStatActive] [bit] NOT NULL ,
	[EmpStatModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpStatModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpStatusType] PRIMARY KEY CLUSTERED 
	(
		[EmpStatusType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpTerminationReasonTypes] (
	[EmpTerminationReasonType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpTerrtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpTerrtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpTerrtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpTerrtDisplayOrder] [int] NULL ,
	[EmpTerrtActive] [bit] NOT NULL ,
	[EmpTerrtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpTerrtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpTerminationReasonType] PRIMARY KEY CLUSTERED 
	(
		[EmpTerminationReasonType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpUnionTypes] (
	[EmpUnionType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpUnitBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpUnitTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpUnitDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpUnitDisplayOrder] [int] NULL ,
	[EmpUnitActive] [bit] NOT NULL ,
	[EmpUnitModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpUnitModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpUnionType] PRIMARY KEY CLUSTERED 
	(
		[EmpUnionType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpVetTypes] (
	[EmpVetType] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpVettBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpVettTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpVettDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpVettDisplayOrder] [int] NULL ,
	[EmpVettActive] [bit] NOT NULL ,
	[EmpVettModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpVettModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpVetType] PRIMARY KEY CLUSTERED 
	(
		[EmpVetType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [EmpWorkShifts] (
	[EmpWorkShift] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpWorsBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpWorsTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpWorsDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpWorsDisplayOrder] [int] NOT NULL ,
	[EmpWorsActive] [bit] NOT NULL ,
	[EmpWorsStartTime] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpWorsEndTime] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpWorsModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[EmpWorsModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_EmpWorkShift] PRIMARY KEY CLUSTERED 
	(
		[EmpWorkShift]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [FscAccountCategories] (
	[FscAccountCategory] [int] IDENTITY (1, 1) NOT NULL ,
	[FscAcccTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscAcccDisplayOrder] [int] NULL ,
	[FscAcccActive] [bit] NOT NULL ,
	[FscAcccModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscAcccModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_FscAccountCategory] PRIMARY KEY CLUSTERED 
	(
		[FscAccountCategory]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [FscAccounts] (
	[FscAccount] [int] IDENTITY (1, 1) NOT NULL ,
	[FscAccountCategory] [int] NOT NULL ,
	[FscAccCode] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscAccDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscAccGLHeader] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[FscAccPostingEditCode] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[FscAccNegativeValue] [bit] NOT NULL ,
	[FscAccBlockImportExport] [bit] NOT NULL ,
	[FscAccBudget] [bit] NOT NULL ,
	[FscAccAccountsPayable] [bit] NOT NULL ,
	[FscAccSalariesWages] [bit] NOT NULL ,
	[FscAccRecurringExpenses] [bit] NOT NULL ,
	[FscAccFieldTransfers] [bit] NOT NULL ,
	[FscAccInventory] [bit] NOT NULL ,
	[FscAccPayrollWorksheet] [bit] NOT NULL ,
	[FscAccManagementFee] [bit] NOT NULL ,
	[FscAccDirectCost] [bit] NOT NULL ,
	[FscAccSupplies] [bit] NOT NULL ,
	[FscAccAccountReceivables] [bit] NOT NULL ,
	[FscAccWOR] [bit] NOT NULL ,
	[FscAccOtherRevenue] [bit] NOT NULL ,
	[FscAccDisplayOrder] [int] NULL ,
	[FscAccActive] [bit] NOT NULL ,
	[FscAccModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscAccModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_FscAccount] PRIMARY KEY CLUSTERED 
	(
		[FscAccount]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [FscJDECompanies] (
	[FscJDECompany] [int] IDENTITY (1, 1) NOT NULL ,
	[FscPattern] [int] NOT NULL ,
	[FscJDEcBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscJDEcTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[FscJDEcDisplayOrder] [int] NOT NULL ,
	[FscJDEcActive] [bit] NOT NULL ,
	[FscJDEcModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[FscJDEcModAt] [datetime] NULL ,
	CONSTRAINT [PK_FscJDECompany] PRIMARY KEY CLUSTERED 
	(
		[FscJDECompany]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [FscPatterns] (
	[FscPattern] [int] IDENTITY (1, 1) NOT NULL ,
	[FscPatTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscPatDisplayOrder] [int] NULL ,
	[FscPatActive] [bit] NOT NULL ,
	[FscPatModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscPatModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_FscPattern] PRIMARY KEY CLUSTERED 
	(
		[FscPattern]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [FscPeriods] (
	[FscPeriod] [int] IDENTITY (1, 1) NOT NULL ,
	[FscYear] [int] NOT NULL ,
	[FscPerTitle] [int] NULL ,
	[FscPerStartDate] [datetime] NOT NULL ,
	[FscPerEndDate] [datetime] NOT NULL ,
	[FscPerDisplayOrder] [int] NOT NULL ,
	[FscPerActive] [bit] NOT NULL ,
	[FscPerModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscPerModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_FscPeriod] PRIMARY KEY CLUSTERED 
	(
		[FscPeriod]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [FscYears] (
	[FscYear] [int] IDENTITY (1, 1) NOT NULL ,
	[FscPattern] [int] NOT NULL ,
	[FscYeaTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscYeaDisplayOrder] [int] NOT NULL ,
	[FscYeaActive] [bit] NOT NULL ,
	[FscYeaModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[FscYeaModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_FscYear] PRIMARY KEY CLUSTERED 
	(
		[FscYear]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [GlmJournalEntries] (
	[GlmJournalEntry] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[FscYear] [int] NOT NULL ,
	[FscPeriod] [int] NOT NULL ,
	[GlmJoueWeek] [int] NOT NULL ,
	[GlmJoueJournalDate] [datetime] NOT NULL ,
	[HcmHouseCodeCredit] [int] NOT NULL ,
	[HcmHouseCodeJobCredit] [int] NULL ,
	[GlmJoueHouseCodeEmailCredit] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJoueHouseCodePhoneCredit] [varchar] (15) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHouseCodeDebit] [int] NOT NULL ,
	[HcmHouseCodeJobDebit] [int] NULL ,
	[GlmJoueHouseCodeEmailDebit] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJoueHouseCodePhoneDebit] [varchar] (15) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[GlmJoueActive] [bit] NOT NULL ,	
	[GlmJoueModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJoueModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_GlmJournalEntry] PRIMARY KEY CLUSTERED 
	(
		[GlmJournalEntry]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_GlmJournalEntry] ON [dbo].[GlmJournalEntries]([HcmHousecode], [FscYear], [FscPeriod]) ON [PRIMARY]
GO


CREATE TABLE [GlmJournalEntryItems] (
	[GlmJournalEntryItem] [int] IDENTITY (1, 1) NOT NULL ,
	[GlmJournalEntry] [int] NULL ,
	[FscAccount] [int] NULL ,
	[AppTransactionStatusType] [int] NULL ,
	[GlmJournalTransferType] [int] NULL ,
	[GlmJoueiAmount] [decimal](12, 2) NULL ,	
	[GlmJoueiAssociatedRecurringFixedCost] [bit] NULL ,
	[GlmJoueiExpenseDate] [datetime] NULL ,
	[GlmJoueiActive] [bit] NOT NULL ,
	[GlmJoueiJDEId] [int] NULL CONSTRAINT [DF_GlmJournalEntryItems_GlmJoueiJDEId] DEFAULT ((0)),
	[GlmJoueiCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJoueiCrtdAt] [datetime] NOT NULL ,	
	[GlmJoueiModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJoueiModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_GlmJournalEntryItem] PRIMARY KEY CLUSTERED 
	(
		[GlmJournalEntryItem]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [GlmJournalTransferTypes] (
	[GlmJournalTransferType] [int] IDENTITY (1, 1) NOT NULL ,
	[GlmJouttBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJouttTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJouttActive] [bit] NOT NULL ,
	[GlmJouttModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmJouttModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_GlmJournalTransferType] PRIMARY KEY CLUSTERED 
	(
		[GlmJournalTransferType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [GlmRecurringExpenses] (
	[GlmRecurringExpense] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[GlmRecurringFixedCostIntervalType] [int] NULL ,
	[GlmRecurringFixedCostType] [int] NULL ,	
	[FscAccountTo] [int] NOT NULL ,
	[FscAccountFrom] [int] NULL ,
	[HcmHouseCodeJobTo] [int] NULL ,
	[HcmHouseCodeJobFrom] [int] NULL ,
	[GlmreFixedAmount] [decimal](18, 2) NULL ,
	[GlmrePercent] [decimal](18, 2) NULL ,	
	[GlmreRule] [int] NULL ,
	[GlmreReadOnly] [bit] NULL ,
	[GlmreActive] [bit] NULL ,
	[GlmreVersion] [int] NULL ,
	[GlmreCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmreCrtdAt] [datetime] NULL ,
	[GlmreModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmreModAt] [datetime] NULL ,
	[OldId] [int] NULL ,
	CONSTRAINT [PK_GlmRecurringExpense] PRIMARY KEY CLUSTERED 
	(
		[GlmRecurringExpense]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [GlmRecurringFixedCostIntervalTypes] (
	[GlmRecurringFixedCostIntervalType] [int] IDENTITY (1, 1) NOT NULL ,
	[GlmRecfcitBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmRecfcitTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmRecfcitDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmRecfcitDisplayOrder] [int] NULL ,
	[GlmRecfcitActive] [bit] NOT NULL ,
	[GlmRecfcitModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[GlmRecfcitModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_GlmRecurringFixedCostIntervalType] PRIMARY KEY CLUSTERED 
	(
		[GlmRecurringFixedCostIntervalType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [GlmRecurringFixedCosts] (
	[GlmRecurringFixedCost] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscAccount] [int] NULL ,
	[FscYear] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_FscYear] DEFAULT ((0)),
	[FscPeriod] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_FscPeriod] DEFAULT ((0)),
	[AppTransactionStatusType] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_AppTransactionStatusType] DEFAULT ((1)),
	[RevTableType] [int] NULL ,	
	[GlmRecfcWeek] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcWeek] DEFAULT ((0)),
	[GlmRecfcAmount] [decimal](18, 2) NULL ,	
	[GlmRecfcExpenseDate] [datetime] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcExpenseDate] DEFAULT (getdate()),
	[GlmRecfcSourceType] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfcSourceId] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcSourceId] DEFAULT ((0)),
	[GlmRecfcSetupId] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcSetupId] DEFAULT ((0)),
	[GlmRecfcModified] [bit] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcModified] DEFAULT ((0)),
	[GlmRecfcAssociatedRecurringFixedCost] [bit] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcAssociatedRecurringFixedCost] DEFAULT ((0)),
	[GlmRecfcJDEId] [int] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcJDEId] DEFAULT ((0)),
	[GlmRecfcActive] [bit] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcActive] DEFAULT ((1)),
	[GlmRecfcCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfcCrtdAt] [datetime] NULL CONSTRAINT [DF_GlmRecurringFixedCosts_GlmRecfcCrtdAt] DEFAULT (getdate()),
	[GlmRecfcModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfcModAt] [datetime] NULL ,	
	CONSTRAINT [PK_GlmRecurringFixedCost] PRIMARY KEY CLUSTERED 
	(
		[GlmRecurringFixedCost]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_GlmRecurringFixedCost] ON [dbo].[GlmRecurringFixedCosts]([HcmHouseCode], [FscYear], [FscPeriod]) ON [PRIMARY]
GO


CREATE TABLE [GlmRecurringFixedCostTypes] (
	[GlmRecurringFixedCostType] [int] IDENTITY (1, 1) NOT NULL ,
	[GlmRecfctBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfctTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfctDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfctDisplayOrder] [int] NULL ,
	[GlmRecfctActive] [bit] NULL ,
	[GlmRecfctModBy] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmRecfctModAt] [datetime] NULL ,
	CONSTRAINT [PK_GlmRecurringFixedCostType] PRIMARY KEY CLUSTERED 
	(
		[GlmRecurringFixedCostType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [GlmSalaryWages] (
	[GlmSalaryWage] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[HcmHouseCodeJob] [int] NULL ,
	[FscAccount] [int] NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[AppTransactionStatusType] [int] NULL ,
	[RevTableType] [int] NULL ,
	[GlmSalwWeek] [int] NULL ,
	[GlmSalwAmount] [decimal](18, 2) NULL ,	
	[GlmSalwExpenseDate] [datetime] NULL ,
	[GlmSalwAssociatedRecurringFixedCost] [bit] NULL ,
	[GlmSalwJDEId] [int] NULL ,
	[GlmSalwActive] [bit] NULL ,
	[GlmSalwCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmSalwCrtdAt] [datetime] NULL ,
	[GlmSalwModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GlmSalwModAt] [datetime] NULL ,
	[OldId] [int] NULL ,
	CONSTRAINT [PK_GlmSalaryWage] PRIMARY KEY CLUSTERED 
	(
		[GlmSalaryWage]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_GlmSalaryWage] ON [dbo].[GlmSalaryWages]([HcmHouseCode], [FscYear], [FscPeriod]) ON [PRIMARY]
GO


CREATE TABLE [GLTRAN] (
	[DocumentType] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[DocumentNo] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[LineNumber] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[TeamFinId] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[TableType] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HouseCode] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AccountCode] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[GLDate] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[POST] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[Amount] [varchar] (20) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[Vendor] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[Description] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[InvoiceNo] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[InvoiceDate] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurchaseOrderNumber] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[VendorNumber] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[Period] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[Year] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[Century] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[DocumentCompany] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL 
) ON [PRIMARY]
GO


CREATE TABLE [HcmBillingCycleFrequencyTypes] (
	[HcmBillingCycleFrequencyType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmBilcftBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmBilcftTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmBilcftDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmBilcftDisplayOrder] [int] NULL ,
	[HcmBilcftActive] [bit] NOT NULL ,
	[HcmBilcftModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmBilcftModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmBillingCycleFrequencyType] PRIMARY KEY CLUSTERED 
	(
		[HcmBillingCycleFrequencyType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmContractTypes] (
	[HcmContractType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmContBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmContTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmContDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmContDisplayOrder] [int] NULL ,
	[HcmContActive] [bit] NOT NULL ,
	[HcmContModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmContModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmContractType] PRIMARY KEY CLUSTERED 
	(
		[HcmContractType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE TABLE [HcmHouseCodeJobs] (
	[HcmHouseCodeJob] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[HcmJob] [int] NOT NULL ,
	[HcmHoucjActive] [bit] NOT NULL ,
	[HcmHoucjModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHoucjModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmHouseCodeJob] PRIMARY KEY CLUSTERED 
	(
		[HcmHouseCodeJob]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmHouseCodePayrollCompanies] (
	[HcmHouseCodePayrollCompany] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[PayPayrollCompany] [int] NOT NULL ,
	[HcmHoucpcSalary] [bit] NOT NULL ,
	[HcmHoucpcHourly] [bit] NOT NULL ,
	[HcmHoucpcModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[HcmHoucpcModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_HcmHouseCodePayrollCompany] PRIMARY KEY CLUSTERED 
	(
		[HcmHouseCodePayrollCompany]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmHouseCodes] (
	[HcmHouseCode] [int] IDENTITY (1, 1) NOT NULL ,
	[AppUnit] [int] NOT NULL ,
	[FscJDECompany] [int] NULL ,
	[HcmHoucStartDate] [datetime] NULL ,
	[HcmServiceType] [int] NULL ,
	[HcmRemitToLocation] [int] NULL ,
	[HcmContractType] [int] NULL ,
	[HcmTermsOfContractType] [int] NULL ,
	[HcmBillingCycleFrequencyType] [int] NULL ,
	[HcmPayrollProcessingLocationType] [int] NULL ,
	[HcmHouseCodeType] [int] NULL ,
	[HcmLaborTrackingType] [int] NULL ,
	[HcmHoucEnforceLaborControl] [bit] NULL ,
	[HcmHoucManagerName] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagerPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagerCellPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagerFax] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagerPager] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagerAssistantName] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagerAssistantPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientFirstName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientLastName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientFax] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientAssistantName] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucClientAssistantPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucManagedEmployees] [int] NULL ,
	[HcmHoucBedsLicensed] [int] NULL ,
	[HcmHoucPatientDays] [int] NULL ,
	[HcmHoucAverageDailyCensus] [int] NULL ,
	[HcmHoucAnnualDischarges] [int] NULL ,
	[HcmHoucAverageBedTurnaroundTime] [int] NULL ,
	[HcmHoucNetCleanableSqft] [int] NULL ,
	[HcmHoucAverageLaundryLbs] [int] NULL ,
	[HcmHoucCrothallEmployees] [int] NULL ,
	[HcmHoucBedsActive] [int] NULL ,
	[HcmHoucAdjustedPatientDaysBudgeted] [int] NULL ,
	[HcmHoucAnnualTransfers] [int] NULL ,
	[HcmHoucAnnualTransports] [int] NULL ,
	[HcmHoucShippingAddress1] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucShippingAddress2] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucShippingCity] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucShippingState] [int] NULL ,
	[HcmHoucShippingZip] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[HcmHoucBankCodeNumber] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankAccountNumber] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankName] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankContact] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankAddress1] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankAddress2] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankCity] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankState] [int] NULL ,
	[HcmHoucBankZip] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankFax] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucBankEmail] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucStateTaxPercent] [decimal](10, 2) NULL ,
	[HcmHoucLocalTaxPercent] [decimal](10, 2) NULL ,	
	[HcmHoucDefaultLunchBreak] [decimal](10, 2) NULL ,
	[HcmHoucLunchBreakTrigger] [decimal](10, 2) NULL ,	
	[HcmHoucRoundingTimePeriod] [int] NULL ,
	[HcmHoucTimeAndAttendance] [bit] NULL ,
	[HcmHoucModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmHoucModAt] [datetime] NULL ,
	CONSTRAINT [PK_HcmHouseCode] PRIMARY KEY CLUSTERED 
	(
		[HcmHouseCode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmHouseCodeServices] (
	[HcmHouseCodeService] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[HcmServiceType] [int] NOT NULL ,
	[HcmHoucsModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHoucsModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmHouseCodeService] PRIMARY KEY CLUSTERED 
	(
		[HcmHouseCodeService]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmHouseCodeTypes] (
	[HcmHouseCodeType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouctBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHouctTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHouctDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHouctDisplayOrder] [int] NULL ,
	[HcmHouctActive] [bit] NOT NULL ,
	[HcmHouctModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmHouctModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmHouseCodeType] PRIMARY KEY CLUSTERED 
	(
		[HcmHouseCodeType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmJobs] (
	[HcmJob] [int] IDENTITY (1, 1) NOT NULL ,
	[FscJDEJobCode] [int] NULL ,
	[HcmJobBrief] [varchar] (8) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobTitle] [varchar] (40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobAddress] [varchar] (41) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmJobCity] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppStateType] [int] NULL ,
	[HcmJobPostalCode] [varchar] (12) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmJobPhysicalLocation] [bit] NOT NULL ,	
	[HcmJobDisplayOrder] [int] NULL ,
	[HcmJobActive] [bit] NOT NULL ,
	[HcmJobModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmJob] PRIMARY KEY CLUSTERED 
	(
		[HcmJob]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmJobTemplates] (
	[HcmJobTemplate] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmJobtBrief] [varchar] (8) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobtTitle] [varchar] (40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobtDescription] [varchar] (40) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobtAddress] [varchar] (41) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmJobtCity] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppStateType] [int] NULL ,
	[HcmJobtPostalCode] [varchar] (12) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmJobtPhysicalLocation] [bit] NOT NULL ,	
	[HcmJobtDisplayOrder] [int] NULL ,
	[HcmJobtActive] [bit] NOT NULL ,
	[HcmJobtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmJobtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmJobTemplate] PRIMARY KEY CLUSTERED 
	(
		[HcmJobTemplate]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmPayrollProcessingLocationTypes] (
	[HcmPayrollProcessingLocationType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmPaypltBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmPaypltTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmPaypltDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmPaypltDisplayOrder] [int] NULL ,
	[HcmPaypltActive] [bit] NOT NULL ,
	[HcmPaypltModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmPaypltModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmPayrollProcessingLocationType] PRIMARY KEY CLUSTERED 
	(
		[HcmPayrollProcessingLocationType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmRemitToLocations] (
	[HcmRemitToLocation] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmRemtlTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmRemtlAddress1] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmRemtlAddress2] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmRemtlCity] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppStateType] [int] NULL ,
	[HcmRemtlZip] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[HcmRemtlDisplayOrder] [int] NULL ,
	[HcmRemtlActive] [bit] NOT NULL ,
	[HcmRemtlModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmRemtlModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmRemitToLocation] PRIMARY KEY CLUSTERED 
	(
		[HcmRemitToLocation]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmServiceTypes] (
	[HcmServiceType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmSertBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmSertTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmSertDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmSertDisplayOrder] [int] NULL ,
	[HcmSertActive] [bit] NOT NULL ,
	[HcmSertModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmSertModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmServiceType] PRIMARY KEY CLUSTERED 
	(
		[HcmServiceType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [HcmTermsOfContractTypes] (
	[HcmTermsOfContractType] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmTeroctBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmTeroctTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmTeroctDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmTeroctDisplayOrder] [int] NULL ,
	[HcmTeroctActive] [bit] NOT NULL ,
	[HcmTeroctModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[HcmTeroctModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_HcmTermsOfContractType] PRIMARY KEY CLUSTERED 
	(
		[HcmTermsOfContractType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayEmployeeDailyPayrolls] (
	[PayEmployeeDailyPayroll] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpEmployee] [int] NOT NULL ,
	[EmpWorkShift] [int] NULL ,
	[PayEmpdpDate] [datetime] NULL ,	
	[PayEmpdpGrossHours] [decimal](10, 2) NULL ,
	[PayEmpdpNetHours] [decimal](10, 2) NULL ,
	[PayEmpdpLunch] [bit] NOT NULL CONSTRAINT [DF_PayEmployeeDailyPayrolls_PayEmpdpLunch] DEFAULT ((1)),
	[PayEmpdpBreak] [bit] NOT NULL ,
	[PayEmpdpPostedBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PayEmpdpPostedAt] [datetime] NULL ,
	[PayEmpdpUnapprovedBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PayEmpdpUnapprovedAt] [datetime] NULL ,
	[PayEmpdpModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpdpModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PayEmployeeDailyPayroll] PRIMARY KEY CLUSTERED 
	(
		[PayEmployeeDailyPayroll]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayEmployeePunches] (
	[PayEmployeePunch] [int] IDENTITY (1, 1) NOT NULL ,
	[EmpEmployee] [int] NOT NULL ,
	[PayEmployeePunchType] [int] NULL ,
	[EmpDeviceGroupType] [int] NULL ,
	[PayEmppDeviceName] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PayEmppPunchTime] [datetime] NULL ,
	[PayEmppOverrideTime] [datetime] NULL ,
	[PayEmppApprovedTime] [datetime] NULL ,	
	[PayEmppModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PayEmppModAt] [datetime] NULL ,
	CONSTRAINT [PK_PayEmployeePunch] PRIMARY KEY CLUSTERED 
	(
		[PayEmployeePunch]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayEmployeePunchPaycodeAllocations] (
	[PayEmployeePunchPaycodeAllocation] [int] IDENTITY (1, 1) NOT NULL ,
	[PayEmployeeDailyPayroll] [int] NOT NULL ,
	[PayPayCode] [int] NOT NULL ,
	[PayEmpppaHours] [decimal](10, 2) NULL ,
	[PayEmpppaModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpppaModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PayEmployeePunchPaycodeAllocation] PRIMARY KEY CLUSTERED 
	(
		[PayEmployeePunchPaycodeAllocation]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayEmployeePunchTypes] (
	[PayEmployeePunchType] [int] IDENTITY (1, 1) NOT NULL ,
	[PayEmpptBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpptTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpptDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpptDisplayOrder] [int] NULL ,
	[PayEmpptActive] [bit] NOT NULL ,
	[PayEmpptModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpptModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PayEmployeePunchType] PRIMARY KEY CLUSTERED 
	(
		[PayEmployeePunchType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayEmployeeWeeklyPayrolls] (
	[PayEmployeeWeeklyPayroll] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[HcmHouseCodeJob] [int] NULL ,
	[PayrollHcmHouseCode] [int] NULL ,
	[EmpEmployee] [int] NOT NULL ,
	[PayPayCode] [int] NOT NULL ,
	[EmpWorkshift] [int] NOT NULL ,
	[EmpJobCodeType] [int] NOT NULL ,
	[AppTransactionStatusType] [int] NOT NULL ,
	[FscYear] [int] NOT NULL ,
	[FscPeriod] [int] NOT NULL ,
	[PayEmpwpWeek] [int] NOT NULL ,
	[PayEmpwpHours] [float] NOT NULL ,
	[PayEmpwpFixedAmount] [money] NOT NULL ,
	[PayEmpwpCurrentPayRate] [money] NOT NULL ,
	[PayEmpwpHourly] [bit] NOT NULL ,
	[PayEmpwpExempt] [bit] NOT NULL ,
	[PayEmpwpAlternatePayRate] [money] NOT NULL ,
	[PayEmpwpApprovedByDailyPayroll] [bit] NOT NULL ,	
	[PayEmpwpExpenseDate] [datetime] NOT NULL ,
	[PayEmpwpActive] [bit] NOT NULL ,
	[PayEmpwpVersion] [int] NULL ,
	[PayEmpwpModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayEmpwpModAt] [datetime] NOT NULL ,	
	[OldId] [int] NULL ,
	CONSTRAINT [PK_PayEmployeeWeeklyPayroll] PRIMARY KEY CLUSTERED 
	(
		[PayEmployeeWeeklyPayroll]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayPayCodeAccounts] (
	[PayPayCodeAccount] [int] IDENTITY (1, 1) NOT NULL ,
	[PayPayCode] [int] NULL ,
	[FscAccount] [int] NULL ,
	[EmpJobCodeType] [int] NULL ,
	CONSTRAINT [PK_PayPayCodeAccount] PRIMARY KEY CLUSTERED 
	(
		[PayPayCodeAccount]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayPayCodes] (
	[PayPayCode] [int] IDENTITY (1, 1) NOT NULL ,
	[PayPaycBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPaycTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PayPaycAmount] [money] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycAmount] DEFAULT ((0)),
	[PayPaycMultiplyFactor] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycMultiplyFactor] DEFAULT ((0)),
	[PayPaycAddToPayRate] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycAddToPayRate] DEFAULT ((0)),
	[PayPaycAddToTotal] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycAddToTotal] DEFAULT ((0)),
	[PayPaycAlternatePayRate] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycAlternatePayRate] DEFAULT ((0)),
	[PayPaycOneTimeCharge] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycOneTimeCharge] DEFAULT ((0)),
	[PayPaycTimeAndHalf] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycTimeAndHalf] DEFAULT ((0)),
	[PayPaycRegularPay] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycRegularPay] DEFAULT ((0)),
	[PayPaycOverTimePay] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycOverTimePay] DEFAULT ((0)),
	[PayPaycProductive] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycProductive] DEFAULT ((0)),
	[PayPaycDailyPayroll] [bit] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycDailyPayroll] DEFAULT ((0)),
	[PayPaycDisplayOrder] [int] NOT NULL CONSTRAINT [DF_PayPayCodes_PayPaycDisplayOrder] DEFAULT ((0)),
	[PayPaycActive] [bit] NULL CONSTRAINT [DF_PayPayCodes_PayPaycActive] DEFAULT ((1)),
	[PayPaycModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPaycModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PayPayCode] PRIMARY KEY CLUSTERED 
	(
		[PayPayCode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayPayCodesByHousecodes] (
	[PayPayCodesByHousecode] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[EmpEmployee] [int] NOT NULL ,
	[PayPayCode] [int] NOT NULL ,	
	[PayPaycbhFixedAmount] [money] NOT NULL ,
	[PayPaycbhActive] [bit] NOT NULL ,
	[PayPaycbhModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPaycbhModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_PayPayCodesByHousecode] PRIMARY KEY CLUSTERED 
	(
		[PayPayCodesByHousecode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayPayFrequencyTypes] (
	[PayPayFrequencyType] [int] IDENTITY (1, 1) NOT NULL ,
	[PayPayftBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPayftTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPayftDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPayftDisplayOrder] [int] NULL ,
	[PayPayftActive] [bit] NOT NULL ,
	[PayPayftModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPayftModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PayPayFrequencyType] PRIMARY KEY CLUSTERED 
	(
		[PayPayFrequencyType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayPayrollCompanies] (
	[PayPayrollCompany] [int] IDENTITY (1, 1) NOT NULL ,
	[PayPayFrequencyType] [int] NULL ,
	[PayServiceLine] [int] NULL ,
	[PayPaycBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPaycTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPaycDisplayOrder] [int] NULL ,
	[PayPaycActive] [bit] NOT NULL ,
	[PayPaycModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPaycModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_PayPayrollCompany] PRIMARY KEY CLUSTERED 
	(
		[PayPayrollCompany]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayPeriods] (
	[PayPeriod] [int] IDENTITY (1, 1) NOT NULL ,
	[PayPayFrequencyType] [int] NOT NULL ,
	[FscYear] [int] NOT NULL ,	
	[PayPerTitle] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PayPerStartDate] [datetime] NOT NULL ,
	[PayPerEndDate] [datetime] NOT NULL ,
	[PayPerDisplayOrder] [int] NULL ,
	[PayPerActive] [bit] NOT NULL ,
	[PayPerModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PayPerModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PayPeriod] PRIMARY KEY CLUSTERED 
	(
		[PayPeriod]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PayServiceLines] (
	[PayServiceLine] [int] IDENTITY (1, 1) NOT NULL ,
	[PaySerlBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PaySerlTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PaySerlDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PaySerlDisplayOrder] [int] NULL ,
	[PaySerlActive] [bit] NOT NULL ,
	[PaySerlModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PaySerlModAt] [datetime] NOT NULL ,	
	CONSTRAINT [PK_PayServiceLine] PRIMARY KEY CLUSTERED 
	(
		[PayServiceLine]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PurCatalogHouseCodes] (
	[PurCatalogHouseCode] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[PurCatalog] [int] NOT NULL ,
	[PurCathcModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurCathcModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurCatalogHouseCode] PRIMARY KEY CLUSTERED 
	(
		[PurCatalogHouseCode]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PurCatalogItems] (
	[PurCatalogItem] [int] IDENTITY (1, 1) NOT NULL ,
	[PurCatalog] [int] NOT NULL ,
	[PurItem] [int] NOT NULL ,
	[PurCatiPrice] [decimal](18, 2) NULL ,
	[PurCatiDisplayOrder] [int] NULL ,
	[PurCatiActive] [bit] NOT NULL ,
	[PurCatiModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurCatiModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurCatalogItem] PRIMARY KEY CLUSTERED 
	(
		[PurCatalogItem]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PurCatalogs] (
	[PurCatalog] [int] IDENTITY (1, 1) NOT NULL ,
	[PurVendor] [int] NOT NULL ,
	[PurCatTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[PurCatDisplayOrder] [int] NULL ,
	[PurCatActive] [bit] NOT NULL ,
	[PurCatModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurCatModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurCatalog] PRIMARY KEY CLUSTERED 
	(
		[PurCatalog]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PurItems] (
	[PurItem] [int] IDENTITY (1, 1) NOT NULL ,
	[FscAccount] [int] NOT NULL ,
	[PurIteMasterId] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteNumber] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteNumber2] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteComClass] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteComSubClass] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteSupplierClass] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteUom] [varchar] (255) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[PurItePrice] [decimal](18, 2) NOT NULL ,
	[PurIteDisplayOrder] [int] NULL ,
	[PurIteActive] [bit] NOT NULL ,
	[PurIteModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurIteModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurItem] PRIMARY KEY CLUSTERED 
	(
		[PurItem]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PurPOSendMethodTypes] (
	[PurPOSendMethodType] [int] IDENTITY (1, 1) NOT NULL ,
	[PurPOsmtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurPOsmtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurPOsmtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurPOsmtDisplayOrder] [int] NULL ,
	[PurPOsmtActive] [bit] NOT NULL ,
	[PurPOsmtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurPOsmtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurPOSendMethodType] PRIMARY KEY CLUSTERED 
	(
		[PurPOSendMethodType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [PurPurchaseOrderDetails] (
	[PurPurchaseOrderDetail] [int] IDENTITY (1, 1) NOT NULL ,
	[PurPurchaseOrder] [int] NOT NULL ,
	[PurCatalogItem] [int] NOT NULL ,
	[HcmHouseCodeJob] [int] NULL ,
	[PurPurodPrice] [decimal](18, 2) NULL ,
	[PurPurodQuantity] [int] NOT NULL ,
	[PurPurodQuantityReceived] [int] NULL CONSTRAINT [DF_PurPurchaseOrderDetails_PurPurodQuantityReceived] DEFAULT ((0)),
	[PurPurodModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPurodModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurPurchaseOrderDetail] PRIMARY KEY CLUSTERED 
	(
		[PurPurchaseOrderDetail]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_PurPurchaseOrderDetail] ON [dbo].[PurPurchaseOrderDetails]([PurPurchaseOrderDetail], [PurPurchaseOrder]) ON [PRIMARY]
GO


CREATE TABLE [PurPurchaseOrders] (
	[PurPurchaseOrder] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NOT NULL ,
	[HcmHouseCodeJob] [int] NULL ,
	[PurVendor] [int] NOT NULL ,	
	[FscYear] [int] NULL CONSTRAINT [DF_PurPurchaseOrders_FscYear] DEFAULT ((0)),
	[FscPeriod] [int] NULL CONSTRAINT [DF_PurPurchaseOrders_FscPeriod] DEFAULT ((0)),
	[AppTransactionStatusType] [int] NOT NULL CONSTRAINT [DF_PurPurchaseOrders_AppTransactionStatusType] DEFAULT ((1)),
	[PurPuroWeek] [int] NULL ,
	[PurPuroOrderNumber] [int] NOT NULL ,	
	[PurPuroOrderDate] [datetime] NOT NULL ,
	[PurPuroReceivedDate] [datetime] NULL ,
	[PurPuroShipToContact] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroShipToAddress1] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroShipToAddress2] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroShipToCity] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppStateType] [int] NULL CONSTRAINT [DF_PurPurchaseOrders_AppStateType] DEFAULT ((0)),
	[PurPuroShipToZip] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroShipToPhone] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroShipToFax] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroTemplate] [bit] NULL CONSTRAINT [DF_PurPurchaseOrders_PurPuroTemplate] DEFAULT ((0)),
	[PurPuroTemplateTitle] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroCrtdAt] [datetime] NULL ,
	[PurPuroModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurPuroModAt] [datetime] NULL ,	
	CONSTRAINT [PK_PurPurchaseOrder] PRIMARY KEY CLUSTERED 
	(
		[PurPurchaseOrder]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_PurPurchaseOrder] ON [dbo].[PurPurchaseOrders]([PurPurchaseOrder], [HcmHouseCode]) ON [PRIMARY]
GO


CREATE TABLE [PurVendors] (
	[PurVendor] [int] IDENTITY (1, 1) NOT NULL ,
	[PurPOSendMethodType] [int] NOT NULL ,
	[PurVenNumber] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurVenTitle] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurVenAddressLine1] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurVenAddressLine2] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurVenCity] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[AppStateType] [int] NOT NULL ,
	[PurVenZip] [varchar] (15) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[PurVenContactName] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurVenEmail] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurVenAutoEmail] [bit] NOT NULL ,
	[PurVenFaxNumber] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurVenPhoneNumber] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[PurVenDisplayOrder] [int] NULL ,
	[PurVenActive] [bit] NOT NULL ,
	[PurVenModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[PurVenModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_PurVendor] PRIMARY KEY CLUSTERED 
	(
		[PurVendor]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [RevAccountPayables] (
	[RevAccountPayable] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscAccount] [int] NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[AppTransactionStatusType] [smallint] NOT NULL ,
	[RevTableType] [int] NOT NULL ,
	[RevAccpWeek] [int] NULL ,
	[RevAccpAmount] [decimal](18, 2) NOT NULL ,	
	[RevAccpExpenseDate] [datetime] NOT NULL ,
	[RevAccpAssociatedRecurringFixedCost] [int] NOT NULL ,
	[RevAccpJDEId] [int] NOT NULL ,	
	[RevAccpActive] [bit] NULL ,
	[RevAccpCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevAccpCrtdAt] [datetime] NULL ,
	[RevAccpModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevAccpModAt] [datetime] NULL ,
	CONSTRAINT [PK_RevAccountPayable] PRIMARY KEY CLUSTERED 
	(
		[RevAccountPayable]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_RevAccountPayable] ON [dbo].[RevAccountPayables]([HcmHouseCode], [FscYear], [FscPeriod]) ON [PRIMARY]
GO


CREATE TABLE [RevAccountReceivablePaidImports] (
	[RevAccountReceivablePaidImport] [int] IDENTITY (1, 1) NOT NULL ,
	[RevAccountReceivable] [int] NULL ,
	[RevAccrpiDocumentType] [varchar] (2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevAccrpiDocumentNumber] [int] NOT NULL ,
	[RevAccrpiPayType] [varchar] (2) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevAccrpiPayNumber] [int] NOT NULL ,
	[RevAccrpiCheckDate] [datetime] NOT NULL ,
	[RevAccrpiApplicationDate] [datetime] NOT NULL ,
	[RevAccrpiAmount] [decimal](15, 2) NOT NULL ,
	[RevAccrpiHouseCode] [int] NOT NULL ,
	[RevAccrpiImported] [bit] NOT NULL ,	
	[RevAccrpiImportedBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevAccrpiImportedAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_RevAccountReceivablePaidImport] PRIMARY KEY CLUSTERED 
	(
		[RevAccountReceivablePaidImport]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [RevAccountReceivables] (
	[RevAccountReceivable] [int] IDENTITY (1, 1) NOT NULL ,
	[RevInvoice] [int] NULL ,
	[HcmHouseCode] [int] NULL ,	
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[AppTransactionStatusType] [int] NULL ,
	[RevTableType] [int] NULL ,
	[RevAccrWeek] [int] NULL ,
	[RevAccrCheckNumber] [varchar] (25) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevAccrCheckDate] [datetime] NULL ,
	[RevAccrAmount] [decimal](18, 2) NULL ,
	[RevAccrDepositDate] [datetime] NULL ,	
	[RevAccrPayer] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[RevAccrNotes] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[RevAccrAssociatedRecurringFixedCost] [bit] NULL ,
	[RevAccrJDEId] [int] NULL ,	
	[RevAccrActive] [bit] NULL ,
	[RevAccrVersion] [int] NULL ,
	[RevAccrCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevAccrCrtdAt] [datetime] NULL ,
	[RevAccrModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevAccrModAt] [datetime] NULL ,
	[OldId] [int] NULL ,
	CONSTRAINT [PK_RevAccountReceivable] PRIMARY KEY CLUSTERED 
	(
		[RevAccountReceivable]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_RevAccountReceivable] ON [dbo].[RevAccountReceivables]([RevAccountReceivable], [RevInvoice]) ON [PRIMARY]
GO


CREATE TABLE [RevInvoiceItems] (
	[RevInvoiceItem] [int] IDENTITY (1, 1) NOT NULL ,
	[RevInvoice] [int] NULL ,
	[RevAccountReceivable] [int] NULL CONSTRAINT [DF_RevInvoiceItems_RevAccountReceivable] DEFAULT ((0)),
	[FscAccount] [int] NULL ,
	[HcmHouseCodeJob] [int] NULL ,
	[AppTransactionStatusType] [int] NULL ,
	[RevTableType] [int] NULL ,
	[RevInviTaxable] [bit] NULL ,
	[RevInviAmount] [decimal](18, 2) NULL ,
	[RevInviDescription] [varchar] (1024) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInviAssociatedRecurringFixedCost] [bit] NULL CONSTRAINT [DF_RevInvoiceItems_RevInviAssociatedRecurringFixedCost] DEFAULT ((0)),
	[RevInviJDEId] [int] NULL ,	
	[RevInviCreditMemoNumber] [int] NULL ,
	[RevInviCreditMemoPrintedDate] [datetime] NULL ,
	[RevInviActive] [bit] NULL CONSTRAINT [DF_RevInvoiceItems_RevInviActive] DEFAULT ((1)),
	[RevInviVersion] [int] NULL ,
	[RevInviCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInviCrtdAt] [datetime] NULL CONSTRAINT [DF_RevInvoiceItems_RevInviCrtdAt] DEFAULT (getdate()),
	[RevInviModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInviModAt] [datetime] NULL ,
	CONSTRAINT [PK_RevInvoiceItem] PRIMARY KEY CLUSTERED 
	(
		[RevInvoiceItem]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_RevInvoiceItem] ON [dbo].[RevInvoiceItems]([RevInvoiceItem], [RevInvoice]) ON [PRIMARY]
GO


CREATE TABLE [RevInvoices] (
	[RevInvoice] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscYear] [int] NULL ,
	[FscPeriod] [int] NULL ,
	[AppTransactionStatusType] [int] NULL CONSTRAINT [DF_RevInvoices_AppTransactionStatusType] DEFAULT ((1)),
	[RevInvWeek] [int] NULL ,
	[RevInvInvoiceNumber] [int] NULL ,
	[RevInvInvoiceDate] [datetime] NULL CONSTRAINT [DF_RevInvoices_RevInvInvoiceDate] DEFAULT (GetDate()),
	[RevInvDueDate] [datetime] NULL ,
	[RevInvServicePeriodStartDate] [datetime] NULL ,
	[RevInvServicePeriodEndDate] [datetime] NULL ,
	[RevInvBillTo] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvCompany] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvAddress1] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvAddress2] [varchar] (100) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvCity] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[AppStateType] [int] NULL ,
	[RevInvPostalCode] [varchar] (10) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvPrinted] [bit] NULL CONSTRAINT [DF_RevInvoices_RevInvPrinted] DEFAULT ((0)),
	[RevInvPrintedBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvLastPrinted] [datetime] NULL ,
	[RevInvCreditMemoLastPrinted] [datetime] NULL ,	
	[RevInvPaidOff] [bit] NULL CONSTRAINT [DF_RevInvoices_RevInvPaidOff] DEFAULT ((0)),	
	[RevInvTaxExempt] [bit] NULL CONSTRAINT [DF_RevInvoices_RevInvTaxExempt] DEFAULT ((0)),
	[RevInvTaxNumber] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvStateTax] [decimal](10, 2) NULL ,
	[RevMunicipalityTax] [int] NULL ,
	[RevInvOtherMunicipality] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvLocalTax] [decimal](10, 2) NULL ,
	[RevInvActive] [bit] NULL CONSTRAINT [DF_RevInvoices_RevInvActive] DEFAULT ((1)),
	[RevInvVersion] [int] NULL ,
	[RevInvCrtdBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvCrtdAt] [datetime] NULL CONSTRAINT [DF_RevInvoices_RevInvCrtdAt] DEFAULT (getdate()),
	[RevInvModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevInvModAt] [datetime] NULL ,
	CONSTRAINT [PK_RevInvoice] PRIMARY KEY CLUSTERED 
	(
		[RevInvoice]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_RevInvoice] ON [dbo].[RevInvoices]([HcmHouseCode], [FscYear], [FscPeriod]) ON [PRIMARY]
GO


CREATE TABLE [RevMunicipalityTaxes] (
	[RevMunicipalityTax] [int] IDENTITY (1, 1) NOT NULL ,
	[AppStateType] [int] NOT NULL ,
	[RevMuntxBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevMuntxTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevMuntxDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[RevMuntxTaxPercent] [decimal](10, 2) NULL ,
	[RevMuntxDisplayOrder] [int] NULL ,
	[RevMuntxActive] [bit] NOT NULL ,
	[RevMuntxModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevMuntxModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_RevMunicipalityTax] PRIMARY KEY CLUSTERED 
	(
		[RevMunicipalityTax]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [RevOtherRevenues] (
	[RevOtherRevenue] [int] IDENTITY (1, 1) NOT NULL ,
	[HcmHouseCode] [int] NULL ,
	[FscAccount] [int] NULL ,
	[FscYear] [int] NULL CONSTRAINT [DF_RevOtherRevenues_FscYear] DEFAULT ((0)),
	[FscPeriod] [int] NULL CONSTRAINT [DF_RevOtherRevenues_FscPeriod] DEFAULT ((0)),
	[AppTransactionStatusType] [int] NULL CONSTRAINT [DF_RevOtherRevenues_AppTransactionStatusType] DEFAULT ((1)),
	[RevTableType] [int] NULL ,
	[RevOthrWeek] [int] NULL CONSTRAINT [DF_RevOtherRevenues_RevOthrWeek] DEFAULT ((0)),
	[RevOthrAmount] [decimal](15, 2) NULL ,	
	[RevOthrExpenseDate] [datetime] NULL CONSTRAINT [DF_RevOtherRevenues_RevOthrExpenseDate] DEFAULT (getdate()),
	[RevOthrAssociatedRecurringFixedCost] [bit] NULL CONSTRAINT [DF_RevOtherRevenues_RevOthrAssociatedRecurringFixedCost] DEFAULT ((0)),
	[RevOthrJDEId] [int] NULL ,	
	[RevOthrActive] [bit] NULL CONSTRAINT [DF_RevOtherRevenues_RevOthrActive] DEFAULT ((1)),
	[RevOthrCrtddBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevOthrCrtdAt] [datetime] NULL CONSTRAINT [DF_RevOtherRevenues_RevOthrCrtdAt] DEFAULT (getdate()),
	[RevOthrModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevOthrModAt] [datetime] NULL ,
	[OldId] [int] NOT NULL CONSTRAINT [DF_RevOtherRevenues_OldId] DEFAULT ((0)),
	CONSTRAINT [PK_RevOtherRevenue] PRIMARY KEY CLUSTERED 
	(
		[RevOtherRevenue]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO

CREATE  INDEX [IX_RevOtherRevenue] ON [dbo].[RevOtherRevenues]([HcmHouseCode], [FscYear], [FscPeriod]) ON [PRIMARY]
GO


CREATE TABLE [RevStateTaxes] (
	[RevStateTax] [int] IDENTITY (1, 1) NOT NULL ,
	[AppStateType] [int] NOT NULL ,
	[RevStatxBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevStatxTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevStatxDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,	
	[RevStatxTaxPercent] [decimal](10, 2) NULL ,
	[RevStatxDisplayOrder] [int] NULL ,
	[RevStatxActive] [bit] NOT NULL ,
	[RevStatxModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevStatxModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_RevStateTax] PRIMARY KEY CLUSTERED 
	(
		[RevStateTax]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO


CREATE TABLE [RevTableTypes] (
	[RevTableType] [int] IDENTITY (1, 1) NOT NULL ,
	[RevTabtBrief] [varchar] (16) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevTabtTitle] [varchar] (64) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,
	[RevTabtDescription] [varchar] (256) COLLATE SQL_Latin1_General_CP1_CI_AS NULL ,	
	[RevTabtDisplayOrder] [int] NULL ,
	[RevTabtActive] [bit] NOT NULL ,
	[RevTabtModBy] [varchar] (50) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL ,
	[RevTabtModAt] [datetime] NOT NULL ,
	CONSTRAINT [PK_RevTableType] PRIMARY KEY CLUSTERED 
	(
		[RevTableType]
	)  ON [PRIMARY] 
) ON [PRIMARY]
GO
USE [FLOW_ULED]
GO

/****** Object:  Table [dbo].[ULEDSummary]    Script Date: 7/6/2018 12:14:41 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[EVSULEDSummary](
	[HouseCode] [varchar](16) NULL,
	[FacilityName] [varchar](64) NULL,
	[FunctionalArea] [varchar](50) NULL,
	[Fiscal_Year] [varchar](64) NOT NULL,
	[Fiscal_Period] [int] NULL,
	[Calendar_Month] [varchar](50) NOT NULL,
	[Calendar_Year] [varchar](50) NOT NULL,
	[Period] [varchar](50) NOT NULL,
	[RequestDate] [datetime] NOT NULL,
	[ULEDWeekEnding] [nvarchar](50) NOT NULL,
	[TotalScheduledComplete] [int] NOT NULL,
	[TotalArrivedOnTimeTasks] [int] NOT NULL,
	[TotalDemandComplete] [int] NOT NULL,
	[RTA30] [int] NOT NULL,
	[RTC60] [int] NOT NULL,
	[TotalCancelled] [int] NOT NULL,
	[TotalActiveTime] [int] NOT NULL,
	[TotalAssignedTime] [int] NOT NULL,
	[TotalTripTime] [int] NOT NULL,
	[TotalDelayTime] [int] NOT NULL,
	[TotalComplete] [int] NOT NULL,
	[TotalERComplete] [int] NOT NULL,
	[TotalDelayed] [int] NOT NULL,
	[TotalSelfDispatched] [int] NOT NULL,
	[stehirNode] [int] NOT NULL,
	[TotalUnassignedTime] [int] NOT NULL
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO



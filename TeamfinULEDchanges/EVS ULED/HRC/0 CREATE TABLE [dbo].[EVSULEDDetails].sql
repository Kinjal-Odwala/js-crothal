USE [HRC_ULED]
GO

/****** Object:  Table [dbo].[EVSULEDDetails]    Script Date: 7/6/2018 10:45:47 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[EVSULEDDetails](
	[EVSULEDDetail] [int] IDENTITY(1,1) NOT NULL,
	[TaskKey] [bigint] NOT NULL,
	[stehirNode] [int] NOT NULL,
	[FunctionalAreaKey] [smallint] NULL,
	[TaskSource] [varchar](100) NULL,
	[TaskClass] [varchar](50) NULL,
	[TaskStatus] [varchar](50) NULL,
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
	[RTA30]  [int] NOT NULL
	,[RTC60]  [int] NOT NULL
	,[TotalCancelled]  [int] NOT NULL
	,[TotalActiveTime]  [int] NOT NULL
	,[TotalAssignedTime]  [int] NOT NULL
	,[TotalTripTime]  [int] NOT NULL
	,[TotalDelayTime]  [int] NOT NULL
	,[TotalComplete]  [int] NOT NULL
	,[TotalERComplete]  [int] NOT NULL
	,[TotalDelayed]  [int] NOT NULL
	,[TotalSelfDispatched]  [int] NOT NULL
	,[TotalUnassignedTime]  [int] NOT NULL
	,[DetailsImportDate] [datetime] NOT NULL,
 CONSTRAINT [PK_EVSULEDDetails] PRIMARY KEY CLUSTERED 
(
	[EVSULEDDetail] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO

SET ANSI_PADDING OFF
GO
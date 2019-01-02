USE [FLOW_ULED]
GO

/****** Object:  View [dbo].[vwULEDSummaryMinutes]    Script Date: 7/6/2018 12:18:39 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[vwEVSULEDSummaryMinutes] AS

SELECT
	A.[HouseCode],
	A.[FacilityName],
	A.[FunctionalArea],
	A.[Fiscal_Year],
	A.[Fiscal_Period],
	A.[Calendar_Month],
	A.[Calendar_Year],
	A.[Period],
	A.[RequestDate],
	A.[ULEDWeekEnding],
	A.[TotalScheduledComplete],
	A.[TotalArrivedOnTimeTasks],
	A.[TotalDemandComplete],
	A.[RTA30],
	A.[RTC60],
	A.[TotalCancelled],
	A.[TotalActiveTime]/60 as [TotalActiveTime],
	A.[TotalAssignedTime]/60 as [TotalAssignedTime],
	A.[TotalTripTime]/60 as [TotalTripTime],
	A.[TotalDelayTime]/60 as [TotalDelayTime],
	A.[TotalComplete],
	A.[TotalERComplete],
	A.[TotalDelayed],
	A.[TotalSelfDispatched],
	A.[stehirNode],
	A.[TotalUnassignedTime]/60 as [TotalUnassignedTime]
FROM [dbo].[EVSULEDSummary] A

GO



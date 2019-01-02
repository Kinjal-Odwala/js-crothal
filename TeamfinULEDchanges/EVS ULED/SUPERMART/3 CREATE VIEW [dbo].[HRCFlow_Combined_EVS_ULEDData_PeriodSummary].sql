USE [SuperMart]
GO

/****** Object:  View [dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary]   Script Date: 7/9/2018 2:16:54 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary] 
AS
/*
Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This View will return period summarized combined EVS ULED from HRC and TeamFlow by HouseCode, Functional Area, or steHirNode

*/



SELECT
	[HouseCode],
	[FacilityName],
	[FunctionalArea],
	[Fiscal_Year],
	[Fiscal_Period],
	[Calendar_Month],
	[Calendar_Year],
	[Period],
	min(RequestDate) as PeriodStartDate,
	max(RequestDate) as PeriodEndDate,
	--[RequestDate],
	--[ULEDWeekEnding],
	sum([TotalScheduledComplete]) as [TotalScheduledComplete],
	sum([TotalArrivedOnTimeTasks]) as [TotalArrivedOnTimeTasks],
	sum([TotalDemandComplete]) as TotalDemandComplete,
	sum([RTA30]) as RTA30,
	sum([RTC60]) as RTC60,
	sum([TotalCancelled]) as TotalCancelled,
	sum([TotalActiveTime]) as TotalActiveTime,
	sum([TotalAssignedTime]) as TotalAssignedTime,
	sum([TotalTripTime]) as TotalTripTime,
	sum([TotalDelayTime]) as TotalDelayTime,
	sum([TotalComplete]) as TotalComplete,
	sum([TotalERComplete]) as TotalERComplete,
	sum([TotalDelayed]) as TotalDelayed,
	sum([TotalSelfDispatched]) as TotalSelfDispatched,
	[stehirNode],
	sum([TotalUnassignedTime]) as TotalUnassignedTime
FROM [dbo].[HRCFlow_Combined_EVS_ULEDData]
GROUP BY
	[HouseCode],
	[FacilityName],
	[FunctionalArea],
	[Fiscal_Year],
	[Fiscal_Period],
	[Calendar_Month],
	[Calendar_Year],
	[Period],
	[stehirNode]

GO



USE [HRC_ULED]
GO

/****** Object:  View [dbo].[vwEVSHRC_ULEDSummary]   Script Date: 7/6/2018 11:09:16 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO


CREATE VIEW [dbo].[vwEVSHRC_ULEDSummary]
AS

SELECT
	EVSULED.HouseCode,
	EVSULED.FacilityName,
	EVSULED.FunctionalArea,
	EVSULED.Fiscal_Year,
	EVSULED.Fiscal_Period,
	EVSULED.Calendar_Month,
	EVSULED.Calendar_Year,
	EVSULED.Period,
	EVSULED.RequestDate,
	EVSULED.ULEDWeekEnding,
	EVSULED.TotalScheduledComplete,
	EVSULED.TotalArrivedOnTimeTasks,
	EVSULED.TotalDemandComplete,
	EVSULED.RTA30,
	EVSULED.RTC60,
	EVSULED.TotalCancelled,
	EVSULED.TotalActiveTime,
	EVSULED.TotalAssignedTime,
	EVSULED.TotalTripTime,
	EVSULED.TotalDelayTime,
	EVSULED.TotalComplete,
	EVSULED.TotalERComplete,
	EVSULED.TotalDelayed,
	EVSULED.TotalSelfDispatched,
	EVSULED.stehirNode,
	EVSULED.TotalUnassignedTime
FROM
	(
		SELECT
			a.HouseCode,
			a.FacilityName,
			a.FunctionalArea,
			a.Fiscal_Year,
			a.Fiscal_Period,
			a.Calendar_Month,
			a.Calendar_Year,
			a.Period,
			a.RequestDate,
			a.ULEDWeekEnding,
			a.TotalScheduledComplete,
			a.TotalArrivedOnTimeTasks,
			a.TotalDemandComplete,
			a.RTA30,
			a.RTC60,
			a.TotalCancelled,
			a.TotalActiveTime,
			a.TotalAssignedTime,
			a.TotalTripTime,
			a.TotalDelayTime,
			a.TotalComplete,
			a.TotalERComplete,
			a.TotalDelayed,
			a.TotalSelfDispatched,
			a.stehirNode,
			a.TotalUnassignedTime
		FROM dbo.EVSULEDSummary a with (nolock)
		WHERE a.stehirNode not in (113334,113335) --Filter out the two Hallmark Sites as their data will be returned in the next section
		
		UNION ALL
		
		SELECT
			'1067' as HouseCode,
			'Hallmark Health' as FacilityName,
			b.FunctionalArea,
			b.[Fiscal_Year],
			b.[Fiscal_Period],
			b.[Calendar_Month],
			b.[Calendar_Year],
			b.[Period],
			b.RequestDate,
			b.ULEDWeekEnding,
			sum(b.TotalScheduledComplete) as TotalScheduledComplete,
			sum(b.TotalArrivedOnTimeTasks) as TotalArrivedOnTimeTasks,
			sum(b.TotalDemandComplete) as TotalDemandComplete,
			sum(b.RTA30) as RTA30,
			sum(b.RTC60) as RTC60,
			sum(b.TotalCancelled) as TotalCancelled,
			sum(b.TotalActiveTime) as TotalActiveTime,
			sum(b.TotalAssignedTime) as TotalAssignedTime,
			sum(b.TotalTripTime) as TotalTripTime,
			sum(b.TotalDelayTime) as TotalDelayTime,
			sum(b.TotalComplete) as TotalComplete,
			sum(b.TotalERComplete) as TotalERComplete,
			sum(b.TotalDelayed) as TotalDelayed,
			sum(b.TotalSelfDispatched) as TotalSelfDispatched,
			113334 as stehirNode,
			sum(b.[TotalUnassignedTime]) as [TotalUnassignedTime]
		FROM [dbo].[EVSULEDSummary] b with (nolock)
		WHERE b.stehirnode in(113334,113335) --Limit to just the two Hallmark sites

		GROUP BY
			b.FunctionalArea,
			b.[Fiscal_Year],
			b.[Fiscal_Period],
			b.[Calendar_Month],
			b.[Calendar_Year],
			b.[Period],
			b.RequestDate,
			b.ULEDWeekEnding
		
	
	) EVSULED


GO



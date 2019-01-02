USE [FLOW_ULED]
GO

/****** Object:  StoredProcedure [dbo].[ULEDSummary_Insert]    Script Date: 7/6/2018 12:08:13 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



ALTER PROCEDURE [dbo].[ULEDSummary_Insert]

AS


/*
Description:	Stored Procedure to insert Summary Data of the ULEDDetails table into the ULEDSummary table

Date		Author				Notes
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
2016-04-22	Michael Jacobi		Created Proc
2017-11-06	Michael Jacobi		Added the RTA15 and RTC35 metrics
*/


INSERT INTO [dbo].[ULEDSummary]
	(
		[HouseCode],
		[FacilityName],
		[FunctionalArea],
		[Fiscal_Year],
		[Fiscal_Period],
		[Calendar_Month],
		[Calendar_Year],
		[Period],
		[RequestDate],
		[ULEDWeekEnding],
		[TotalScheduledComplete],
		[TotalArrivedOnTimeTasks],
		[TotalDemandComplete],
		[RTAU10],
		[RTA15],
		[RTC20],
		[DTC20],
		[RTC30],
		[RTC35],
		[TotalCancelled],
		[TotalActiveTime],
		[TotalAssignedTime],
		[TotalTripTime],
		[TotalDelayTime],
		[TotalComplete],
		[TotalERComplete],
		[TotalDischargesComplete],
		[TotalDelayed],
		[TotalSelfDispatched],
		[stehirNode],
		[TotalUnassignedTime]
	)

	
SELECT
	ULED.[HouseCode],
	ULED.[FacilityName],
	ULED.[FunctionalArea],
	ULED.[Fiscal_Year],
	ULED.[Fiscal_Period],
	ULED.[Calendar_Month],
	ULED.[Calendar_Year],
	ULED.[Period],
	ULED.[RequestDate],
	ULED.[ULEDWeekEnding],
	ULED.[TotalScheduledComplete],
	ULED.[TotalArrivedOnTimeTasks],
	ULED.[TotalDemandComplete],
	ULED.[RTAU10],
	ULED.[RTA15],
	ULED.[RTC20],
	ULED.[DTC20],
	ULED.[RTC30],
	ULED.[RTC35],
	ULED.[TotalCancelled],
	ULED.[TotalActiveTime],
	ULED.[TotalAssignedTime],
	ULED.[TotalTripTime],
	ULED.[TotalDelayTime],
	ULED.[TotalComplete],
	ULED.[TotalERComplete],
	ULED.[TotalDischargesComplete],
	ULED.[TotalDelayed],
	ULED.[TotalSelfDispatched],
	ULED.[stehirNode],
	ULED.[TotalUnassignedTime]
	
FROM
	(
		SELECT
			HouseCode,
			FacilityName,
			FunctionalArea,
			Fiscal_Year,
			Fiscal_Period,
			Calendar_Month,
			Calendar_Year,
			Period,
			RequestDate,
			ULEDWeekEnding,
			
			sum(TotalScheduledComplete) as TotalScheduledComplete,
			sum(TotalArrivedOnTimeTasks) as TotalArrivedOnTimeTasks,
			sum(TotalDemandComplete) as TotalDemandComplete,
			sum(RTAU10) as RTAU10,
			sum(RTA15) as RTA15,
			sum(RTC20) as RTC20,
			sum(DTC20) as DTC20,
			sum(RTC30) as RTC30,
			sum(RTC35) as RTC35,
			sum(TotalCancelled) as TotalCancelled,
			sum(TotalActiveTime) as TotalActiveTime,
			sum(TotalAssignedTime) as TotalAssignedTime,
			sum(TotalTripTime) as TotalTripTime,
			sum(TotalDelayTime) as TotalDelayTime,
			sum(TotalComplete) as TotalComplete,
			sum(TotalERComplete) as TotalERComplete,
			sum(TotalDischargesComplete) as TotalDischargesComplete,
			sum(TotalDelayed) as TotalDelayed,
			sum(TotalSelfDispatched) as TotalSelfDispatched,
			stehirNode,
			sum(TotalUnassignedTime) as TotalUnassignedTime
			
		FROM [FLOW_ULED].[dbo].[ULEDDetails] with (nolock)
			
		GROUP BY
			HouseCode,
			FacilityName,
			FunctionalArea,
			Fiscal_Year,
			Fiscal_Period,
			Calendar_Month,
			Calendar_Year,
			Period,
			RequestDate,
			ULEDWeekEnding,
			stehirNode
			
) ULED

ORDER BY
	ULED.RequestDate,
	ULED.HouseCode




------------------ADDED FOR EVS ULED------------RICHA---------2018/7/6------------START--------------

INSERT INTO [dbo].[EVSULEDSummary]
	(
		[HouseCode],
		[FacilityName],
		[FunctionalArea],
		[Fiscal_Year],
		[Fiscal_Period],
		[Calendar_Month],
		[Calendar_Year],
		[Period],
		[RequestDate],
		[ULEDWeekEnding],
		[TotalScheduledComplete],
		[TotalArrivedOnTimeTasks],
		[TotalDemandComplete],
		[RTA30],
		[RTC60],
		[TotalCancelled],
		[TotalActiveTime],
		[TotalAssignedTime],
		[TotalTripTime],
		[TotalDelayTime],
		[TotalComplete],
		[TotalERComplete],
		[TotalDelayed],
		[TotalSelfDispatched],
		[stehirNode],
		[TotalUnassignedTime]
	)

	
SELECT
	EVSULED.[HouseCode],
	EVSULED.[FacilityName],
	EVSULED.[FunctionalArea],
	EVSULED.[Fiscal_Year],
	EVSULED.[Fiscal_Period],
	EVSULED.[Calendar_Month],
	EVSULED.[Calendar_Year],
	EVSULED.[Period],
	EVSULED.[RequestDate],
	EVSULED.[ULEDWeekEnding],
	EVSULED.[TotalScheduledComplete],
	EVSULED.[TotalArrivedOnTimeTasks],
	EVSULED.[TotalDemandComplete],
	EVSULED.[RTA30],
	EVSULED.[RTC60],
	EVSULED.[TotalCancelled],
	EVSULED.[TotalActiveTime],
	EVSULED.[TotalAssignedTime],
	EVSULED.[TotalTripTime],
	EVSULED.[TotalDelayTime],
	EVSULED.[TotalComplete],
	EVSULED.[TotalERComplete],
	EVSULED.[TotalDelayed],
	EVSULED.[TotalSelfDispatched],
	EVSULED.[stehirNode],
	EVSULED.[TotalUnassignedTime]
	
FROM
	(
		SELECT
			HouseCode,
			FacilityName,
			FunctionalArea,
			Fiscal_Year,
			Fiscal_Period,
			Calendar_Month,
			Calendar_Year,
			Period,
			RequestDate,
			ULEDWeekEnding,
			sum(TotalScheduledComplete) as TotalScheduledComplete,
			sum(TotalArrivedOnTimeTasks) as TotalArrivedOnTimeTasks,
			sum(TotalDemandComplete) as TotalDemandComplete,
			sum(RTA30) as RTA30,
			sum(RTC60) as RTC60,
			sum(TotalCancelled) as TotalCancelled,
			sum(TotalActiveTime) as TotalActiveTime,
			sum(TotalAssignedTime) as TotalAssignedTime,
			sum(TotalTripTime) as TotalTripTime,
			sum(TotalDelayTime) as TotalDelayTime,
			sum(TotalComplete) as TotalComplete,
			sum(TotalERComplete) as TotalERComplete,
			sum(TotalDelayed) as TotalDelayed,
			sum(TotalSelfDispatched) as TotalSelfDispatched,
			stehirNode,
			sum(TotalUnassignedTime) as TotalUnassignedTime
			
		FROM [FLOW_ULED].[dbo].[EVSULEDDetails] with (nolock)
			
		GROUP BY
			HouseCode,
			FacilityName,
			FunctionalArea,
			Fiscal_Year,
			Fiscal_Period,
			Calendar_Month,
			Calendar_Year,
			Period,
			RequestDate,
			ULEDWeekEnding,
			stehirNode
			
) EVSULED

ORDER BY
	EVSULED.RequestDate,
	EVSULED.HouseCode

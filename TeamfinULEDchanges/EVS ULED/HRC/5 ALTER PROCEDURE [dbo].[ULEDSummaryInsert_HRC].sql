USE [HRC_ULED]
GO
/****** Object:  StoredProcedure [dbo].[ULEDSummaryInsert_HRC]    Script Date: 11/22/2018 9:06:16 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



ALTER PROCEDURE [dbo].[ULEDSummaryInsert_HRC]

AS


/*
Description:	Stored Procedure to insert Summary Data of the ULEDDetails table into the ULEDSummary table

Date		Author				Notes
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
2017-03-28	Michael Jacobi		Created Proc
2017-04-17	Michael Jacobi		Added a Drop Index before the data insert, and recreate the index after the data insert

*/

/* Drop the Existing Index before inserting new data */
	DROP INDEX [idx_stehirNode_RequestDate] ON [dbo].[ULEDSummary]
	

/* Insert the summary data into the table */
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
			[RTC20],
			[DTC20],
			[RTC30],
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
		ULED.[RTC20],
		ULED.[DTC20],
		ULED.[RTC30],
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
				sum(RTC20) as RTC20,
				sum(DTC20) as DTC20,
				sum(RTC30) as RTC30,
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

			FROM [HRC_ULED].[dbo].[ULEDDetails] with (nolock)
				
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

		
/* Recreate the indexes*/
	CREATE NONCLUSTERED INDEX [idx_stehirNode_RequestDate] ON [dbo].[ULEDSummary]
		(
			[stehirNode] ASC,
			[RequestDate] ASC
		)
	INCLUDE
		(
			[TotalScheduledComplete],
			[TotalArrivedOnTimeTasks],
			[TotalDemandComplete]
		)
	WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

----------------ADDING CODE FOR EVS ULED-------------RICHA 2018/7/6-----------START--------------------------

/* Drop the Existing Index before inserting new data */
	DROP INDEX [idx_EVS_stehirNode_RequestDate] ON [dbo].[EVSULEDSummary]
	

/* Insert the summary data into the table */
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

			FROM [HRC_ULED].[dbo].[EVSULEDDetails] with (nolock)
				
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

		
/* Recreate the indexes*/
	CREATE NONCLUSTERED INDEX [idx_EVS_stehirNode_RequestDate] ON [dbo].[EVSULEDSummary]
		(
			[stehirNode] ASC,
			[RequestDate] ASC
		)
	INCLUDE
		(
			[TotalScheduledComplete],
			[TotalArrivedOnTimeTasks],
			[TotalDemandComplete]
		)
	WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

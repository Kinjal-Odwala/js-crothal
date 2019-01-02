USE [HRC_ULED]
GO
/****** Object:  StoredProcedure [dbo].[ULEDDetailsInsert_HRC]    Script Date: 7/6/2018 11:33:35 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[ULEDDetailsInsert_HRC]
(
	@StartDate as datetime,
	@EndDate as datetime
)
AS

/*
Description:	Nightly Job that checks TT_REP.tskRequestTrans for new records and converts and copies those to HRC_dbo.ULEDDetails table

Date		Author				Notes
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
2017-03-03	Michael Jacobi		Created Proc
2017-03-27	Michael Jacobi		Continued Proc
2017-03-30	Michael Jacobi		Updated to put the results in a temp table first
2017-06-21	Michael Jacobi		Added a condition to the final data insert to only check for existing records in the specified date range

*/


--EXEC [dbo].[ULEDDetailsInsert_HRC] @StartDate = '2017-03-28', @EndDate = '2017-03-30'

DECLARE @NStartDate datetime
DECLARE @NEndDate datetime
DECLARE @NEndDatePlusOne datetime

SET @NStartDate = @StartDate
SET @NEndDate = @EndDate
SET @NEndDatePlusOne = (@NEndDate + 1)


/* Create temp table to insert the records into */

CREATE TABLE #ULEDDetailsTemp
	(
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
		[RTAU10] [int] NOT NULL,
		[RTC20] [int] NOT NULL,
		[DTC20] [int] NOT NULL,
		[RTC30] [int] NOT NULL,
		[TotalCancelled] [int] NOT NULL,
		[TotalActiveTime] [int] NOT NULL,
		[TotalAssignedTime] [int] NOT NULL,
		[TotalTripTime] [int] NOT NULL,
		[TotalDelayTime] [int] NOT NULL,
		[TotalComplete] [int] NOT NULL,
		[TotalERComplete] [int] NOT NULL,
		[TotalDischargesComplete] [int] NOT NULL,
		[TotalDelayed] [int] NOT NULL,
		[TotalSelfDispatched] [int] NOT NULL,
		[TotalUnassignedTime] [int] NOT NULL,
		[DetailsImportDate] [datetime] NOT NULL
	)

INSERT INTO #ULEDDetailsTemp
	(
		[TaskKey],
		[stehirNode],
		[FunctionalAreaKey],
		[TaskSource],
		[TaskClass],
		[TaskStatus],
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
		[TotalUnassignedTime],
		[DetailsImportDate]
	)

SELECT
			[TaskKey],
			[stehirNode],
			[FunctionalAreaKey],
			[TaskSource],
			[TaskClass],
			[TaskStatus],
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
			[TotalUnassignedTime],
			getdate() as [DetailsImportDate]
FROM vwULEDDetails ULED
WHERE
	/* Limit Data to the specified date range */
	ULED.RequestDate >= @NStartDate
	AND ULED.RequestDate < @NEndDatePlusOne
	
INSERT INTO [dbo].[ULEDDetails]
	   (
			[TaskKey],
			[stehirNode],
			[FunctionalAreaKey],
			[TaskSource],
			[TaskClass],
			[TaskStatus],
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
			[TotalUnassignedTime],
			[DetailsImportDate]
	   )

SELECT
			[TaskKey],
			[stehirNode],
			[FunctionalAreaKey],
			[TaskSource],
			[TaskClass],
			[TaskStatus],
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
			[TotalUnassignedTime],
			[DetailsImportDate]
FROM #ULEDDetailsTemp ULEDTEMP
WHERE
	
	/* Prevent inserting duplicate data */
	ULEDTEMP.TaskKey not in
		(
			select
				TaskKey
			from [HRC_ULED].[dbo].[ULEDDetails] with (nolock)
			where
				RequestDate >= @NStartDate
				AND RequestDate < @NEndDatePlusOne
		)
	
	
/* Drop the temp table */
DROP TABLE #ULEDDetailsTemp

---------------ADDING CODE FOR EVS ULED TABLES-----------------Richa 2018/7/6------------------------START----------

/* Create temp table to insert the records into */

CREATE TABLE #EVSULEDDetailsTemp
	(
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
		,[DetailsImportDate] datetime null
	)

INSERT INTO #EVSULEDDetailsTemp
	(
	   [TaskKey]
      ,[stehirNode]
      ,[FunctionalAreaKey]
      ,[TaskSource]
      ,[TaskClass]
      ,[TaskStatus]
      ,[HouseCode]
      ,[FacilityName]
      ,[FunctionalArea]
      ,[Fiscal_Year]
      ,[Fiscal_Period]
      ,[Calendar_Month]
      ,[Calendar_Year]
      ,[Period]
      ,[RequestDate]
      ,[ULEDWeekEnding]
      ,[TotalScheduledComplete]
      ,[TotalArrivedOnTimeTasks]
      ,[TotalDemandComplete]
      ,[RTA30]
      ,[RTC60]
      ,[TotalCancelled]
      ,[TotalActiveTime]
      ,[TotalAssignedTime]
      ,[TotalTripTime]
      ,[TotalDelayTime]
      ,[TotalComplete]
      ,[TotalERComplete]
      ,[TotalDelayed]
      ,[TotalSelfDispatched]
      ,[TotalUnassignedTime]
	  ,[DetailsImportDate]
	)

SELECT
	   [TaskKey]
      ,[stehirNode]
      ,[FunctionalAreaKey]
      ,[TaskSource]
      ,[TaskClass]
      ,[TaskStatus]
      ,[HouseCode]
      ,[FacilityName]
      ,[FunctionalArea]
      ,[Fiscal_Year]
      ,[Fiscal_Period]
      ,[Calendar_Month]
      ,[Calendar_Year]
      ,[Period]
      ,[RequestDate]
      ,[ULEDWeekEnding]
      ,[TotalScheduledComplete]
      ,[TotalArrivedOnTimeTasks]
      ,[TotalDemandComplete]
      ,[RTA30]
      ,[RTC60]
      ,[TotalCancelled]
      ,[TotalActiveTime]
      ,[TotalAssignedTime]
      ,[TotalTripTime]
      ,[TotalDelayTime]
      ,[TotalComplete]
      ,[TotalERComplete]
      ,[TotalDelayed]
      ,[TotalSelfDispatched]
      ,[TotalUnassignedTime]
	  ,getdate() as [DetailsImportDate]
FROM vwEVSULEDDetails EVSULED
WHERE
	/* Limit Data to the specified date range */
	EVSULED.RequestDate >= @NStartDate
	AND EVSULED.RequestDate < @NEndDatePlusOne
	
INSERT INTO [dbo].[EVSULEDDetails]
	   (
	   [TaskKey]
      ,[stehirNode]
      ,[FunctionalAreaKey]
      ,[TaskSource]
      ,[TaskClass]
      ,[TaskStatus]
      ,[HouseCode]
      ,[FacilityName]
      ,[FunctionalArea]
      ,[Fiscal_Year]
      ,[Fiscal_Period]
      ,[Calendar_Month]
      ,[Calendar_Year]
      ,[Period]
      ,[RequestDate]
      ,[ULEDWeekEnding]
      ,[TotalScheduledComplete]
      ,[TotalArrivedOnTimeTasks]
      ,[TotalDemandComplete]
      ,[RTA30]
      ,[RTC60]
      ,[TotalCancelled]
      ,[TotalActiveTime]
      ,[TotalAssignedTime]
      ,[TotalTripTime]
      ,[TotalDelayTime]
      ,[TotalComplete]
      ,[TotalERComplete]
      ,[TotalDelayed]
      ,[TotalSelfDispatched]
      ,[TotalUnassignedTime]
	  ,[DetailsImportDate]
	   )

SELECT
				   [TaskKey]
      ,[stehirNode]
      ,[FunctionalAreaKey]
      ,[TaskSource]
      ,[TaskClass]
      ,[TaskStatus]
      ,[HouseCode]
      ,[FacilityName]
      ,[FunctionalArea]
      ,[Fiscal_Year]
      ,[Fiscal_Period]
      ,[Calendar_Month]
      ,[Calendar_Year]
      ,[Period]
      ,[RequestDate]
      ,[ULEDWeekEnding]
      ,[TotalScheduledComplete]
      ,[TotalArrivedOnTimeTasks]
      ,[TotalDemandComplete]
      ,[RTA30]
      ,[RTC60]
      ,[TotalCancelled]
      ,[TotalActiveTime]
      ,[TotalAssignedTime]
      ,[TotalTripTime]
      ,[TotalDelayTime]
      ,[TotalComplete]
      ,[TotalERComplete]
      ,[TotalDelayed]
      ,[TotalSelfDispatched]
      ,[TotalUnassignedTime]
	  ,[DetailsImportDate]
FROM #EVSULEDDetailsTemp EVSULEDTEMP
WHERE
	/* Prevent inserting duplicate data */
	EVSULEDTEMP.TaskKey not in
		(
			select
				TaskKey
			from [HRC_ULED].[dbo].[EVSULEDDetails] with (nolock)
			where
				RequestDate >= @NStartDate
				AND RequestDate < @NEndDatePlusOne
		)
	
	
/* Drop the temp table */
DROP TABLE #EVSULEDDetailsTemp
---------------ADDING CODE FOR EVS ULED TABLES-----------------Richa 2018/7/6------------------------END----------
USE [FLOW_ULED]
GO
/****** Object:  StoredProcedure [dbo].[ULEDDetailsNightlyInsert_External]    Script Date: 7/9/2018 6:02:40 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[ULEDDetailsNightlyInsert_External]
AS

/*
Description:	Nightly Job that checks FLOW_DB_IMPORT.bi.Tasks for new records and converts and copies those to FLOW_ULED.dbo.ULEDDetails table

Date		Author				Notes
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
2016-04-22	Michael Jacobi		Created Script for Job
2016-10-13	Michael Jacobi		Renamed Script to indicate this is for External Data only
2016-10-14	Michael Jacobi		Updated TaskKey to be a concatenated column
2017-01-11	Michael Jacobi		Updated the Total Arrived on Time Tasks to calculate using ScheduleDate < Close Date
2017-11-06	Michael Jacobi		Added the RTA15 and RTC35 metrics
2017-12-06	Michael Jacobi		Updated the Total Arrived on Time Tasks to calculate using Close Date <= ScheduleDate
*/


INSERT INTO [dbo].[ULEDDetails]
           (
				[TaskKey],
				[FacilityKey],
				[FunctionalAreaKey],
				[TaskSource],
				[TaskClass],
				[TaskStatus],
				[Batchkey],
				[ShiftKey],
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
				[TotalUnassignedTime],
				[DetailsImportDate]
		   )

	SELECT
				ULED.[TaskKey],
				ULED.[FacilityKey],
				ULED.[FunctionalAreaKey],
				ULED.[TaskSource],
				ULED.[TaskClass],
				ULED.[TaskStatus],
				ULED.[Batchkey],
				ULED.[ShiftKey],
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
				ULED.[TotalUnassignedTime],
				getdate() as [DetailsImportDate]
	FROM
		(

			/* Prepare External Data */
			SELECT
				cast(concat(Tasks.FacilityKey,Tasks.RequestDateKey,Tasks.TaskKey) as bigint) as TaskKey,
				--Tasks.TaskKey,
				Tasks.FacilityKey,
				Tasks.FunctionalAreaKey,
				Tasks.TaskSource,
				Tasks.TaskClass,
				Tasks.TaskStatus,
				Tasks.Batchkey,
				Tasks.ShiftKey,

				cast(HC.[House Code] as varchar(16)) as HouseCode,
				cast(Fac.FacilityTitle as varchar(64)) as FacilityName,
				cast(FA.FunctionalAreaName as varchar(50)) as FunctionalArea,
				cast(UW.FscYeaTitle as varchar(64)) as Fiscal_Year,
				cast(UW.FscPerTitle as int) as Fiscal_Period,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduleDateKey <> -1 then
						cast(datepart(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Month,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduleDateKey <> -1 then
						cast(datepart(yyyy,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(yyyy,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Year,
				
				case
					when Tasks.ScheduleDateKey <> -1 then
						cast(concat(datename(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
					else
						cast(concat(datename(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
				end as Period,
				
				/* Determine to use Request Date or Schedule Date */
				case
					when Tasks.ScheduleDateKey <> -1 then 
						cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
					else
						cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
				end	as RequestDate,
				
				/* Joined the ULED Weeks temp table to get the Week Ending Date */
				UW.ULEDWeekEnding as ULEDWeekEnding,
				
				/* Flag task as a schedule completed task if the task status is set to completed and there is a schedule date present */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey <> -1 then 1
					else 0
				end as TotalScheduledComplete,
				
				/* Calculate the number of scheduled tasks that were completed before the schedule date */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey <> -1
						and [dbo].[svfConvertIntsToDatetime](Tasks.CloseDateKey,Tasks.CloseTimeKey) <= [dbo].[svfConvertIntsToDatetime](Tasks.ScheduleDateKey,Tasks.ScheduleTimeKey)
						then 1
					else 0
				end as TotalArrivedOnTimeTasks,
				
				/* Flag task as a demand completed task if the task status is set to completed and there is no schedule date present */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 then 1
					else 0
				end as TotalDemandComplete,
				
				/* Flag task as RTAU10 if it is a demand completed task and RTATimeSecs is less than 601 secs or 10 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTATimeSecs as int) < 601 then 1
					else 0
				end as RTAU10,
				
				/* Flag task as RTA15 if it is a demand completed task and RTATimeSecs is less than 901 secs or 15 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTATimeSecs as int) < 901 then 1
					else 0
				end as RTA15,
				
				/* Flag task as RTC20 if it is a demand completed task and RTCTimeSecs is less than 1201 secs or 20 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTCTimeSecs as int) < 1201 then 1
					else 0
				end as RTC20,
				
				/* Flag task as DTC20 if it is a demand completed task and DTCTimeSecs is less than 1201 secs or 20 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.DTCTimeSecs as int) < 1201 then 1
					else 0
				end as DTC20,
				
				/* Flag task as RTC30 if it is a demand completed task and RTCTimeSecs is less than 1801 secs or 30 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTCTimeSecs as int) < 1801 then 1
					else 0
				end as RTC30,
				
				/* Flag task as RTC35 if it is a demand completed task and RTCTimeSecs is less than 2101 secs or 35 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTCTimeSecs as int) < 2101 then 1
					else 0
				end as RTC35,
				
				/* Determine if task was cancelled based on status */
				case
					when Tasks.TaskStatus = 'Cancelled' then 1
					else 0
				end as TotalCancelled,
				
				/* Total Active Time in seconds for Completed Tasks */
				case
					when Tasks.TaskStatus = 'Completed' then cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalActiveTime,
				
				/* Total Assigned Time in seconds for Completed Tasks */
				case
					when Tasks.TaskStatus = 'Completed' then cast(Tasks.AssignedTimeSecs as int)
					else 0
				end as TotalAssignedTime,
				
				/* Total Trip Time in seconds for Completed Tasks.  Measured as Unassigned Time + Assigned Time + Active Time */
				case
					when Tasks.TaskStatus = 'Completed' then
						cast(Tasks.UnassignedTimeSecs as int) + cast(Tasks.AssignedTimeSecs as int) + cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalTripTime,
				
				/* Do not have Delay Time available in external data */
				0 as TotalDelayTime,
				
				/* Total Completed Tasks as indicated by a task having a Task Status of 'Completed' */
				case
					when Tasks.TaskStatus = 'Completed' then 1
					else 0
				end as TotalComplete,
				
				/* Not flagging tasks as ER at this time */
				0 as TotalERComplete,
				
				/* Not flagging tasks as Discharges at this time */
				0 as	TotalDischargesComplete,
				
				/* Delay Task Flag exists in Source Data */
				Tasks.DelayTask as TotalDelayed,
				
				/* Not flagging tasks as Self-Dispatched at this time */
				0 as TotalSelfDispatched,
				
				/* stehirNode is not a value in Flow.  Using FacilityKey instead */
				Tasks.FacilityKey as stehirNode,
				
				/* Total Unassigned Time in seconds for Completed Tasks */
				case
					when Tasks.TaskStatus = 'Completed' then cast(Tasks.UnassignedTimeSecs as int)
					else 0
				end as TotalUnassignedTime
				

			FROM FLOW_DB_IMPORT.bi.Tasks Tasks with (nolock)
			INNER JOIN FLOW_DW_DB.dm.dimFacilities Fac with (nolock)
				ON Tasks.FacilityKey = Fac.FacilityKey
			INNER JOIN FLOW_DW_DB.dm.dimFunctionalAreas FA with (nolock)
				ON Tasks.FunctionalAreaKey = FA.FunctionalAreaKey
				
			/* Get the ULED Week Ending Value and Fiscal Information from the ULEDFiscalWeeks table by joining on the Request Date */
			INNER JOIN FLOW_ULED.dbo.ULEDFiscalWeeks UW with (nolock)
				ON (case
						when Tasks.ScheduleDateKey <> -1 then 
							cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
						else
							cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
					end) = UW.ULEDDay
					
			/* Join the Temporary view dm.FacilityFuncAreaHouseCode to get the HouseCode information back */
			INNER JOIN FLOW_DW_DB.[dm].[FacilityFuncAreaHouseCode] HC with (nolock)
				ON (Tasks.FacilityKey = HC.FacilityKey) AND (Tasks.FunctionalAreaKey = HC.FunctionalAreaKey)
			
			--LEGACY
			--WHERE Tasks.TaskKey not in (select TaskKey from dbo.ULEDDetails with (nolock))



		) ULED
	
	/* Prevent Duplicate Data Insert */
	WHERE ULED.TaskKey not in (select TaskKey from FLOW_ULED.[dbo].[ULEDDetails] with (nolock))
		
-------------------------ADDED CODE FOR EVS ULED ------------------RICHA------------------2018-7-6-----START


INSERT INTO [dbo].[EVSULEDDetails]
           (
				[TaskKey],
				[FacilityKey],
				[FunctionalAreaKey],
				[TaskSource],
				[TaskClass],
				[TaskStatus],
				[Batchkey],
				[ShiftKey],
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
				[TotalUnassignedTime],
				[DetailsImportDate]
		   )

	SELECT
				EVSULED.[TaskKey],
				EVSULED.[FacilityKey],
				EVSULED.[FunctionalAreaKey],
				EVSULED.[TaskSource],
				EVSULED.[TaskClass],
				EVSULED.[TaskStatus],
				EVSULED.[Batchkey],
				EVSULED.[ShiftKey],
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
				EVSULED.[TotalUnassignedTime],
				getdate() as [DetailsImportDate]
	FROM
		(

			/* Prepare External Data */
			SELECT
				cast(concat(Tasks.FacilityKey,Tasks.RequestDateKey,Tasks.TaskKey) as bigint) as TaskKey,
				--Tasks.TaskKey,
				Tasks.FacilityKey,
				Tasks.FunctionalAreaKey,
				Tasks.TaskSource,
				Tasks.TaskClass,
				Tasks.TaskStatus,
				Tasks.Batchkey,
				Tasks.ShiftKey,
				cast(HC.[House Code] as varchar(16)) as HouseCode,
				cast(Fac.FacilityTitle as varchar(64)) as FacilityName,
				cast(FA.FunctionalAreaName as varchar(50)) as FunctionalArea,
				cast(UW.FscYeaTitle as varchar(64)) as Fiscal_Year,
				cast(UW.FscPerTitle as int) as Fiscal_Period,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduleDateKey <> -1 then
						cast(datepart(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Month,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduleDateKey <> -1 then
						cast(datepart(yyyy,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(yyyy,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Year,
				
				case
					when Tasks.ScheduleDateKey <> -1 then
						cast(concat(datename(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
					else
						cast(concat(datename(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
				end as Period,
				
				/* Determine to use Request Date or Schedule Date */
				case
					when Tasks.ScheduleDateKey <> -1 then 
						cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
					else
						cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
				end	as RequestDate,
				
				/* Joined the ULED Weeks temp table to get the Week Ending Date */
				UW.ULEDWeekEnding as ULEDWeekEnding,
				
				/* Flag task as a schedule completed task if the task status is set to completed and there is a schedule date present */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey <> -1 then 1
					else 0
				end as TotalScheduledComplete,
				
				/* Calculate the number of scheduled tasks that were completed before the schedule date */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey <> -1
						and [dbo].[svfConvertIntsToDatetime](Tasks.CloseDateKey,Tasks.CloseTimeKey) <= [dbo].[svfConvertIntsToDatetime](Tasks.ScheduleDateKey,Tasks.ScheduleTimeKey)
						then 1
					else 0
				end as TotalArrivedOnTimeTasks,
				
				/* Flag task as a demand completed task if the task status is set to completed and there is no schedule date present */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 then 1
					else 0
				end as TotalDemandComplete,
				
				/* Flag task as RTA30 if it is a demand completed task and RTATimeSecs is less than 1801 secs or 30 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTATimeSecs as int) < 1801 then 1
					else 0
				end as RTA30,
				
				/* Flag task as RTC60 if it is a demand completed task and RTATimeSecs is less than 3601 secs or 60 minutes */
				case
					when Tasks.TaskStatus = 'Completed' and Tasks.ScheduleDateKey = -1 and cast(Tasks.RTCTimeSecs as int) < 3601 then 1
					else 0
				end as RTC60,
					
				/* Determine if task was cancelled based on status */
				case
					when Tasks.TaskStatus = 'Cancelled' then 1
					else 0
				end as TotalCancelled,
				
				/* Total Active Time in seconds for Completed Tasks */
				case
					when Tasks.TaskStatus = 'Completed' then cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalActiveTime,
				
				/* Total Assigned Time in seconds for Completed Tasks */
				case
					when Tasks.TaskStatus = 'Completed' then cast(Tasks.AssignedTimeSecs as int)
					else 0
				end as TotalAssignedTime,
				
				/* Total Trip Time in seconds for Completed Tasks.  Measured as Unassigned Time + Assigned Time + Active Time */
				case
					when Tasks.TaskStatus = 'Completed' then
						cast(Tasks.UnassignedTimeSecs as int) + cast(Tasks.AssignedTimeSecs as int) + cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalTripTime,
				
				/* Do not have Delay Time available in external data */
				0 as TotalDelayTime,
				
				/* Total Completed Tasks as indicated by a task having a Task Status of 'Completed' */
				case
					when Tasks.TaskStatus = 'Completed' then 1
					else 0
				end as TotalComplete,
				
				/* Not flagging tasks as ER at this time */
				0 as TotalERComplete,
				
				/* Delay Task Flag exists in Source Data */
				Tasks.DelayTask as TotalDelayed,
				
				/* Not flagging tasks as Self-Dispatched at this time */
				0 as TotalSelfDispatched,
				
				/* stehirNode is not a value in Flow.  Using FacilityKey instead */
				Tasks.FacilityKey as stehirNode,
				
				/* Total Unassigned Time in seconds for Completed Tasks */
				case
					when Tasks.TaskStatus = 'Completed' then cast(Tasks.UnassignedTimeSecs as int)
					else 0
				end as TotalUnassignedTime
				

			FROM FLOW_DB_IMPORT.bi.Tasks Tasks with (nolock)
			INNER JOIN FLOW_DW_DB.dm.dimFacilities Fac with (nolock)
				ON Tasks.FacilityKey = Fac.FacilityKey
			INNER JOIN FLOW_DW_DB.dm.dimFunctionalAreas FA with (nolock)
				ON Tasks.FunctionalAreaKey = FA.FunctionalAreaKey
				
			/* Get the ULED Week Ending Value and Fiscal Information from the ULEDFiscalWeeks table by joining on the Request Date */
			INNER JOIN FLOW_ULED.dbo.ULEDFiscalWeeks UW with (nolock)
				ON (case
						when Tasks.ScheduleDateKey <> -1 then 
							cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
						else
							cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
					end) = UW.ULEDDay
					
			/* Join the Temporary view dm.FacilityFuncAreaHouseCode to get the HouseCode information back */
			INNER JOIN FLOW_DW_DB.[dm].[FacilityFuncAreaHouseCode] HC with (nolock)
				ON (Tasks.FacilityKey = HC.FacilityKey) AND (Tasks.FunctionalAreaKey = HC.FunctionalAreaKey)
			where Tasks.FunctionalAreaKey=2
		) EVSULED
	
	/* Prevent Duplicate Data Insert */
	WHERE not exists (select * from FLOW_ULED.[dbo].[EVSULEDDetails] with (nolock) 
					  where taskkey = EVSULED.TaskKey and TaskSource=EVSULED.TaskSource)


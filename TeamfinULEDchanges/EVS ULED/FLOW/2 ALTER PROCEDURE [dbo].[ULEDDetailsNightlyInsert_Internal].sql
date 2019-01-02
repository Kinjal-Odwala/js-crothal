USE [FLOW_ULED]
GO
/****** Object:  StoredProcedure [dbo].[ULEDDetailsNightlyInsert_Internal]    Script Date: 7/9/2018 6:13:45 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[ULEDDetailsNightlyInsert_Internal]
AS

/*
Description:	Nightly Job that checks FLOW_DW_DB.dm.FactTasks for new records and converts and copies those to FLOW_ULED.dbo.ULEDDetails table

Date		Author				Notes
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
2016-10-13	Michael Jacobi		Created Script for Job
2016-10-14	Michael Jacobi		Updated TaskKey to be a concatenated column
2017-11-06	Michael Jacobi		Added the RTA15 and RTC35 metrics
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
				cast(concat(Fac.FacilityKey,Tasks.RequestDateKey,Tasks.RequestKey) as bigint) as TaskKey,
				Locs.FacilityKey,
				Tasks.FunctionalAreaKey,
				'TeamFlow' as TaskSource,
				TaskClasses.TaskClassName as TaskClass,
				TaskStatuses.TaskStatusDesc as TaskStatus,
				Tasks.Batchkey,
				Tasks.ShiftKey,

				cast(HC.[House Code] as varchar(16)) as HouseCode,
				cast(Fac.FacilityTitle as varchar(64)) as FacilityName,
				cast(FA.FunctionalAreaName as varchar(50)) as FunctionalArea,
				cast(UW.FscYeaTitle as varchar(64)) as Fiscal_Year,
				cast(UW.FscPerTitle as int) as Fiscal_Period,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduledTaskFlag = 1 then
						cast(datepart(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Month,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduledTaskFlag = 1 then
						cast(datepart(yyyy,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(yyyy,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Year,
				
				case
					when Tasks.ScheduledTaskFlag = 1 then
						cast(concat(datename(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
					else
						cast(concat(datename(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
				end as Period,
				
				/* Determine to use Request Date or Schedule Date */
				case
					when Tasks.ScheduledTaskFlag = 1 then 
						cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
					else
						cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
				end	as RequestDate,
				
				/* Joined the ULED Weeks temp table to get the Week Ending Date */
				UW.ULEDWeekEnding as ULEDWeekEnding,
				
				/* Flag task as a schedule completed task if the task status is set to completed and the scheduled task flag is set */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 1 then 1
					else 0
				end as TotalScheduledComplete,
				
				/* Flag task as scheduled and arrived on time if the task status is completed, the scheduled task flag is set, and the on time flag is set */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 1 and Tasks.OnTimeFlag = 1 then 1
					else 0
				end as TotalArrivedOnTimeTasks,
				
				/* Flag task as a demand completed task if the task status is set to completed and there is no schedule flag present */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 then 1
					else 0
				end as TotalDemandComplete,
				
				/* Flag task as RTAU10 if it is a demand completed task and RTATimeSecs is less than 601 secs or 10 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTATimeSecs as int) < 601 then 1
					else 0
				end as RTAU10,
				
				/* Flag task as RTA15 if it is a demand completed task and RTATimeSecs is less than 901 secs or 15 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTATimeSecs as int) < 901 then 1
					else 0
				end as RTA15,
				
				/* Flag task as RTC20 if it is a demand completed task and RTCTimeSecs is less than 1201 secs or 20 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTCTimeSecs as int) < 1201 then 1
					else 0
				end as RTC20,
				
				/* Flag task as DTC20 if it is a demand completed task and DTCTimeSecs is less than 1201 secs or 20 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.DTCTimeSecs as int) < 1201 then 1
					else 0
				end as DTC20,
				
				/* Flag task as RTC20 if it is a demand completed task and RTCTimeSecs is less than 1801 secs or 30 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTCTimeSecs as int) < 1801 then 1
					else 0
				end as RTC30,
				
				/* Flag task as RTC35 if it is a demand completed task and RTCTimeSecs is less than 2101 secs or 35 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTCTimeSecs as int) < 2101 then 1
					else 0
				end as RTC35,
				
				/* Determine if task was cancelled based on status */
				case
					when TaskStatuses.TaskStatusDesc = 'Cancelled' then 1
					else 0
				end as TotalCancelled,
				
				/* Total Active Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalActiveTime,
				
				/* Total Assigned Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.AssignedTimeSecs as int)
					else 0
				end as TotalAssignedTime,
				
				/* Total Trip Time in seconds for Completed Tasks.  Measured as Unassigned Time + Assigned Time + Active Time */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then
						cast(Tasks.UnassignedTimeSecs as int) + cast(Tasks.AssignedTimeSecs as int) + cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalTripTime,
				
				/* Total Delayed Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.DelayTimeSecs as int)
					else 0
				end as TotalDelayTime,
				
				/* Total Completed Tasks as indicated by a task having a Task Status of 'Completed' */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then 1
					else 0
				end as TotalComplete,
				
				/* Total Comleted Tasks with a task Class that is flagged as an Emergency Room Task */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and TaskClasses.emergencyRoom = 1 then 1
					else 0
				end as TotalERComplete,
				
				/* Total Comleted Tasks with a task Class Name that has the word "Discharge" in it */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and TaskClasses.TaskClassName like '%Discharge%' then 1
					else 0
				end as TotalDischargesComplete,
				
				/* Delay Task Flag exists in Source Data */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and cast(Tasks.DelayTimeSecs as int) > 0 then 1
					else 0
				end as TotalDelayed,
				
				/* Total Completed Tasks with the Self-Dispatched Flag set */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.SelfDispatchFlag = 1 then 1
					else 0
				end as TotalSelfDispatched,
				
				/* stehirNode is not a value in Flow.  Using FacilityKey instead */
				Locs.FacilityKey as stehirNode,
				
				/* Total Unassigned Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.UnassignedTimeSecs as int)
					else 0
				end as TotalUnassignedTime


			FROM FLOW_DW_DB.[dm].[FactTasks] Tasks with (nolock)
			
			/* Get the Location Information, which also has the facility tie-in */
			INNER JOIN FLOW_DW_DB.[dm].[dimLocations] Locs with (nolock)
				ON Tasks.DestLocationKey = Locs.RoomKey
				
			/* Get the Facility Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimFacilities] Fac with (nolock)
				ON Locs.FacilityKey = Fac.FacilityKey
				
			/* Get the Functional Area Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimFunctionalAreas] FA with (nolock)
				ON Tasks.FunctionalAreaKey = FA.FunctionalAreaKey
				
			/* Get the Task Class Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimTaskClasses] TaskClasses with (nolock)
				ON Tasks.TaskClassKey = TaskClasses.TaskClassKey
				
			/* Get the Task Status Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimTaskStatus] TaskStatuses with (nolock)
				ON Tasks.TaskStatusKey = TaskStatuses.TaskStatusKey
			
			/* Get the ULED Week Ending Value and Fiscal Information from the ULEDFiscalWeeks table by joining on the Request Date */
			INNER JOIN FLOW_ULED.[dbo].[ULEDFiscalWeeks] UW with (nolock)
				ON (case
						when Tasks.ScheduleDateKey <> -1 then 
							cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
						else
							cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
					end) = UW.ULEDDay
					
			/* Join the Temporary view dm.FacilityFuncAreaHouseCode to get the HouseCode information back */
			INNER JOIN FLOW_DW_DB.[dm].[FacilityFuncAreaHouseCode] HC with (nolock)
				ON (Locs.FacilityKey = HC.FacilityKey) AND (Tasks.FunctionalAreaKey = HC.FunctionalAreaKey)

			----LEGACY
			/* Prevent inserting of duplicate data */
			--WHERE Tasks.RequestKey not in (select TaskKey from FLOW_ULED.[dbo].[ULEDDetails] with (nolock))



		) ULED
	
	
	/* Prevent inserting of duplicate data */
	WHERE ULED.TaskKey not in (select TaskKey from FLOW_ULED.[dbo].[ULEDDetails] with (nolock))
		
----------------------------ADDED FOR EVS ULED------------------RICHA--------2018/7/6-----START-----------

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
				[stehirNode],
				EVSULED.[TotalUnassignedTime],
				getdate() as [DetailsImportDate]
	FROM
		(

			/* Prepare External Data */
			SELECT
				cast(concat(Fac.FacilityKey,Tasks.RequestDateKey,Tasks.RequestKey) as bigint) as TaskKey,
				Locs.FacilityKey,
				Tasks.FunctionalAreaKey,
				'TeamFlow' as TaskSource,
				TaskClasses.TaskClassName as TaskClass,
				TaskStatuses.TaskStatusDesc as TaskStatus,
				Tasks.Batchkey,
				Tasks.ShiftKey,

				cast(HC.[House Code] as varchar(16)) as HouseCode,
				cast(Fac.FacilityTitle as varchar(64)) as FacilityName,
				cast(FA.FunctionalAreaName as varchar(50)) as FunctionalArea,
				cast(UW.FscYeaTitle as varchar(64)) as Fiscal_Year,
				cast(UW.FscPerTitle as int) as Fiscal_Period,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduledTaskFlag = 1 then
						cast(datepart(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Month,
				
				/* If a task is scheduled, use the schedule date, otherwise use the request date */
				case
					when Tasks.ScheduledTaskFlag = 1 then
						cast(datepart(yyyy,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)) as varchar(50))
					else
						cast(datepart(yyyy,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)) as varchar(50))
				end as Calendar_Year,
				
				case
					when Tasks.ScheduledTaskFlag = 1 then
						cast(concat(datename(mm,cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
					else
						cast(concat(datename(mm,cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)),' ',UW.FscYeaTitle) as varchar(50))
				end as Period,
				
				/* Determine to use Request Date or Schedule Date */
				case
					when Tasks.ScheduledTaskFlag = 1 then 
						cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
					else
						cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
				end	as RequestDate,
				
				/* Joined the ULED Weeks temp table to get the Week Ending Date */
				UW.ULEDWeekEnding as ULEDWeekEnding,
				
				/* Flag task as a schedule completed task if the task status is set to completed and the scheduled task flag is set */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 1 then 1
					else 0
				end as TotalScheduledComplete,
				
				/* Flag task as scheduled and arrived on time if the task status is completed, the scheduled task flag is set, and the on time flag is set */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 1 and Tasks.OnTimeFlag = 1 then 1
					else 0
				end as TotalArrivedOnTimeTasks,
				
				/* Flag task as a demand completed task if the task status is set to completed and there is no schedule flag present */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 then 1
					else 0
				end as TotalDemandComplete,
				
				/* Flag task as RTA30 if it is a demand completed task and RTATimeSecs is less than or equal to 1800 secs or 30 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTATimeSecs as int) <= 1800 then 1
					else 0
				end as RTA30,
				
				/* Flag task as RTC60 if it is a demand completed task and RTCTimeSecs is less than or equal to 3600 secs or 60 minutes */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.ScheduledTaskFlag = 0 and cast(Tasks.RTCTimeSecs as int) <= 3600 then 1
					else 0
				end as RTC60,
				
				/* Determine if task was cancelled based on status */
				case
					when TaskStatuses.TaskStatusDesc = 'Cancelled' then 1
					else 0
				end as TotalCancelled,
				
				/* Total Active Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalActiveTime,
				
				/* Total Assigned Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.AssignedTimeSecs as int)
					else 0
				end as TotalAssignedTime,
				
				/* Total Trip Time in seconds for Completed Tasks.  Measured as Unassigned Time + Assigned Time + Active Time */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then
						cast(Tasks.UnassignedTimeSecs as int) + cast(Tasks.AssignedTimeSecs as int) + cast(Tasks.ActiveTimeSecs as int)
					else 0
				end as TotalTripTime,
				
				/* Total Delayed Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.DelayTimeSecs as int)
					else 0
				end as TotalDelayTime,
				
				/* Total Completed Tasks as indicated by a task having a Task Status of 'Completed' */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then 1
					else 0
				end as TotalComplete,
				
				/* Total Comleted Tasks with a task Class that is flagged as an Emergency Room Task */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and TaskClasses.emergencyRoom = 1 then 1
					else 0
				end as TotalERComplete,
				
			
				/* Delay Task Flag exists in Source Data */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and cast(Tasks.DelayTimeSecs as int) > 0 then 1
					else 0
				end as TotalDelayed,
				
				/* Total Completed Tasks with the Self-Dispatched Flag set */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' and Tasks.SelfDispatchFlag = 1 then 1
					else 0
				end as TotalSelfDispatched,
				
				/* stehirNode is not a value in Flow.  Using FacilityKey instead */
				Locs.FacilityKey as stehirNode,
				
				/* Total Unassigned Time in seconds for Completed Tasks */
				case
					when TaskStatuses.TaskStatusDesc = 'Completed' then cast(Tasks.UnassignedTimeSecs as int)
					else 0
				end as TotalUnassignedTime

			FROM FLOW_DW_DB.[dm].[FactTasks] Tasks with (nolock)
			
			/* Get the Location Information, which also has the facility tie-in */
			INNER JOIN FLOW_DW_DB.[dm].[dimLocations] Locs with (nolock)
				ON Tasks.DestLocationKey = Locs.RoomKey
				
			/* Get the Facility Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimFacilities] Fac with (nolock)
				ON Locs.FacilityKey = Fac.FacilityKey
				
			/* Get the Functional Area Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimFunctionalAreas] FA with (nolock)
				ON Tasks.FunctionalAreaKey = FA.FunctionalAreaKey
				
			/* Get the Task Class Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimTaskClasses] TaskClasses with (nolock)
				ON Tasks.TaskClassKey = TaskClasses.TaskClassKey
				
			/* Get the Task Status Information */
			INNER JOIN FLOW_DW_DB.[dm].[dimTaskStatus] TaskStatuses with (nolock)
				ON Tasks.TaskStatusKey = TaskStatuses.TaskStatusKey
			
			/* Get the ULED Week Ending Value and Fiscal Information from the ULEDFiscalWeeks table by joining on the Request Date */
			INNER JOIN FLOW_ULED.[dbo].[ULEDFiscalWeeks] UW with (nolock)
				ON (case
						when Tasks.ScheduleDateKey <> -1 then 
							cast(concat(Tasks.ScheduleDateKey,' 00:00:00.000') as datetime)
						else
							cast(concat(Tasks.RequestDateKey,' 00:00:00.000') as datetime)
					end) = UW.ULEDDay
					
			/* Join the Temporary view dm.FacilityFuncAreaHouseCode to get the HouseCode information back */
			INNER JOIN FLOW_DW_DB.[dm].[FacilityFuncAreaHouseCode] HC with (nolock)
				ON (Locs.FacilityKey = HC.FacilityKey) AND (Tasks.FunctionalAreaKey = HC.FunctionalAreaKey)

			where tasks.functionalareakey=2
			----LEGACY
			/* Prevent inserting of duplicate data */
			--WHERE Tasks.RequestKey not in (select TaskKey from FLOW_ULED.[dbo].[ULEDDetails] with (nolock))

		) EVSULED
	
	
	/* Prevent Duplicate Data Insert */
	WHERE not exists (select * from FLOW_ULED.[dbo].[EVSULEDDetails] with (nolock) 
					  where taskkey = EVSULED.TaskKey and TaskSource=EVSULED.TaskSource)
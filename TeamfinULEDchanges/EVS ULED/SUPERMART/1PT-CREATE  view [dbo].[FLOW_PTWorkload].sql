USE [SuperMart]
GO

/****** Object:  View [dbo].[FLOW_PTWorkload]    Script Date: 8/2/2018 12:05:09 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE  view [dbo].[FLOW_PTWorkload] as

select  
A.Hours, 
A.TaskTime, 
--A.tskTaskClass, 
A.TaskClass, 
count(*) as count, 
A.HH,
A.Receipt,
A.Hirnode, 
A.Facility,
A.StartLocation,
A.DestLocation
From
(
	SELECT  
	case when task.ScheduleTimekey = -1 and task.requestTimekey between 0 and 5959 then '12 AM'
	when task.ScheduleTimekey > -1 and task.scheduleTimekey between 0 and 5959 then '12 AM'
	
	when task.ScheduleTimekey = -1 and task.requestTimekey between 10000 and 115959 then convert(varchar,task.requestTimekey/10000) + ' AM'
	when task.ScheduleTimekey > -1 and task.scheduleTimekey between 10000 and 115959 then convert(varchar,task.scheduleTimekey/10000) + ' AM'
	
	when task.ScheduleTimekey = -1 and task.requestTimekey between 120000 and 125959 then convert(varchar,task.requestTimekey/10000) + ' PM'
	when task.ScheduleTimekey > -1 and task.scheduleTimekey between 120000 and 125959 then convert(varchar,task.scheduleTimekey/10000) + ' PM'
	
	when task.ScheduleTimekey = -1 and task.requestTimekey between 130000 and 235959 then convert(varchar,task.requestTimekey/10000-12) + ' PM'
	when task.ScheduleTimekey > -1 and task.ScheduleTimekey between 130000 and 235959 then convert(varchar,task.scheduleTimekey/10000-12) + ' PM' 
	end as 'Hours',

	DTCTimesecs/60 as TaskTime,
	--task.TaskClass as 'tskTaskClass',
	task.TaskClass as 'TaskClass',

	case when  task.scheduleTimekey = -1 then task.requestTimekey/10000
		 when  task.scheduleTimekey >-1 then task.scheduleTimekey/10000 
	end as HH,

	CONVERT (datetime,convert(char(8),case when task.scheduledatekey=-1 then task.requestdatekey else task.scheduledatekey end)) as 'Receipt',
	
	task.facilitykey as 'Hirnode', 
	fac.facilitytitle as 'Facility',
	task.StartLocationKey as 'StartLocation',
	task.DestLocationKey as 'DestLocation'
	
	FROM [CHIUSCHP3036VM\TEST].FLOW_DB_IMPORT.bi.tasks task WITH (NOLOCK) 
	INNER JOIN  [CHIUSCHP3036VM\TEST].FLOW_DB_IMPORT.bi.dimfacilities fac WITH (NOLOCK) ON 
	task.facilityKey = fac.facilityKey
	where functionalareakey=1
	)A
group by A.Hours,A.TaskTime,A.TaskClass,A.HH,
	 A.Receipt,A.Hirnode,A.Facility,A.StartLocation,A.DestLocation





GO



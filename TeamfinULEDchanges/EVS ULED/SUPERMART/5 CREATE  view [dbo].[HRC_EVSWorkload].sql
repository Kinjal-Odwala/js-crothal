USE [SuperMart]
GO

/****** Object:  View [dbo].[HRC_EVSWorkload]    Script Date: 7/17/2018 6:20:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE  view [dbo].[HRC_EVSWorkload] as

select  A.Hours, A.TaskTime, A.tskTaskClass, A.TaskClass, count(*) as count, A.HH,
A.Receipt,A.Hirnode, A.Facility,A.StartLocation,A.DestLocation
From
(
	SELECT  
	case when tskRequestEnvs.ScheduleTask = 0 and datepart(hh,tskRequestEnvs.requestdate) = 0 then '12 AM'
	when tskRequestEnvs.ScheduleTask = 1 and datepart(hh,tskRequestEnvs.scheduledate) = 0 then '12 AM'
	when tskRequestEnvs.ScheduleTask = 0 and datepart(hh,tskRequestEnvs.requestdate) = 12 then '12 PM'
	when tskRequestEnvs.ScheduleTask = 1 and datepart(hh,tskRequestEnvs.scheduledate) = 12 then '12 PM'	
	when tskRequestEnvs.ScheduleTask = 0 and datepart(hh,tskRequestEnvs.requestdate) < 12 then 
	convert(varchar(2),datepart(hh,tskRequestEnvs.requestdate))+ ' AM'
	when tskRequestEnvs.ScheduleTask = 1 and datepart(hh,tskRequestEnvs.scheduledate) < 12 then 
	convert(varchar(2),datepart(hh,tskRequestEnvs.scheduledate))+ ' AM'
	when tskRequestEnvs.ScheduleTask = 0 and datepart(hh,tskRequestEnvs.requestdate) > 12 then
	convert(varchar(2),datepart(hh,tskRequestEnvs.requestdate)-12) + ' PM'
	else convert(varchar(2),datepart(hh,tskRequestEnvs.scheduledate)-12) + ' PM' end as 'Hours',
	case when  tskRequestEnvs.ScheduleTask = 0 then datepart(hh,tskRequestEnvs.requestdate)
	when  tskRequestEnvs.ScheduleTask = 1 then datepart(hh,tskRequestEnvs.scheduledate) end as HH,
	DateDiff(mi,tskRequestEnvs.DispatchNeeded,tskRequestEnvs.CompleteNeeded) as TaskTime,
	tskRequestEnvs.tskTaskClass as 'tskTaskClass',tskTaskClasses.Brief as 'TaskClass',
	tskRequestEnvs.scheduledate as 'Receipt',
	tskRequestEnvs.steHirNode as 'Hirnode', 
	Hirnodes.Brief as 'Facility',
	tskRequestEnvs.hirStartLocationNode as 'StartLocation',
	tskRequestEnvs.hirDestLocationNode as 'DestLocation'
	FROM [CHIUSCHP397\HRC_REP].TT_REP.dbo.tskRequestEnvs WITH (NOLOCK) 
	INNER JOIN [CHIUSCHP397\HRC_REP].TT_REP.dbo.tskTaskClasses WITH (NOLOCK) ON 
	tskRequestEnvs.tskTaskClass = tskTaskClasses.steTaskClass 
	INNER JOIN  [CHIUSCHP397\HRC_REP].TT_REP.dbo.hirNodes WITH (NOLOCK) ON 
	tskRequestEnvs.steHirnode = hirnodes.hirNode
	INNER JOIN [CHIUSCHP397\HRC_REP].TT_REP.dbo.steManagement WITH (NOLOCK) ON
    steManagement.steHirNode = hirNodes.hirNode
	)A
group by A.Hours,A.TaskTime,A.tskTaskClass,A.TaskClass,A.HH,
	 A.Receipt,A.Hirnode,A.Facility,A.StartLocation,A.DestLocation



GO



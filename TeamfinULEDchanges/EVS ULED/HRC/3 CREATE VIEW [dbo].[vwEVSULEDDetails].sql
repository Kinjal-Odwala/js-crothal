USE [HRC_ULED]
GO

/****** Object:  View [dbo].[vwEVSULEDDetails]    Script Date: 8/7/2018 5:22:22 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO



CREATE VIEW [dbo].[vwEVSULEDDetails]  
AS  
SELECT
	EVS.tskRequestEnv as [TaskKey],
	EVS.stehirNode as [stehirNode],
	2 as [FunctionalAreaKey],
	'HRC' as [TaskSource],
	TskCls.Title as [TaskClass],
	TskStat.Title as [TaskStatus],
	Mgmt.EnvHouseCode as [HouseCode],
	hn.Title as [FacilityName],
	'Environmental' as [FunctionalArea],
	FW.FscYeaTitle as [Fiscal_Year],
	FW.FscPerTitle as [Fiscal_Period],
	datepart(mm,EVS.ScheduleDate) as [Calendar_Month],
	datepart(yyyy,EVS.ScheduleDate) as [Calendar_Year],
	(datename(mm,EVS.ScheduleDate) + ' ' + FW.FscYeaTitle) as [Period],
	CAST(CAST( EVS.ScheduleDate AS DATE) AS DATETIME) as [RequestDate],  --Floor the date for grouping later
	FW.ULEDWeekEnding as [ULEDWeekEnding],
	
	/* Task was a completed scheduled task */
	case
		when
			EVS.ScheduleDate is not null
			and EVS.ScheduleTask = 1
			and EVS.tskStatusType = 5
		then 1
		else 0
	end as [TotalScheduledComplete],
	
	/* Task is a scheduled tasks that was completed on time */
	case
		when
			EVS.tskStatusType = 5
			and EVS.ScheduleDate is not null
			and EVS.ScheduleTask = 1
			and EVS.ScheduleDate < (EVS.ScheduleDate + 730) --Limits the procedure from looking at tasks more than 2 years out
			and EVS.CloseDate <= EVS.ScheduleDate
		then 1
		else 0
	end as [TotalArrivedOnTimeTasks],
	
	/* Task is a demand completed trip */
	case
		when
			EVS.RequestDate is not null
			and EVS.ScheduleTask = 0
			and EVS.tskStatusType = 5
		then 1
		else 0
	end as [TotalDemandComplete],
	
	/* Task receipt to arrival was 30 minutes or less */
	case
		when
			DATEDIFF(mi,EVS.RequestDate,EVS.ActiveDate) <= 30
			and EVS.ScheduleTask = 0	
			and EVS.tskStatusType in (3,4,5) 
			and EVS.ActiveDate IS NOT NULL
		then 1							
		else 0
	end as [RTA30],
	
	/* Task had receipt to complete was 60 minutes or less */
	case
		when
			DATEDIFF(mi,EVS.RequestDate,EVS.CloseDate) <= 60
			and EVS.ScheduleTask = 0
			and EVS.tskStatusType = 5
		then 1
		else 0
	end as [RTC60],
	
	/* Cancelled task */
	case
		when
			EVS.tskStatusType = 6
		then 1
		else 0
	end as [TotalCancelled],
	
	/* Amount of active time for completed tasks */
	case
		when
			EVSTots.ActiveTime is not null
			and EVS.tskStatusType = 5
		then EVSTots.ActiveTime
		else 0
	end as [TotalActiveTime],
	
	/* Amount of assigned time for completed tasks */
	case
		when
			EVSTots.AssignedTime is not null
			and EVS.tskStatusType = 5
		then EVSTots.AssignedTime
		else 0
	end as [TotalAssignedTime],
	
	/* Total amount of trip (active + assigned) time for completed tasks */
	case
		when
			EVSTots.AssignedTime is not null
			and EVSTots.ActiveTime is not null
			and EVS.tskStatusType = 5
			and EVS.scheduletask = 0
		then
			EVSTots.ResponseTime
			+ EVSTots.ActiveTime
			+ EVSTots.DelayTime
		else 0
	end as [TotalTripTime],
	
	/* Total number of delayed minutes */
	case
		when
			EVS.tskStatusType in(5,6)
		then
			isnull(EVSTots.DelayTime,0)
	end as [TotalDelayTime],
	
	/* Completed Task */
	case
		when
			EVS.CloseDate is not null
			and EVS.tskStatusType = 5
		then 1
		else 0
	end as [TotalComplete],
	
	/* Completed ER task */
	case
		when
			EVS.RequestDate is not null
			and EVS.tskStatusType = 5
			and ER.Title is not null
		then 1
		else 0
	end as [TotalERComplete],
	
	/* Delayed Task */
	case
		when
			EVS.DelayDate is not null
			and EVS.tskStatusType = 5
		then 1
		else 0
	end as [TotalDelayed],
	
	/* Self-Dispatched Demand Task */
	case
		when
			EVS.RequestEnteredBy = Emp.Brief
			and EVS.AssignedEnteredBy is not null
			and EVS.tskStatusType = 5
			and EVS.ScheduleTask = 0
		then 1
		else 0
	end as [TotalSelfDispatched],
	
	/* Total unassigned time for demand completed task */
	case
		when
			EVSTots.UnassignedTime is not null
			and EVS.tskStatusType = 5
			and EVS.ScheduleTask = 0
			then EVSTots.UnassignedTime
		else 0
	end as [TotalUnassignedTime]
	
FROM [TT_REP].[dbo].[tskRequestEnvs] EVS with (nolock)
INNER JOIN [TT_REP].[dbo].[tskTaskClasses] TskCls with (nolock)
	ON EVS.tskTaskClass = TskCls.steTaskClass
INNER JOIN [TT_REP].[dbo].[tskStatusTypes] TskStat with (nolock)
	ON EVS.tskStatusType = TskStat.tskStatusType
INNER JOIN [TT_REP].[dbo].[steManagement] Mgmt with (nolock)
	ON EVS.stehirNode = Mgmt.steHirNode
INNER JOIN [TT_REP].[dbo].hirNodes hn with (nolock)
	ON EVS.stehirNode = hn.hirNode
INNER JOIN [HRC_ULED].[dbo].[ULEDFiscalWeeks] FW with (nolock)
	ON [TT_REP].dbo.svfFloorDate(EVS.ScheduleDate) = FW.ULEDDay
LEFT OUTER JOIN [HRC_ULED].[dbo].[vwEVSTaskTotalsSummary] EVSTots with (nolock)
	ON EVS.tskRequestEnv = EVSTots.tskRequestEnv
LEFT OUTER JOIN [HRC_ULED].[dbo].[vwEVSHRC_ERTasks] ER with (nolock)
	ON EVS.tskTaskClass = ER.steTaskClass
LEFT OUTER JOIN [TT_REP].[dbo].[steEmployees] Emp with (nolock)
	ON EVS.steHirNode = Emp.steHirNode
	AND EVS.RequestEnteredBy = Emp.Brief
	AND Emp.Active = 1
WHERE
	EVS.tskStatusType in (5,6)




GO



USE [HRC_ULED]
GO


SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO

ALTER VIEW [dbo].[vwULEDDetails]  
AS  

/*
Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This PT view will return the data needed to insert into the ULED Details table


Date		Author				Notes
---------------------------------------------------------------------------------------------------------------------------------------------------------
2017-03-27	Michael Jacobi		Created View
2017-06-05	Michael Jacobi		Updated the RequestDate field to use a floored version of the Request Date so that the data can be grouped by date
2017-06-06	Michael Jacobi		Updated the join with the vwPTTaskTotalsSummary from an INNER JOIN to a LEFT OUTER JOIN since cancelled tasks don't have
								records in the Task Totals Tables.
2017-11-06	Michael Jacobi		Added the RTA15 and RTC35 metrics
2018-09-25	Michael Jacobi		Updated the self-dispatch logic to include tasks originating from Plum Voice

*/


SELECT
	PT.tskRequestTran as [TaskKey],
	PT.stehirNode as [stehirNode],
	1 as [FunctionalAreaKey], --select FunctionalArea from [TT_REP].[dbo].[steFunctionalAreas] with (nolock) where Brief = 'TRAN'
	'HRC' as [TaskSource],
	TskCls.Title as [TaskClass],
	TskStat.Title as [TaskStatus],
	Mgmt.TranHouseCode as [HouseCode],
	hn.Title as [FacilityName],
	'Transportation' as [FunctionalArea],
	FW.FscYeaTitle as [Fiscal_Year],
	FW.FscPerTitle as [Fiscal_Period],
	datepart(mm,PT.ScheduleDate) as [Calendar_Month],
	datepart(yyyy,PT.ScheduleDate) as [Calendar_Year],
	(datename(mm,PT.ScheduleDate) + ' ' + FW.FscYeaTitle) as [Period],
	CAST(CAST( PT.ScheduleDate AS DATE) AS DATETIME) as [RequestDate],  --Floor the date for grouping later
	FW.ULEDWeekEnding as [ULEDWeekEnding],
	
	/* Task was a completed scheduled task */
	case
		when
			PT.ScheduleDate is not null
			and PT.ScheduleTask = 1
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [TotalScheduledComplete],
	
	/* Task is a scheduled tasks that was completed on time */
	case
		when
			PT.tskStatusType = 5
			and PT.ScheduleDate is not null
			and PT.ScheduleTask = 1
			and PT.ScheduleDate < (PT.ScheduleDate + 730) --Limits the procedure from looking at tasks more than 2 years out
			and PT.CloseDate <= PT.ScheduleDate
		then 1
		else 0
	end as [TotalArrivedOnTimeTasks],
	
	/* Task is a demand completed trip */
	case
		when
			PT.RequestDate is not null
			and PT.ScheduleTask = 0
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [TotalDemandComplete],
	
	/* Task had receipt to arrival was 10 minutes or less */
	case
		when
			DATEDIFF(mi,PT.RequestDate,PT.ActiveDate) <= 10 
			and PT.ScheduleTask = 0	
			and PT.tskStatusType in (3,4,5) 
			and PT.ActiveDate IS NOT NULL
		then 1							
		else 0
	end as [RTAU10],
	
	/* Task had receipt to arrival was 15 minutes or less */
	case
		when
			DATEDIFF(mi,PT.RequestDate,PT.ActiveDate) <= 15 
			and PT.ScheduleTask = 0	
			and PT.tskStatusType in (3,4,5) 
			and PT.ActiveDate IS NOT NULL
		then 1							
		else 0
	end as [RTA15],
	
	/* Task had receipt to complete was 20 minutes or less */
	case
		when
			DATEDIFF(mi,PT.RequestDate,PT.CloseDate) <= 20
			and PT.ScheduleTask = 0
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [RTC20],
	
	/* Demand Completed Taks where dispatch to complete was 20 minutes or less */
	case
		when
			DATEDIFF(mi,PT.AssignedDate,PT.CloseDate) <= 20
			and PT.ScheduleTask = 0
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [DTC20],
	
	/* Demand Completed Taks where receipt to complete was 30 minutes or less */
	case
		when
			DATEDIFF(mi,PT.RequestDate,PT.CloseDate) <= 30
			and PT.ScheduleTask = 0
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [RTC30],
	
	/* Demand Completed Taks where receipt to complete was 35 minutes or less */
	case
		when
			DATEDIFF(mi,PT.RequestDate,PT.CloseDate) <= 35
			and PT.ScheduleTask = 0
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [RTC35],
	
	/* Cancelled task */
	case
		when
			PT.tskStatusType = 6
		then 1
		else 0
	end as [TotalCancelled],
	
	/* Amount of active time for completed tasks */
	case
		when
			PTTots.ActiveTime is not null
			and PT.tskStatusType = 5
		then PTTots.ActiveTime
		else 0
	end as [TotalActiveTime],
	
	/* Amount of assigned time for completed tasks */
	case
		when
			PTTots.AssignedTime is not null
			and PT.tskStatusType = 5
		then PTTots.AssignedTime
		else 0
	end as [TotalAssignedTime],
	
	/* Total amount of trip (active + assigned) time for completed tasks */
	case
		when
			PTTots.AssignedTime is not null
			and PTTots.ActiveTime is not null
			and PT.tskStatusType = 5
			and PT.scheduletask = 0
		then
			PTTots.ResponseTime
			+ PTTots.ActiveTime
			+ PTTots.DelayTime
		else 0
	end as [TotalTripTime],
	
	/* Total number of delayed minutes */
	case
		when
			PT.tskStatusType in(5,6)
		then
			isnull(PTTots.DelayTime,0)
	end as [TotalDelayTime],
	
	/* Completed Task */
	case
		when
			PT.CloseDate is not null
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [TotalComplete],
	
	/* Completed ER task */
	case
		when
			PT.RequestDate is not null
			and PT.tskStatusType = 5
			and ER.Title is not null
		then 1
		else 0
	end as [TotalERComplete],
	
	/* Completed Discharge Task */
	case
		when
			TskCls.Title = 'Discharge Transport'
			and TskCls.steFunctionalArea = 1
			and PT.RequestDate is not null
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [TotalDischargesComplete],
	
	/* Delayed Task */
	case
		when
			PT.DelayDate is not null
			and PT.tskStatusType = 5
		then 1
		else 0
	end as [TotalDelayed],
	
	/* Self-Dispatched Demand Task */
	case
		when
			(PT.RequestEnteredBy = Emp.Brief OR PT.RequestEnteredBy = 'IVR Server')
			and PT.AssignedEnteredBy is not null
			and PT.tskStatusType = 5
			and PT.ScheduleTask = 0
		then 1
		else 0
	end as [TotalSelfDispatched],
	
	/* Total unassigned time for demand completed task */
	case
		when
			PTTots.UnassignedTime is not null
			and PT.tskStatusType = 5
			and PT.ScheduleTask = 0
			then PTTots.UnassignedTime
		else 0
	end as [TotalUnassignedTime]
	
FROM [TT_REP].[dbo].[tskRequestTrans] PT with (nolock)

INNER JOIN [TT_REP].[dbo].[tskTaskClasses] TskCls with (nolock)
	ON PT.tskTaskClass = TskCls.steTaskClass
INNER JOIN [TT_REP].[dbo].[tskStatusTypes] TskStat with (nolock)
	ON PT.tskStatusType = TskStat.tskStatusType
INNER JOIN [TT_REP].[dbo].[steManagement] Mgmt with (nolock)
	ON PT.stehirNode = Mgmt.steHirNode
INNER JOIN [TT_REP].[dbo].hirNodes hn with (nolock)
	ON PT.stehirNode = hn.hirNode
INNER JOIN [HRC_ULED].[dbo].[ULEDFiscalWeeks] FW with (nolock)
	ON [TT_REP].dbo.svfFloorDate(PT.ScheduleDate) = FW.ULEDDay
LEFT OUTER JOIN [HRC_ULED].[dbo].[vwPTTaskTotalsSummary] PTTots with (nolock)
	ON PT.tskRequestTran = PTTots.tskRequestTran
LEFT OUTER JOIN [HRC_ULED].[dbo].[vwHRC_ERTasks] ER with (nolock)
	ON PT.tskTaskClass = ER.steTaskClass
LEFT OUTER JOIN [TT_REP].[dbo].[steEmployees] Emp with (nolock)
	ON PT.steHirNode = Emp.steHirNode
	AND PT.RequestEnteredBy = Emp.Brief
	AND Emp.Active = 1
WHERE
	PT.tskStatusType in (5,6)


GO

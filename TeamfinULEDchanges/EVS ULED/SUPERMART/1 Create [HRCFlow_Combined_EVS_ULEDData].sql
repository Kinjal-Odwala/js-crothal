USE [SuperMart]
GO

/****** Object:  View [dbo].[HRCFlow_Combined_EVS_ULEDData]    Script Date: 7/9/2018 1:32:29 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO


CREATE View [dbo].[HRCFlow_Combined_EVS_ULEDData]
AS

	SELECT
		ISNULL(FLOWULED.[HouseCode], HRCULED.[HouseCode]) as [HouseCode],
		ISNULL(FLOWULED.[FacilityName], HRCULED.[FacilityName]) as [FacilityName],
		ISNULL(FLOWULED.[FunctionalArea], HRCULED.[FunctionalArea]) as [FunctionalArea],
		ISNULL(FLOWULED.[Fiscal_Year], HRCULED.[Fiscal_Year]) as [Fiscal_Year],
		ISNULL(FLOWULED.[Fiscal_Period], HRCULED.[Fiscal_Period]) as [Fiscal_Period],
		ISNULL(FLOWULED.[Calendar_Month], HRCULED.[Calendar_Month]) as [Calendar_Month],
		ISNULL(FLOWULED.[Calendar_Year], HRCULED.[Calendar_Year]) as [Calendar_Year],
		ISNULL(FLOWULED.[Period], HRCULED.[Period]) as [Period],
		ISNULL(FLOWULED.[RequestDate], HRCULED.[RequestDate]) as [RequestDate],
		ISNULL(FLOWULED.[ULEDWeekEnding], HRCULED.[ULEDWeekEnding]) as [ULEDWeekEnding],
		(ISNULL(FLOWULED.[TotalScheduledComplete],0) + ISNULL(HRCULED.[TotalScheduledComplete],0)) as [TotalScheduledComplete],
		(ISNULL(FLOWULED.[TotalArrivedOnTimeTasks],0) + ISNULL(HRCULED.[TotalArrivedOnTimeTasks],0)) as [TotalArrivedOnTimeTasks],
		(ISNULL(FLOWULED.[TotalDemandComplete],0) + ISNULL(HRCULED.[TotalDemandComplete],0)) as [TotalDemandComplete],
		(ISNULL(FLOWULED.[RTA30],0) + ISNULL(HRCULED.[RTA30],0)) as [RTA30],
		(ISNULL(FLOWULED.[RTC60],0) + ISNULL(HRCULED.[RTC60],0)) as [RTC60],
		(ISNULL(FLOWULED.[TotalCancelled],0) + ISNULL(HRCULED.[TotalCancelled],0)) as [TotalCancelled],
		(ISNULL(FLOWULED.[TotalActiveTime],0) + ISNULL(HRCULED.[TotalActiveTime],0)) as [TotalActiveTime],
		(ISNULL(FLOWULED.[TotalAssignedTime],0) + ISNULL(HRCULED.[TotalAssignedTime],0)) as [TotalAssignedTime],
		(ISNULL(FLOWULED.[TotalTripTime],0) + ISNULL(HRCULED.[TotalTripTime],0)) as [TotalTripTime],
		(ISNULL(FLOWULED.[TotalDelayTime],0) + ISNULL(HRCULED.[TotalDelayTime],0)) as [TotalDelayTime],
		(ISNULL(FLOWULED.[TotalComplete],0) + ISNULL(HRCULED.[TotalComplete],0)) as [TotalComplete],
		(ISNULL(FLOWULED.[TotalERComplete],0) + ISNULL(HRCULED.[TotalERComplete],0)) as [TotalERComplete],
		(ISNULL(FLOWULED.[TotalDelayed],0) + ISNULL(HRCULED.[TotalDelayed],0)) as [TotalDelayed],
		(ISNULL(FLOWULED.[TotalSelfDispatched],0) + ISNULL(HRCULED.[TotalSelfDispatched],0)) as [TotalSelfDispatched],
		ISNULL(FLOWULED.[stehirNode], HRCULED.[stehirNode]) as [stehirNode],
		(ISNULL(FLOWULED.[TotalUnassignedTime],0) + ISNULL(HRCULED.[TotalUnassignedTime],0)) as [TotalUnassignedTime]


	FROM [chiuschp3036vm\TEST].[FLOW_ULED].[dbo].[vwEVSULEDSummaryMinutes] FLOWULED WITH (NOLOCK)
	FULL OUTER JOIN [CHIUSCHP397\HRC_REP].HRC_ULED.[dbo].[vwEVSHRC_ULEDSummary] HRCULED WITH (nolock)
		ON FLOWULED.[HouseCode] = HRCULED.[HouseCode]
		AND FLOWULED.[RequestDate] = HRCULED.[RequestDate]
			

/*
Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This View will return combined EVS ULED from HRC and TeamFlow by HouseCode, Functional Area, or steHirNode


Date		Author				Notes
---------------------------------------------------------------------------------------------------------------------------------------------------------
2018/0709	Richa		Created View for EVS ULED Report Metrics
---------------------------------------------------------------------------------------------------------------------------------------------------------


	Current columns in order:
		
		Column Title				Description
		HouseCode					Facility HouseCode.
		FacilityName				Facility Name as listed in the TeamFlow appplication.
		FunctionalArea				Functional Area that the employee works in.  Options are "Environment", "Transportation", or "Others".
		Fiscal_Year					Fiscal Year
		Fiscal_Period				Fiscal Period
		Month						Calendar Month (integer value) that the data is from.
		Year						Calendar Year that the data is from.
		Period						Fiscal period that the data resides in.
		RequestDate					Request Date for all of the tasks included in the row.
		ULEDWeekEnding				The end date of the week for the data.
		TotalScheduledComplete		Total number of scheduled tasks that were completed.
		TotalArrivedOnTimeTasks		Total number of scheduled tasks that were completed on time.  On Time being tasks that were completed before their Scheduled Date.
		TotalDemandComplete			Total number of demand trips completed
		RTA30						Total number of demand tasks where receipt to arrival was 30 minutes or less
		RTC60						Total number of demand tasks where receipt to complete was 60 minutes or less
		TotalCancelled				Total number of cancelled tasks
		TotalActiveTime				Total amount of active time for completed tasks in minutes
		TotalAssignedTime			Total amount of assigned time for completed tasks in minutes
		TotalTripTime				Total amount of trip (active + assigned) time for completed tasks in minutes
		TotalDelayTime				Total number of delayed minutes
		TotalComplete				Total number of completed demand and scheduled tasks
		TotalERComplete				Total number of completed ER tasks
		TotalDischargesComplete		Total number of Completed Discharge Tasks
		TotalDelayed				Total number of Delayed Tasks
		TotalSelfDispatched			Total number of Self-Dispatched Demand Tasks
		steHirNode					HRC:		hirNode value of the facility.  Equates to a value from (select hirNode from hirNodes where hirlevel = 395) on CHIUSCHP341.
									TeamFlow:	FacilityKey value of the facility.

	Source Database:
						CHIUSCHP3024VM\PROD
						CHIUSCHP341.HRC_ULED
	Source Tables\Views:
						CHIUSCHP3024VM\PROD.dbo.vwULEDSummaryMinutes
						CHIUSCHP341.HRC_ULED.dbo.vwHRC_ULEDSummary
						
		
*/










GO



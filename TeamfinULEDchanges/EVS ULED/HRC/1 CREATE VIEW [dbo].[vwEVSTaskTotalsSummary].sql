USE [HRC_ULED]
GO
/****** Object:  View [dbo].[vwEVSTaskTotalsSummary]    Script Date: 7/6/2018 9:55:28 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER OFF
GO

CREATE VIEW [dbo].[vwEVSTaskTotalsSummary]  
AS  

	SELECT
		EVSTotals.tskRequestEnv,
		sum(EVSTotals.UnassignedTime) as UnassignedTime,
		sum(EVSTotals.AssignedTime) as AssignedTime,
		sum(EVSTotals.DelayTime) as DelayTime,
		sum(EVSTotals.ActiveTime) as ActiveTime,
		sum(EVSTotals.ResponseTime) as ResponseTime,
		sum(EVSTotals.TaskTime) as TaskTime
	FROM [TT_REP].[dbo].[tskRequestEnvTotals] EVSTotals with (nolock)
	GROUP BY EVSTotals.tskRequestEnv


GO



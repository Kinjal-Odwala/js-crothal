USE [TeamFinv2]
GO

/****** Object:  View [dbo].[vw_rptEVSULED_AtAGlance]    Script Date: 9/7/2018 10:35:03 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER OFF
GO



ALTER VIEW [dbo].[vw_rptEVSULED_AtAGlance]  
AS  

/*

Report Name:  TeamFin_EVS_ULED
Dataset:  AtAGlance

Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This view returns the data used by the At a Glance Section of the TeamFin EVS ULED

*/


SELECT
	hn.HirNodLevel8 AS SiteName,
	au.AppUniBrief as HouseCode,
	au.hirNode as HirNode,
	hc.HcmHouseCode,
	fy.FscYeaTitle as FscYear,
	fp.FscPerTitle as FscPeriod,
	fp.FscPerStartDate,
	fp.FscPerEndDate,
	datediff(day,fp.FscPerStartDate,fp.FscPerEndDate) as NoOfDaysInPeriod,
	EVS.TotalDemandComplete,
	EVS.RTA30,
	EVS.RTC60,
	EVS.[TotalUnassignedTime],
	EVS.[TotalAssignedTime],
	EVS.[TotalActiveTime],
	EVS.TotalTripTime,
	EVS.TotalComplete,
	Sqft.NumMetricValue as TeamFin_SquareFeet,
	PfteActuals.NumMetricValue as TeamFin_ProductiveFTEActuals,
	HouseKeepingActuals.NumMetricValue as TeamFin_TotalHousekeepingExpense,
	APD.NumMetricValue as TeamFin_NumofAdjustedPatientDays,
	--Get Task Tracking System 'Y' = Non-Teletracking and 'N' = Teletracking
	case
		when PTEVS.HcmPTTaskManagementSystem = 5 then 'N' -- Teletracking
		else 'Y'
	end as TaskTrackingInHouse,
	PTEVS.[HcmEvsmVacantPositions] as TeamFin_VacantPositions
FROM /* Metric details from TeamFin for Net Cleanable Square Feet */
    TeamfinV2.[dbo].[vw_rptEVSULEDMetricDetails] Sqft
	
/* Join in the ESM hierarchy and TeamFin hcmHouseCode information */
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc WITH (NOLOCK)
	ON Sqft.HcmHouseCode= hc.HcmHouseCode
INNER JOIN Esmv2..AppUnits au WITH (NOLOCK)
	ON au.AppUnit = hc.AppUnit --
INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK)
	ON au.HirNode = hn.HirNode


/* Join in the TeamFin FSC Year and Period information */
INNER JOIN TeamFinv2.dbo.FscYears fy WITH (NOLOCK)
	ON fy.FscYear = Sqft.FscYear --EVS.Fiscal_Year
INNER JOIN TeamFinv2.dbo.FscPeriods fp WITH (NOLOCK)
	ON fp.fscYear = fy.FscYear
	AND fp.FscPerTitle = Sqft.FscPeriodTitle

/* Join the master EVS Metrics table */
INNER JOIN TeamFinv2.dbo.HcmEVSMetrics PTEVS WITH (NOLOCK)
	ON PTEVS.HcmHouseCode = hc.HcmHouseCode
	AND PTEVS.FscYear = fy.FscYear
	
	
/* Join in the metric details from TeamFin for Productive FTE Actuals */
LEFT OUTER JOIN TeamfinV2.[dbo].[vw_rptEVSULEDMetricDetails] PfteActuals
	ON PfteActuals.HcmHouseCode = hc.HcmHouseCode
	AND PfteActuals.FscYear = fy.FscYear
	AND PfteActuals.SourceDetailTable = 'Numeric'
	AND PfteActuals.HcmEVSMetricType = 20 --Productive Actual Hours (Labor Control)
	AND PfteActuals.FscPeriodTitle = Sqft.FscPeriodTitle  --EVS.Fiscal_Period
	
/* Join in the metric details from TeamFin for Hospital Financial Actuals */
LEFT OUTER JOIN TeamfinV2.[dbo].[vw_rptEVSULEDMetricDetails] HouseKeepingActuals
	ON HouseKeepingActuals.HcmHouseCode = hc.HcmHouseCode
	AND HouseKeepingActuals.FscYear = fy.FscYear
	AND HouseKeepingActuals.SourceDetailTable = 'Numeric'
	AND HouseKeepingActuals.HcmEVSMetricType = 55 --Hospital Financial Actuals(EVS statistics)
	AND HouseKeepingActuals.FscPeriodTitle = Sqft.FscPeriodTitle  --EVS.Fiscal_Period

/* Join in the metric details from TeamFin for # of Adjusted Patient Days */
LEFT OUTER JOIN TeamfinV2.[dbo].[vw_rptEVSULEDMetricDetails] APD
	ON APD.HcmHouseCode = hc.HcmHouseCode
	AND APD.FscYear = fy.FscYear
	AND APD.SourceDetailTable = 'Numeric'
	AND APD.HcmEVSMetricType = 45 -- # of Adjusted Patient Days(EVS statistics)
	AND APD.FscPeriodTitle = Sqft.FscPeriodTitle  --EVS.Fiscal_Period
	
LEFT OUTER JOIN SuperMart.[dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary] EVS with (nolock)
	ON  EVS.Fiscal_Period = Sqft.FscPeriodTitle
	AND EVS.HouseCode=au.appunibrief
	AND EVS.Fiscal_Year = fy.FscYeaTitle
	
WHERE Sqft.SourceDetailTable = 'Numeric'
	AND Sqft.HcmEVSMetricType = 50 --Net Cleanable Square Feet(EVS statistics)
	AND Sqft.HcmHouseCode = hc.HcmHouseCode
	AND Sqft.FscYear = fy.FscYear
	
GO



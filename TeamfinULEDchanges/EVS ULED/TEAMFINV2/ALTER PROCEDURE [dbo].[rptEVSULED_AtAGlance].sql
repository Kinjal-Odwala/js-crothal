USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_AtAGlance]    Script Date: 9/10/2018 12:06:08 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[rptEVSULED_AtAGlance]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
)
AS


/*

Report Name:  TeamFin_EVS_ULED
Dataset:  AtAGlance

Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This stored procedure returns the data used by the At a Glance Section of the TeamFin EVS ULED

exec [rptEVSULED_AtAGlance] @NUserId = 'compass-usa\jacobm03', @NLevel = 'SiteName',
	@NName = '1802 Westchester PT', @NFscYear = 9, @NFscPeriod = 103
--TESTING PARAMETERS

DECLARE @NUserID varchar(50)
DECLARE @NLevel varchar(20)
DECLARE @NName varchar(8000)
DECLARE @NFscYear INT
DECLARE @NFscPeriod INT
DECLARE @NMetricSelection INT

SET @NUserID = 'compass-usa\jacobm03'
SET @NLevel = 'SiteName'
SET @NName = '1802 Westchester PT'
SET @NFscYear = 9		--FY2018
SET @NFscPeriod = 103	--Period 1
SET @NMetricSelection = 1
*/



SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED


/* Recreate Parameters to prevent parameter sniffing */
	DECLARE @NNUserID varchar(50)
	DECLARE @NNLevel varchar(20)
	DECLARE @NNName varchar(8000)
	DECLARE @NNFscYear INT
	DECLARE @NNFscPeriod INT
--	DECLARE @NNMetricSelection INT

	SET @NNUserID = @NUserID
	SET @NNLevel = @NLevel
	SET @NNName = @NName
	SET @NNFscYear = @NFscYear
	SET @NNFscPeriod = @NFscPeriod
--	SET @NNMetricSelection = @NMetricSelection

/* Create and set new parameters needed */
	DECLARE @FscPerTitle INT
	SELECT @FscPerTitle = FscPerTitle FROM TeamFinv2..FscPeriods WHERE [FscPeriod] = @NNFscPeriod

	DECLARE @CurrentPeriodTitle INT
	DECLARE @CurrentYearTitle INT
	DECLARE @PriorFscYear INT
	DECLARE @PriorYearTitle INT

	SET @CurrentPeriodTitle = (Select FscPerTitle from TeamfinV2.dbo.FscPeriods where FscPeriod = @NNFscPeriod)
	SET @CurrentYearTitle = (Select FscYeaTitle from TeamfinV2.dbo.FscYears where FscYear = @NNFscYear)
	SET @PriorFscYear = @NNFscYear - 1
	SET @PriorYearTitle = @CurrentYearTitle - 1


/* Build out the hierarchy */
	CREATE TABLE #Hierarchy
		(
		   ENT VARCHAR(64),
		   SVP VARCHAR(64),
		   DVP VARCHAR(64),
		   RVP VARCHAR(64),
		   SRM VARCHAR(64),
		   RM VARCHAR(64),
		   AM VARCHAR(64),
		   SiteName VARCHAR(64),
		   HouseCode VARCHAR(16),
		   HirNode INT
		)
	INSERT INTO #Hierarchy 
		(
		   ENT,
		   SVP,
		   DVP,
		   RVP,
		   SRM,
		   RM,
		   AM,
		   SiteName,
		   HouseCode,
		   HirNode
		)

		SELECT
			hn.HirNodLevel1 AS ENT,
			hn.HirNodLevel2 AS SVP,
			hn.HirNodLevel3 AS DVP,
			hn.HirNodLevel4 AS RVP,
			hn.HirNodLevel5 AS SRM,
			hn.HirNodLevel6 AS RM,
			hn.HirNodLevel7 AS AM,
			hn.HirNodLevel8 AS SiteName,
			u.AppUniBrief AS HouseCode,
			u.HirNode
		FROM Esmv2.dbo.AppUserHouseCodesSelectFunction(@NNUserID) u 
			INNER JOIN Esmv2.dbo.HirNodes hn
				ON u.HirNode = hn.HirNode
		WHERE 
			(
				CASE @NNLevel 
					WHEN 'ENT' THEN hn.HirNodLevel1  
					WHEN 'SVP' THEN hn.HirNodLevel2 
					WHEN 'DVP' THEN hn.HirNodLevel3 
					WHEN 'RVP' THEN hn.HirNodLevel4 
					WHEN 'SRM' THEN hn.HirNodLevel5 
					WHEN 'RM' THEN hn.HirNodLevel6
					WHEN 'AM' THEN hn.HirNodLevel7  
					WHEN 'SiteName' THEN hn.HirNodLevel8
					ELSE ''
				END
			) IN (@NNName)
		ORDER BY
			hn.HirNodLevel1,
			hn.HirNodLevel2,
			hn.HirNodLevel3,
			hn.HirNodLevel4,
			hn.HirNodLevel5,
			hn.HirNodLevel6,
			hn.HirNodLevel7,
			hn.HirNodLevel8,
			u.AppUniBrief,
			u.HirNode


/* Create HouseCode and Period Table for dummy data insert of all periods after current period */
	DECLARE @HousePeriodTable TABLE
		(
			SiteName VARCHAR(64) NOT NULL,
			HouseCode VARCHAR(16) NOT NULL,
			HirNode [int] NOT NULL,
			FscYear  [int] NOT NULL,
			FscYeaTitle [int] NOT NULL,
			FscPeriod [int] NOT NULL,
			FscPerTitle [int] NOT NULL
			PRIMARY KEY (SiteName,HouseCode,HirNode, FscYear, FscYeaTitle,FscPeriod,FscPerTitle)
		) 

	INSERT INTO @HousePeriodTable
		SELECT
			hg.SiteName as SiteName,
			hg.HouseCode AS HouseCode,
			hg.HirNode AS HirNode,
			fp.FscYear AS FscYear,
			fy.FscYeaTitle AS FscYeaTitle,
			fp.FscPeriod AS FscPeriod,
			fp.FscPerTitle AS FscPerTitle
		FROM #Hierarchy hg
		INNER JOIN dbo.FscPeriods fp
			ON fp.FscYear = @NNFscYear
		INNER JOIN dbo.FscYears fy
			ON fy.FscYear = fp.FscYear
		WHERE fp.FscPeriod > @NNFscPeriod --select all future periods in the fiscal year
		ORDER BY
			hg.SiteName,
			hg.HouseCode,
			hg.HirNode,
			fp.FscYear DESC,
			fp.FscPeriod DESC, 
			fp.FscPerTitle DESC
			
		
/* Select combined dataset from actuals and dummy data */
SELECT
	AtAGlance.*
FROM (		

/* Return At a Glance Data */
	SELECT
		grp.SiteName,
		grp.HouseCode,
		grp.HirNode,
		grp.FscYear,
		grp.FscPeriod,
		grp.NoOfDaysinPeriod,
		grp.TotalDemandComplete,
		grp.RTA30,
		grp.RTC60,
		grp.[TotalUnassignedTime],
		grp.[TotalAssignedTime],
		grp.[TotalActiveTime],
		grp.TotalTripTime,
		grp.TotalComplete,
		grp.[TeamFin_SquareFeet],
		grp.[TeamFin_ProductiveFTEActuals],
		grp.[TeamFin_TotalHousekeepingExpense],
		grp.[TeamFin_NumofAdjustedPatientDays],
		grp.[TaskTrackingInHouse],
		grp.[TeamFin_VacantPositions],
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		
		---------------- Indicators for the gauges 

		-- RTA30 Indicator
		dbo.GetEVSULEDThresholdIndicatorYR(1,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.RTA30 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as RTA30Indc,
		

		
		-- RTC 60 Indicator
		dbo.GetEVSULEDThresholdIndicatorYR(2,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.RTC60 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as RTC60Indc,

		-- Turnaround Time Indicator
		dbo.GetEVSULEDThresholdIndicatorYR(3,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.TotalTripTime as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,2)))
			END, @NNFscYear, grp.TaskTrackingInHouse, 0)
		as TurnaroundTimeIndc,
		
		-- SqFtProdHours Indicator
		dbo.GetEVSULEDThresholdIndicatorYR(4,
			CASE
				WHEN isnull(grp.[TeamFin_ProductiveFTEActuals],0) = 0 OR isnull(grp.[TeamFin_SquareFeet],0) = 0
					THEN 0
				ELSE cast((cast(grp.[TeamFin_SquareFeet] as decimal(18,2))*365) 
						   /(cast(grp.[TeamFin_ProductiveFTEActuals] as decimal(18,2))) as decimal(18,2))
			END, @NNFscYear, grp.TaskTrackingInHouse, 0) 
		as SqFtProdHoursIndc,
		
		-- CostperAPD Indicator
		dbo.GetEVSULEDThresholdIndicatorYR(5,
		CASE
			WHEN isnull(grp.[TeamFin_NumofAdjustedPatientDays],0) = 0 OR isnull(grp.[TeamFin_TotalHousekeepingExpense],0) = 0
				THEN 0
			ELSE cast(cast(grp.[TeamFin_TotalHousekeepingExpense] as decimal(18,2)) / cast(grp.[TeamFin_NumofAdjustedPatientDays] as decimal(18,2))  as decimal(18,2))
			END, @NNFscYear, grp.TaskTrackingInHouse, 0)  
		as CostperAPDIndc,
		
		
		-- Productive Hours Worked per APD
		dbo.GetEVSULEDThresholdIndicatorYR(6,
		CASE
			WHEN isnull(grp.[TeamFin_NumofAdjustedPatientDays],0) = 0 OR isnull(grp.[TeamFin_ProductiveFTEActuals],0) = 0
				THEN 0
			ELSE cast((cast(grp.[TeamFin_ProductiveFTEActuals] as decimal(18,2)))/ cast(grp.[TeamFin_NumofAdjustedPatientDays] as decimal(18,2))  as decimal(18,2))
			END, @NNFscYear, grp.TaskTrackingInHouse, 0)    
		as ProdHoursAPDIndc,
		

		-- #ofvacancies Indicator
		dbo.GetEVSULEDThresholdIndicatorYR(7,grp.[TeamFin_VacantPositions], @NNFscYear, grp.TaskTrackingInHouse, 0)    
		as NumofVacanciesIndc,
		
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		
		-- RTA30 Percentage
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			ELSE
				cast(cast(grp.RTA30 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
		END as RTA30MinPct,

		-- RTC60 Percentage
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			ELSE
				 cast(cast(grp.RTC60 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
			END as RTC60MinPct,
		
		
		-- Square Feet per Productive Man Hour
		CASE
			WHEN isnull(grp.[TeamFin_ProductiveFTEActuals],0) = 0 OR isnull(grp.[TeamFin_SquareFeet],0) = 0
				THEN 0
			ELSE cast((cast(grp.[TeamFin_SquareFeet] as decimal(18,2))*365) /(cast(grp.[TeamFin_ProductiveFTEActuals] as decimal(18,2))) as decimal(18,2))
		END as SqFtProdHours,


		-- Cost per APD
		CASE
			WHEN isnull(grp.[TeamFin_NumofAdjustedPatientDays],0) = 0 OR isnull(grp.[TeamFin_TotalHousekeepingExpense],0) = 0
				THEN 0
			ELSE cast(cast(grp.[TeamFin_TotalHousekeepingExpense] as decimal(18,2)) / cast(grp.[TeamFin_NumofAdjustedPatientDays] as decimal(18,2))  as decimal(18,2))
		END  as CostperAPD,
		
		
		-- Productive Hours Worked per APD

		CASE
			WHEN isnull(grp.[TeamFin_NumofAdjustedPatientDays],0) = 0 OR isnull(grp.[TeamFin_ProductiveFTEActuals],0) = 0
				THEN 0
			ELSE cast((cast(grp.[TeamFin_ProductiveFTEActuals] as decimal(18,2)))/ cast(grp.[TeamFin_NumofAdjustedPatientDays] as decimal(18,2))  as decimal(18,2))
		END  as ProdHoursAPD,
		

		-- Turnaround Time
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalTripTime as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,2))
		END as TurnaroundTime
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		
	FROM [TeamFinv2].[dbo].[vw_rptEVSULED_AtAGlance] grp
	INNER JOIN Esmv2..AppUnits au WITH (NOLOCK)
		ON au.AppUniBrief = grp.HouseCode
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK)
		ON au.HirNode = hn.HirNode
	WHERE
		grp.FscYear = @CurrentYearTitle
		AND grp.FscPeriod <= @CurrentPeriodTitle
		AND
			(
				CASE @NNLevel 
					WHEN 'ENT' THEN hn.HirNodLevel1
					WHEN 'SVP' THEN hn.HirNodLevel2
					WHEN 'DVP' THEN hn.HirNodLevel3
					WHEN 'RVP' THEN hn.HirNodLevel4
					WHEN 'SRM' THEN hn.HirNodLevel5
					WHEN 'RM' THEN hn.HirNodLevel6
					WHEN 'AM' THEN hn.HirNodLevel7
					WHEN 'SiteName' THEN hn.HirNodLevel8
					ELSE ''
				END
			) IN (@NNName)
		AND grp.HouseCode IN (SELECT HouseCode FROM #Hierarchy)
	--ORDER BY
		--grp.FscYear,
		--grp.FscPeriod
	
	
	/* Combine with dummy data for remaining fiscal periods */
	UNION
	
	SELECT
		hpt.SiteName AS SiteName, 
		hpt.HouseCode AS HouseCode,
		hpt.HirNode AS HirNode,
		hpt.FscYeaTitle AS FscYear,
		hpt.FscPerTitle AS FscPeriod,
		0 as NoOfDaysinPeriod,
		0 as TotalDemandComplete,
		0 as RTA30,
		0 as RTC60,
		0 as [TotalUnassignedTime],
		0 as [TotalAssignedTime],
		0 as [TotalActiveTime],
		0 as TotalTripTime,
		0 as TotalComplete,
		0 as [TeamFin_SquareFeet],
		0 as [TeamFin_ProductiveFTEActuals],
		0 as [TeamFin_TotalHousekeepingExpense],
		0 as [TeamFin_NumofAdjustedPatientDays],
		NULL as [TaskTrackingInHouse],
		0 as [TeamFin_VacantPositions],
		0 as RTA30Indc,
		0 as RTC60Indc,
		0 as TurnaroundTimeIndc,
		0 as SqFtProdHoursIndc,
		0 as CostperAPDIndc,
		0 as ProdHoursAPDIndc,
		0 as NumofVacanciesIndc,
		0 as RTA30MinPct,
		0 as RTC60MinPct,
		0 as SqFtProdHours,
		0 as CostperAPD,
		0 as ProdHoursAPD,
		0 as TurnaroundTime		
	FROM @HousePeriodTable hpt
	--ORDER BY
		--hpt.FscYear,
		--hpt.FscPeriod
) AtAGlance
ORDER BY
	AtAGlance.FscYear,
	AtAGlance.FscPeriod
	
	
DROP TABLE #Hierarchy
		

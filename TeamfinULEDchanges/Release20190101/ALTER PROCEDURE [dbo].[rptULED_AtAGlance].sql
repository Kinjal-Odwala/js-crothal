USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptULED_AtAGlance]    Script Date: 12/24/2018 12:53:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[rptULED_AtAGlance]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT,
	@NMetricSelection INT
)
AS


/*

Report Name:  TeamFin_ULED
Dataset:  AtAGlance

Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This stored procedure returns the data used by the At a Glance Section of the TeamFin ULED


Date		Author				Notes
---------------------------------------------------------------------------------------------------------------------------------------------------------
2017-11-13	Michael Jacobi		Created Proc
2017-11-15	Michael Jacobi		Updated to add Fiscal Period Information
2017-11-16	Michael Jacobi		Updated to add dummy Fiscal Period information for future periods in the same fiscal year
*/

/*

exec rptULED_AtAGlance @NUserId = 'compass-usa\jacobm03', @NLevel = 'SiteName',
	@NName = '1802 Westchester PT', @NFscYear = 9, @NFscPeriod = 103, @NMetricSelection = 1

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
	DECLARE @NNMetricSelection INT

	SET @NNUserID = @NUserID
	SET @NNLevel = @NLevel
	SET @NNName = @NName
	SET @NNFscYear = @NFscYear
	SET @NNFscPeriod = @NFscPeriod
	SET @NNMetricSelection = @NMetricSelection

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
		grp.TotalScheduledComplete,
		grp.TotalArrivedOnTimeTasks,
		grp.TotalDemandComplete,
		grp.RTAU10,
		grp.RTA15,
		grp.DTC20,
		grp.RTC30,
		grp.RTC35,
		grp.TotalCancelled,
		grp.TotalActiveTime,
		grp.TotalAssignedTime,
		grp.TotalUnassignedTime,
		grp.TotalTripTime,
		grp.TotalComplete,
		grp.TotalERComplete,
		grp.TotalDischargesComplete,
		grp.TotalDelayed,
		grp.TotalSelfDispatched,
		grp.TeamFin_OperatingCapacity,
		grp.TeamFin_PatientDays,
		grp.TeamFin_AdjustedPatientDays,
		grp.TeamFin_Discharges,
		grp.TeamFin_DischargesPT,
		grp.ActualTransporterProductiveHours,
		grp.TaskTrackingInHouse,
		grp.CostedTripCycleTime,
		grp.ContractedAnnualTrips,
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		/* Monthly Contracted Trips */
		cast((cast((cast(grp.ContractedAnnualTrips as decimal(18,4)) / 365) as decimal(18,4)) * grp.NoOfDaysinPeriod) as decimal(18,4)) as ContractedMonthlyTrips,
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		
		/* Indicators for the gauges */
		-- On Time Scheduled Trip Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,1,
			CASE
				WHEN isnull(grp.TotalScheduledComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.TotalArrivedOnTimeTasks as decimal(18,2)) / cast(grp.TotalScheduledComplete as decimal(18,2)) as decimal(18,4))) * 100
			END, @NNFscYear, grp.TaskTrackingInHouse,0) 
		as OnTimeScheduledTripIndc,


		-- RTAU10 or RTA15 Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,2,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				WHEN @NNMetricSelection = 1
					THEN (cast(cast(grp.RTAU10 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
				WHEN @NNMetricSelection = 2
					THEN (cast(cast(grp.RTA15 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
				ELSE 0
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as RTAU10Indc,
		

		-- DTC20 Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,3,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.DTC20 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as DTC20Indc,
		

		-- RTC 30 or RTC 35 Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,4,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				WHEN @NNMetricSelection = 1
					THEN (cast(cast(grp.RTC30 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
				WHEN @NNMetricSelection = 2
					THEN (cast(cast(grp.RTC35 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))) * 100
				ELSE 0
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as RTC30Indc,


		-- Cancellation Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,5,
			CASE
				WHEN isnull(grp.TotalComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.TotalCancelled as decimal(18,2)) / cast((grp.TotalComplete + grp.TotalCancelled) as decimal(18,2)) as decimal(18,4))) * 100
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as CancellationPctIndc,
		

		-- Delay Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,6,
			CASE
				WHEN isnull(grp.TotalComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.TotalDelayed as decimal(18,2)) / cast(grp.TotalComplete as decimal(18,2)) as decimal(18,4))) * 100
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as TOTALDelayedIndc,
		

		-- Turnaround Time Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,7,
			CASE
				WHEN isnull(grp.TotalDemandComplete,0) = 0
					THEN 0
				ELSE (cast(cast(grp.TotalTripTime as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,2)))
			END, @NNFscYear, grp.TaskTrackingInHouse, grp.CostedTripCycleTime)
		as TurnaroundTimeIndc,
		

		-- Percentage of Discahrge Transports Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,8,
			CASE
				WHEN isnull(grp.TeamFin_Discharges,0) = 0
					THEN 0
				WHEN isnull(grp.TotalDischargesComplete,0) <> 0
					THEN (cast(cast(grp.TotalDischargesComplete as decimal(18,2)) / (cast(grp.TeamFin_Discharges as decimal(18,2))) as decimal(18,4))) * 100
				WHEN isnull(grp.TeamFin_DischargesPT,0) <> 0
					THEN (cast(cast(grp.TeamFin_DischargesPT as decimal(18,2)) / (cast(grp.TeamFin_Discharges as decimal(18,2))) as decimal(18,4))) * 100
				ELSE 0
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as PctDischargeTransportIndc,

		
		-- TPPH Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,9,
			CASE
				WHEN isnull(grp.ActualTransporterProductiveHours,0) = 0
					THEN 0
				ELSE cast(cast(grp.TotalComplete as decimal(18,2)) / cast(grp.ActualTransporterProductiveHours as decimal(18,2)) as decimal(18,2))
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as TPPHIndc,
		
		
		-- TPPD Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,10,
			CASE
				WHEN isnull(grp.TeamFin_PatientDays,0) = 0
					THEN 0
				ELSE cast(cast(grp.TotalComplete as decimal(18,2)) / cast(grp.TeamFin_PatientDays as decimal(18,2)) as decimal(18,2))
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as TPPDIndc,
		
		
		-- ITPPD Indicator
		dbo.GetULEDThresholdIndicatorYR(grp.SiteName,11,
			CASE
				WHEN isnull(grp.TeamFin_PatientDays,0) = 0
					THEN 0
				ELSE cast((cast(grp.TotalComplete as decimal(18,2)) - cast(grp.TotalERComplete as decimal(18,2))) / 
					cast(grp.TeamFin_PatientDays as decimal(18,2)) as decimal(18,2))
			END, @NNFscYear, grp.TaskTrackingInHouse,0)
		as ITPPDIndc,
		
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		
		
		/* Actual Values */
	
		-- Operating Capacity - pulled directly from TeamFin
		CASE
			WHEN isnull(grp.TeamFin_OperatingCapacity,0) = 0
				THEN 0
			ELSE cast(cast(grp.TeamFin_OperatingCapacity as decimal(18,2)) / 100 as decimal(18,2))
		END as OperatingCapacity,
		
		
		-- Self Tasking Percentage
		CASE
			WHEN isnull(grp.TotalComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalSelfDispatched as decimal(18,2)) / cast(grp.TotalComplete as decimal(18,2)) as decimal(18,4))
		END as SelfTaskingPercentage,
		
		
		-- On Time Scheduled Trip Percentage
		CASE
			WHEN isnull(grp.TotalScheduledComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalArrivedOnTimeTasks as decimal(18,2)) / cast(grp.TotalScheduledComplete as decimal(18,2)) as decimal(18,4))
		END as OnTimeScheduledTripPct,
		
		
		-- RTA 10 or RTA 15 Percentage
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			WHEN @NMetricSelection = 1
				THEN cast(cast(grp.RTAU10 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
			WHEN @NMetricSelection = 2
				THEN cast(cast(grp.RTA15 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
			ELSE 0
		END as RTA10MinPct,


		-- DTC 20 Percentage
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.DTC20 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
		END as DTC20MinPct,


		-- RTC 30 or RTC 35 Percentage
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			WHEN @NMetricSelection = 1
				THEN cast(cast(grp.RTC30 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
			WHEN @NMetricSelection = 2
				THEN cast(cast(grp.RTC35 as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,4))
			ELSE 0
		END as RTC30MinPct,
		
		
		-- TPPH - Trips per Productive Hour
		CASE
			WHEN isnull(grp.ActualTransporterProductiveHours,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalComplete as decimal(18,2)) / cast(grp.ActualTransporterProductiveHours as decimal(18,2)) as decimal(18,2))
		END as TPPH,


		-- TPPD - Trips per Patient Day
		CASE
			WHEN isnull(grp.TeamFin_PatientDays,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalComplete as decimal(18,2)) / cast(grp.TeamFin_PatientDays as decimal(18,2))  as decimal(18,2))
		END  as TPPD,
		
		
		-- ITPPD - Inpatient Trips per Patient Day
		CASE
			WHEN isnull(grp.TeamFin_PatientDays,0) = 0
				THEN 0
			ELSE cast((cast(grp.TotalComplete as decimal(18,2)) - cast(grp.TotalERComplete as decimal(18,2))) / cast(grp.TeamFin_PatientDays as decimal(18,2))  as decimal(18,2))
		END as ITPPD,
		
		
		-- TPAPD - Trips per Adjusted Patient Day
		CASE
			WHEN isnull(grp.TeamFin_AdjustedPatientDays,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalComplete as decimal(18,2)) / cast(grp.TeamFin_AdjustedPatientDays as decimal(18,2))  as decimal(18,2))
		END  as TPAPD,
		
		
		-- ITPAPD - Inpatient Trips per Adjusted Patient Day
		CASE
			WHEN isnull(grp.TeamFin_AdjustedPatientDays,0) = 0
				THEN 0
			ELSE cast((cast(grp.TotalComplete as decimal(18,2)) - cast(grp.TotalERComplete as decimal(18,2))) / cast(grp.TeamFin_AdjustedPatientDays as decimal(18,2)) as decimal(18,2)) 
		END as ITPAPD,
		
		
		-- Cancellation Percentage
		CASE
			WHEN isnull(grp.TotalComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalCancelled as decimal(18,2)) / cast((grp.TotalComplete + grp.TotalCancelled) as decimal(18,2)) as decimal(18,4)) --validated with Kevin Yon on 2017-11-03
		END as CancellationPct,

		
		-- Delay Percentage
		CASE
			WHEN isnull(grp.TotalComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalDelayed as decimal(18,2)) / cast(grp.TotalComplete as decimal(18,2)) as decimal(18,4))
		END as DelayPct,
		
		
		-- Turnaround Time
		CASE
			WHEN isnull(grp.TotalDemandComplete,0) = 0
				THEN 0
			ELSE cast(cast(grp.TotalTripTime as decimal(18,2)) / cast(grp.TotalDemandComplete as decimal(18,2)) as decimal(18,2))
		END as TurnaroundTime,
		
		-- Percentage of Discharges Transported
		CASE
			WHEN isnull(grp.TeamFin_Discharges,0) = 0
				THEN 0
			WHEN isnull(grp.TotalDischargesComplete,0) <> 0
				THEN cast(cast(grp.TotalDischargesComplete as decimal(18,4)) / cast(grp.TeamFin_Discharges as decimal(18,4)) as decimal(18,4))
			WHEN isnull(grp.TeamFin_DischargesPT,0) <> 0
				THEN cast(cast(grp.TeamFin_DischargesPT as decimal(18,4)) / cast(grp.TeamFin_Discharges as decimal(18,4)) as decimal(18,4))
			ELSE 0
		END as PctDischargeTransport
		
		
		----------------------------------------------------------------------
		----------------------------------------------------------------------
		
	FROM [TeamFinv2].[dbo].[vw_rptULED_AtAGlance] grp
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
		0 as TotalScheduledComplete,
		0 as TotalArrivedOnTimeTasks,
		0 as TotalDemandComplete,
		0 as RTAU10,
		0 as RTA15,
		0 as DTC20,
		0 as RTC30,
		0 as RTC35,
		0 as TotalCancelled,
		0 as TotalActiveTime,
		0 as TotalAssignedTime,
		0 as TotalUnassignedTime,
		0 as TotalTripTime,
		0 as TotalComplete,
		0 as TotalERComplete,
		0 as TotalDischargesComplete,
		0 as TotalDelayed,
		0 as TotalSelfDispatched,
		0 as TeamFin_OperatingCapacity,
		0 as TeamFin_PatientDays,
		0 as TeamFin_AdjustedPatientDays,
		0 as TeamFin_Discharges,
		0 as TeamFin_DischargesPT,
		0 as ActualTransporterProductiveHours,
		NULL as TaskTrackingInHouse,
		0 as CostedTripCycleTime,
		0 as ContractedAnnualTrips,
		0 as ContractedMonthlyTrips,
		0 as OnTimeScheduledTripIndc,
		0 as RTAU10Indc,
		0 as DTC20Indc,
		0 as RTC30Indc,
		0 as CancellationPctIndc,
		0 as TOTALDelayedIndc,
		0 as TurnaroundTimeIndc,
		0 as PctDischargeTransportIndc,
		0 as TPPHIndc,
		0 as TPPDIndc,
		0 as ITPPDIndc,
		0 as OperatingCapacity,
		0 as SelfTaskingPercentage,
		0 as OnTimeScheduledTripPct,
		0 as RTA10MinPct,
		0 as DTC20MinPct,
		0 as RTC30MinPct,
		0 as TPPH,
		0 as TPPD,
		0 as ITPPD,
		0 as TPAPD,
		0 as ITPAPD,
		0 as CancellationPct,
		0 as DelayPct,
		0 as TurnaroundTime,
		0 as PctDischargeTransport
		
	FROM @HousePeriodTable hpt
	--ORDER BY
		--hpt.FscYear,
		--hpt.FscPeriod
) AtAGlance
ORDER BY
	AtAGlance.FscYear,
	AtAGlance.FscPeriod
	
	
DROP TABLE #Hierarchy
		

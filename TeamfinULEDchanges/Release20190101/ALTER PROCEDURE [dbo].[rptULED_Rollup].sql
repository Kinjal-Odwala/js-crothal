USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptULED_Rollup]    Script Date: 12/26/2018 2:09:10 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[rptULED_Rollup]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NFilterLevel varchar(20),
	@NFscYear INT,
	@NFscPeriod INT
)

AS


/*
Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
Stored Procedure that returns aggregate ULED Data for a given hierarchy and financial periods YTD.


EXEC [TeamFinv2].[dbo].[rptULED_Rollup] @NUserID = 'compass-usa\YonK01', @NLevel = 'DVP', @NFilterLevel = 'Yon DVP', @NFscYear = 9, @NFscPeriod = 106

Date		Author				Notes
---------------------------------------------------------------------------------------------------------------------------------------------------------
2018-03-14	Michael Jacobi		Created Procedure
2018-03-15	Michael Jacobi		Overhauled procedure to leverage the existing procedures used to generate data for the standard ULED report.
								Now, if there are changes performed to that procedure, this one may not necessarily have to be updated.
								Replaced the temp tables with variable tables since there will never be more than 10k records.
*/

--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------

	/* Test Variables */
	--DECLARE @NUserID varchar(50) = 'compass-usa\YonK01'
	--DECLARE @NLevel varchar(20) = 'DVP'
	--DECLARE @NFilterLevel varchar(20) = 'Yon DVP'
	--DECLARE @NFscYear int = 9
	--DECLARE @NFscPeriod int = 106


	/* Actual Variables */
	DECLARE @NNUserID varchar(50)
	DECLARE @NNLevel varchar(20)
	DECLARE @NNFilterLevel varchar(20)
	DECLARE @NNFscYear int
	DECLARE @NNFscPeriod int

	SET @NNUserID = @NUserID
	SET @NNLevel = @NLevel
	SET @NNFilterLevel = @NFilterLevel
	SET @NNFscYear = @NFscYear
	SET @NNFscPeriod = @NFscPeriod



--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------
/* Temp table creation and data insert */

	
	/* Create variable temp table to store data from threshold 1 calculations */
	DECLARE @ULEDThreshold1 TABLE
		(
			[SiteName] varchar(256),
			[HouseCode] varchar(16),
			[HirNode] int,
			[FscYear] int,
			[FscPeriod] int,
			[NoOfDaysinPeriod] int,
			[TotalScheduledComplete] int,
			[TotalArrivedOnTimeTasks] int,
			[TotalDemandComplete] int,
			[RTAU10] int,
			[RTA15] int,
			[DTC20] int,
			[RTC30] int,
			[RTC35] int,
			[TotalCancelled] int,
			[TotalActiveTime] int,
			[TotalAssignedTime] int,
			[TotalUnassignedTime] int,
			[TotalTripTime] int,
			[TotalComplete] int,
			[TotalERComplete] int,
			[TotalDischargesComplete] int,
			[TotalDelayed] int,
			[TotalSelfDispatched] int,
			[TeamFin_OperatingCapacity] decimal(18,2),
			[TeamFin_PatientDays] decimal(18,2),
			[TeamFin_AdjustedPatientDays] decimal(18,2),
			[TeamFin_Discharges] decimal(18,2),
			[TeamFin_DischargesPT] decimal(18,2),
			[ActualTransporterProductiveHours] decimal(18,2),
			[TaskTrackingInHouse] varchar(1),
			[CostedTripCycleTime] int,
			[ContractedAnnualTrips] int,
			[ContractedMonthlyTrips] decimal(18,4),
			[OnTimeScheduledTripIndc] int,
			[RTAU10Indc] int,
			[DTC20Indc] int,
			[RTC30Indc] int,
			[CancellationPctIndc] int,
			[TOTALDelayedIndc] int,
			[TurnaroundTimeIndc] int,
			[PctDischargeTransportIndc] int,
			[TPPHIndc] int,
			[TPPDIndc] int,
			[ITPPDIndc] int,
			[OperatingCapacity] decimal(18,2),
			[SelfTaskingPercentage] decimal(18,4),
			[OnTimeScheduledTripPct] decimal(18,4),
			[RTA10MinPct] decimal(18,4),
			[DTC20MinPct] decimal(18,4),
			[RTC30MinPct] decimal(18,4),
			[TPPH] decimal(18,2),
			[TPPD] decimal(18,2),
			[ITPPD] decimal(18,2),
			[TPAPD] decimal(18,2),
			[ITPAPD] decimal(18,2),
			[CancellationPct] decimal(18,4),
			[DelayPct] decimal(18,4),
			[TurnaroundTime] decimal(18,2),
			[PctDischargeTransport] decimal(18,4)
		)

	/* Create variable table to store data from threshold 2 calculations */
	DECLARE @ULEDThreshold2 TABLE
		(
			[SiteName] varchar(256),
			[HouseCode] varchar(16),
			[HirNode] int,
			[FscYear] int,
			[FscPeriod] int,
			[NoOfDaysinPeriod] int,
			[TotalScheduledComplete] int,
			[TotalArrivedOnTimeTasks] int,
			[TotalDemandComplete] int,
			[RTAU10] int,
			[RTA15] int,
			[DTC20] int,
			[RTC30] int,
			[RTC35] int,
			[TotalCancelled] int,
			[TotalActiveTime] int,
			[TotalAssignedTime] int,
			[TotalUnassignedTime] int,
			[TotalTripTime] int,
			[TotalComplete] int,
			[TotalERComplete] int,
			[TotalDischargesComplete] int,
			[TotalDelayed] int,
			[TotalSelfDispatched] int,
			[TeamFin_OperatingCapacity] decimal(18,2),
			[TeamFin_PatientDays] decimal(18,2),
			[TeamFin_AdjustedPatientDays] decimal(18,2),
			[TeamFin_Discharges] decimal(18,2),
			[TeamFin_DischargesPT] decimal(18,2),
			[ActualTransporterProductiveHours] decimal(18,2),
			[TaskTrackingInHouse] varchar(1),
			[CostedTripCycleTime] int,
			[ContractedAnnualTrips] int,
			[ContractedMonthlyTrips] decimal(18,4),
			[OnTimeScheduledTripIndc] int,
			[RTA15Indc] int,
			[DTC20Indc] int,
			[RTC35Indc] int,
			[CancellationPctIndc] int,
			[TOTALDelayedIndc] int,
			[TurnaroundTimeIndc] int,
			[PctDischargeTransportIndc] int,
			[TPPHIndc] int,
			[TPPDIndc] int,
			[ITPPDIndc] int,
			[OperatingCapacity] decimal(18,2),
			[SelfTaskingPercentage] decimal(18,4),
			[OnTimeScheduledTripPct] decimal(18,4),
			[RTA15MinPct] decimal(18,4),
			[DTC20MinPct] decimal(18,4),
			[RTC35MinPct] decimal(18,4),
			[TPPH] decimal(18,2),
			[TPPD] decimal(18,2),
			[ITPPD] decimal(18,2),
			[TPAPD] decimal(18,2),
			[ITPAPD] decimal(18,2),
			[CancellationPct] decimal(18,4),
			[DelayPct] decimal(18,4),
			[TurnaroundTime] decimal(18,2),
			[PctDischargeTransport] decimal(18,4)
		)

	/* Create variable table to store data from threshold 1 & 2 calculations */
	DECLARE @ULEDThresholdCombined TABLE
		(
			[SiteName] varchar(256),
			[HouseCode] varchar(16),
			[HirNode] int,
			[FscYear] int,
			[FscPeriod] int,
			[NoOfDaysinPeriod] int,
			[TotalScheduledComplete] int,
			[TotalArrivedOnTimeTasks] int,
			[TotalDemandComplete] int,
			[RTAU10] int,
			[RTA15] int,
			[DTC20] int,
			[RTC30] int,
			[RTC35] int,
			[TotalCancelled] int,
			[TotalActiveTime] int,
			[TotalAssignedTime] int,
			[TotalUnassignedTime] int,
			[TotalTripTime] int,
			[TotalComplete] int,
			[TotalERComplete] int,
			[TotalDischargesComplete] int,
			[TotalDelayed] int,
			[TotalSelfDispatched] int,
			[TeamFin_OperatingCapacity] decimal(18,2),
			[TeamFin_PatientDays] decimal(18,2),
			[TeamFin_AdjustedPatientDays] decimal(18,2),
			[TeamFin_Discharges] decimal(18,2),
			[TeamFin_DischargesPT] decimal(18,2),
			[ActualTransporterProductiveHours] decimal(18,2),
			[TaskTrackingInHouse] varchar(1),
			[CostedTripCycleTime] int,
			[ContractedAnnualTrips] int,
			[ContractedMonthlyTrips] decimal(18,4),
			[OnTimeScheduledTripIndc] int,
			[RTAU10Indc] int,
			[RTA15Indc] int,
			[DTC20Indc] int,
			[RTC30Indc] int,
			[RTC35Indc] int,
			[CancellationPctIndc] int,
			[TOTALDelayedIndc] int,
			[TurnaroundTimeIndc] int,
			[PctDischargeTransportIndc] int,
			[TPPHIndc] int,
			[TPPDIndc] int,
			[ITPPDIndc] int,
			[OperatingCapacity] decimal(18,2),
			[SelfTaskingPercentage] decimal(18,4),
			[OnTimeScheduledTripPct] decimal(18,4),
			[RTA10MinPct] decimal(18,4),
			[RTA15MinPct] decimal(18,4),
			[DTC20MinPct] decimal(18,4),
			[RTC30MinPct] decimal(18,4),
			[RTC35MinPct] decimal(18,4),
			[TPPH] decimal(18,2),
			[TPPD] decimal(18,2),
			[ITPPD] decimal(18,2),
			[TPAPD] decimal(18,2),
			[ITPAPD] decimal(18,2),
			[CancellationPct] decimal(18,4),
			[DelayPct] decimal(18,4),
			[TurnaroundTime] decimal(18,2),
			[PctDischargeTransport] decimal(18,4)
		)
	
	/* Insert data into the threshold 1 & 2 temp tables */
	INSERT INTO @ULEDThreshold1
		(
			[SiteName],
			[HouseCode],
			[HirNode],
			[FscYear],
			[FscPeriod],
			[NoOfDaysinPeriod],
			[TotalScheduledComplete],
			[TotalArrivedOnTimeTasks],
			[TotalDemandComplete],
			[RTAU10],
			[RTA15],
			[DTC20],
			[RTC30],
			[RTC35],
			[TotalCancelled],
			[TotalActiveTime],
			[TotalAssignedTime],
			[TotalUnassignedTime],
			[TotalTripTime],
			[TotalComplete],
			[TotalERComplete],
			[TotalDischargesComplete],
			[TotalDelayed],
			[TotalSelfDispatched],
			[TeamFin_OperatingCapacity],
			[TeamFin_PatientDays],
			[TeamFin_AdjustedPatientDays],
			[TeamFin_Discharges],
			[TeamFin_DischargesPT],
			[ActualTransporterProductiveHours],
			[TaskTrackingInHouse],
			[CostedTripCycleTime],
			[ContractedAnnualTrips],
			[ContractedMonthlyTrips],
			[OnTimeScheduledTripIndc],
			[RTAU10Indc],
			[DTC20Indc],
			[RTC30Indc],
			[CancellationPctIndc],
			[TOTALDelayedIndc],
			[TurnaroundTimeIndc],
			[PctDischargeTransportIndc],
			[TPPHIndc],
			[TPPDIndc],
			[ITPPDIndc],
			[OperatingCapacity],
			[SelfTaskingPercentage],
			[OnTimeScheduledTripPct],
			[RTA10MinPct],
			[DTC20MinPct],
			[RTC30MinPct],
			[TPPH],
			[TPPD],
			[ITPPD],
			[TPAPD],
			[ITPAPD],
			[CancellationPct],
			[DelayPct],
			[TurnaroundTime],
			[PctDischargeTransport]
		)
		
		EXEC TeamFinv2.dbo.rptULED_AtAGlance
			@NUserId = @NNUserID,
			@NLevel = @NNLevel,
			@NName = @NNFilterLevel,
			@NFscYear = @NNFscYear,
			@NFscPeriod = @NNFscPeriod,
			@NMetricSelection = 1
			
	INSERT INTO @ULEDThreshold2
		(	
			[SiteName],
			[HouseCode],
			[HirNode],
			[FscYear],
			[FscPeriod],
			[NoOfDaysinPeriod],
			[TotalScheduledComplete],
			[TotalArrivedOnTimeTasks],
			[TotalDemandComplete],
			[RTAU10],
			[RTA15],
			[DTC20],
			[RTC30],
			[RTC35],
			[TotalCancelled],
			[TotalActiveTime],
			[TotalAssignedTime],
			[TotalUnassignedTime],
			[TotalTripTime],
			[TotalComplete],
			[TotalERComplete],
			[TotalDischargesComplete],
			[TotalDelayed],
			[TotalSelfDispatched],
			[TeamFin_OperatingCapacity],
			[TeamFin_PatientDays],
			[TeamFin_AdjustedPatientDays],
			[TeamFin_Discharges],
			[TeamFin_DischargesPT],
			[ActualTransporterProductiveHours],
			[TaskTrackingInHouse],
			[CostedTripCycleTime],
			[ContractedAnnualTrips],
			[ContractedMonthlyTrips],
			[OnTimeScheduledTripIndc],
			[RTA15Indc],
			[DTC20Indc],
			[RTC35Indc],
			[CancellationPctIndc],
			[TOTALDelayedIndc],
			[TurnaroundTimeIndc],
			[PctDischargeTransportIndc],
			[TPPHIndc],
			[TPPDIndc],
			[ITPPDIndc],
			[OperatingCapacity],
			[SelfTaskingPercentage],
			[OnTimeScheduledTripPct],
			[RTA15MinPct],
			[DTC20MinPct],
			[RTC35MinPct],
			[TPPH],
			[TPPD],
			[ITPPD],
			[TPAPD],
			[ITPAPD],
			[CancellationPct],
			[DelayPct],
			[TurnaroundTime],
			[PctDischargeTransport]
		)
		
		EXEC TeamFinv2.dbo.rptULED_AtAGlance
			@NUserId = @NNUserID,
			@NLevel = @NNLevel,
			@NName = @NNFilterLevel,
			@NFscYear = @NNFscYear,
			@NFscPeriod = @NNFscPeriod,
			@NMetricSelection = 2
			
			
	/* Insert Combined table into combined temp table */
	INSERT INTO @ULEDThresholdCombined
		(
			[SiteName],
			[HouseCode],
			[HirNode],
			[FscYear],
			[FscPeriod],
			[NoOfDaysinPeriod],
			[TotalScheduledComplete],
			[TotalArrivedOnTimeTasks],
			[TotalDemandComplete],
			[RTAU10],
			[RTA15],
			[DTC20],
			[RTC30],
			[RTC35],
			[TotalCancelled],
			[TotalActiveTime],
			[TotalAssignedTime],
			[TotalUnassignedTime],
			[TotalTripTime],
			[TotalComplete],
			[TotalERComplete],
			[TotalDischargesComplete],
			[TotalDelayed],
			[TotalSelfDispatched],
			[TeamFin_OperatingCapacity],
			[TeamFin_PatientDays],
			[TeamFin_AdjustedPatientDays],
			[TeamFin_Discharges],
			[TeamFin_DischargesPT],
			[ActualTransporterProductiveHours],
			[TaskTrackingInHouse],
			[CostedTripCycleTime],
			[ContractedAnnualTrips],
			[ContractedMonthlyTrips],
			[OnTimeScheduledTripIndc],
			[RTAU10Indc],
			[RTA15Indc],
			[DTC20Indc],
			[RTC30Indc],
			[RTC35Indc],
			[CancellationPctIndc],
			[TOTALDelayedIndc],
			[TurnaroundTimeIndc],
			[PctDischargeTransportIndc],
			[TPPHIndc],
			[TPPDIndc],
			[ITPPDIndc],
			[OperatingCapacity],
			[SelfTaskingPercentage],
			[OnTimeScheduledTripPct],
			[RTA10MinPct],
			[RTA15MinPct],
			[DTC20MinPct],
			[RTC30MinPct],
			[RTC35MinPct],
			[TPPH],
			[TPPD],
			[ITPPD],
			[TPAPD],
			[ITPAPD],
			[CancellationPct],
			[DelayPct],
			[TurnaroundTime],
			[PctDischargeTransport]
		)
		
			SELECT
				u1.[SiteName],
				u1.[HouseCode],
				u1.[HirNode],
				u1.[FscYear],
				u1.[FscPeriod],
				u1.[NoOfDaysinPeriod],
				u1.[TotalScheduledComplete],
				u1.[TotalArrivedOnTimeTasks],
				u1.[TotalDemandComplete],
				u1.[RTAU10],
				u1.[RTA15],
				u1.[DTC20],
				u1.[RTC30],
				u1.[RTC35],
				u1.[TotalCancelled],
				u1.[TotalActiveTime],
				u1.[TotalAssignedTime],
				u1.[TotalUnassignedTime],
				u1.[TotalTripTime],
				u1.[TotalComplete],
				u1.[TotalERComplete],
				u1.[TotalDischargesComplete],
				u1.[TotalDelayed],
				u1.[TotalSelfDispatched],
				u1.[TeamFin_OperatingCapacity],
				u1.[TeamFin_PatientDays],
				u1.[TeamFin_AdjustedPatientDays],
				u1.[TeamFin_Discharges],
				u1.[TeamFin_DischargesPT],
				u1.[ActualTransporterProductiveHours],
				u1.[TaskTrackingInHouse],
				u1.[CostedTripCycleTime],
				u1.[ContractedAnnualTrips],
				u1.[ContractedMonthlyTrips],
				u1.[OnTimeScheduledTripIndc],
				u1.[RTAU10Indc],
				u2.[RTA15Indc],
				u1.[DTC20Indc],
				u1.[RTC30Indc],
				u2.[RTC35Indc],
				u1.[CancellationPctIndc],
				u1.[TOTALDelayedIndc],
				u1.[TurnaroundTimeIndc],
				u1.[PctDischargeTransportIndc],
				u1.[TPPHIndc],
				u1.[TPPDIndc],
				u1.[ITPPDIndc],
				u1.[OperatingCapacity],
				u1.[SelfTaskingPercentage],
				u1.[OnTimeScheduledTripPct],
				u1.[RTA10MinPct],
				u2.[RTA15MinPct],
				u1.[DTC20MinPct],
				u1.[RTC30MinPct],
				u2.[RTC35MinPct],
				u1.[TPPH],
				u1.[TPPD],
				u1.[ITPPD],
				u1.[TPAPD],
				u1.[ITPAPD],
				u1.[CancellationPct],
				u1.[DelayPct],
				u1.[TurnaroundTime],
				u1.[PctDischargeTransport]
			FROM @ULEDThreshold1 u1
			INNER JOIN @ULEDThreshold2 u2
				ON u1.HirNode = u2.HirNode
				AND u1.FscYear = u2.FscYear
				AND u1.FscPeriod = u2.FscPeriod


--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------------------------------------------------------------------------	
	
	/* Select the combined data and integrate that with the hierarchy data */
	
	SELECT
		PTsystems.HcmPTTaskManagementSystem,
		PTsystems.HcmPttmsTitle,
		hn.HirNodLevel1_HirNode as SVP_HirNode,
		hn.HirNodLevel1 as SVP,
		hn.HirNodLevel2_HirNode as DVP_HirNode,
		hn.HirNodLevel2 as DVP,
		hn.HirNodLevel3_HirNode as RVP_HirNode,
		hn.HirNodLevel3 as RVP,
		hn.HirNodLevel4_HirNode as SRM_HirNode,
		hn.HirNodLevel4 as SRM,
		hn.HirNodLevel5_HirNode as RDO_HirNode,
		hn.HirNodLevel5 as RDO,
		hn.HirNodLevel6_HirNode as AM_HirNode,
		hn.HirNodLevel6 as AM,
		hn.Facility_HirNode,
		hn.Facility_HouseCode,
		hn.Facility_Name,
		ISNULL(PTmet.HcmPtmBudgetedTPPH, 0) HcmPtmBudgetedTPPH,
		uled.*
	FROM @ULEDThresholdCombined uled
	INNER JOIN ESMv2.dbo.vwhirnodesflattenedfullhirnodes hn
		ON uled.HirNode = hn.Facility_HirNode
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc WITH (NOLOCK)
		ON hn.Facility_HirNode = hc.HirNode
	/* Join the master PT Metrics table */
	INNER JOIN TeamFinv2.dbo.HcmPTMetrics PTmet WITH (NOLOCK)
		ON PTMet.HcmHouseCode = hc.HcmHouseCode
		AND PTMet.FscYear = @NNFscYear
	INNER JOIN TeamFinv2.dbo.HcmPTTaskManagementSystems PTsystems WITH (NOLOCK)
		ON PTMet.HcmPTTaskManagementSystem = PTsystems.HcmPTTaskManagementSystem
		/* Join the Standard PT Metrics table */
	/*INNER JOIN TeamFinv2.[dbo].[HcmPTStandardMetrics] PTStmet WITH (NOLOCK)
		ON (PTStmet.FscYear= @NNFscYear 
			and PTStmet.HcmPTMetricType=case when PTMet.HcmPTTaskManagementSystem=5 then 
												  case when uled.TPPHIndc=1 then 23 else 24 end
											 else	  
												  case when uled.TPPHIndc=1 then 21 else 22 end end) */
	ORDER BY
		hn.HirNodLevel1,
		hn.HirNodLevel2,
		hn.HirNodLevel3,
		hn.HirNodLevel4,
		hn.HirNodLevel5,
		hn.HirNodLevel6,
		hn.Facility_HouseCode,
		uled.FscYear,
		uled.FscPeriod
	
	

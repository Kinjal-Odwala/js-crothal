USE [TeamFinv2]
GO
/****** Object:  UserDefinedFunction [dbo].[GetULEDThresholdIndicatorYR]    Script Date: 7/31/2018 2:09:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[GetEVSULEDThresholdIndicatorYR]
(
	@IndicatorType int,
	@CompareValue float,
	@FscYear int,
	@TaskTrackingSystem varchar(1),                --Y = InHouse, N = 3rd Party
	@CostedTripCycleTime int
)
RETURNS int
AS
BEGIN

DECLARE @IndicatorThreshold int

IF @CompareValue = 0
   BEGIN
     SET @IndicatorThreshold = 0
   END
ELSE
   BEGIN
     SET @IndicatorThreshold = 3
   END

--RTA30%

  IF @IndicatorType = 1 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
     CASE WHEN HcmEVSMetricType = 70 
          THEN 1 --70 
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue >= HcmEVSsmRTA30 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY HcmEVSsmRTA30 Desc
			   ) Level
  END

  IF @IndicatorType = 1 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
     CASE WHEN HcmEVSMetricType = 72
          THEN 1 --72
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue >= HcmEVSsmRTA30 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (72,73)
     ORDER BY HcmEVSsmRTA30 Desc
			   ) Level
  END

---RTC60%

  IF @IndicatorType = 2 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmEVSMetricType = 70 
          THEN 1 --70
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue >= HcmEVSsmRTC60 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY  HcmEVSsmRTC60 Desc
			   ) Level
  END

    IF @IndicatorType = 2 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmEVSMetricType = 72
          THEN 1 --72 
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue >= HcmEVSsmRTC60 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (73,72)
     ORDER BY  HcmEVSsmRTC60 Desc
			   ) Level
  END

------ Turnaround Time Indicator

  IF @IndicatorType = 3 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 70
          THEN 1 --70
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmTotalTurnTime
	 and @CompareValue <> 0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY  HcmEVSsmTotalTurnTime Asc
			   ) Level
  END

IF @IndicatorType = 3 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 72 
          THEN 1 --72
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmTotalTurnTime
	 and @CompareValue <> 0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (72,73)
     ORDER BY  HcmEVSsmTotalTurnTime Asc
			   ) Level
  END

----------SquareFeetPerProductiveManHour-----------------------
  
  IF @IndicatorType = 4 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 70
          THEN 1 --70
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue >= HcmEVSsmSquareFeetPerProductiveManHour
	 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY  HcmEVSsmSquareFeetPerProductiveManHour Desc
			   ) Level
  END
 
 
 IF @IndicatorType = 4 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 72 
          THEN 1 --72
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue >= HcmEVSsmSquareFeetPerProductiveManHour
	 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (72,73)
     ORDER BY  HcmEVSsmSquareFeetPerProductiveManHour Desc
			   ) Level
  END
 
 
 
  ----------CostPerAPD-----------------------
  
  IF @IndicatorType = 5 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 70
          THEN 1 --70
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmCostPerAPD AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY  HcmEVSsmCostPerAPD Asc
			   ) Level
  END
    IF @IndicatorType = 5 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 72 
          THEN 1 --72
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmCostPerAPD AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (72,73)
     ORDER BY  HcmEVSsmCostPerAPD Asc
			   ) Level
  END

-------------ProductiveHoursWorkedPerAPD

  IF @IndicatorType = 6 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 70
          THEN 1 --70
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmProductiveHoursWorkedPerAPD AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY  HcmEVSsmProductiveHoursWorkedPerAPD Asc
			   ) Level
  END
    IF @IndicatorType = 6 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 72 
          THEN 1 --72
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmProductiveHoursWorkedPerAPD AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (72,73)
     ORDER BY  HcmEVSsmProductiveHoursWorkedPerAPD Asc
			   ) Level
  END
----------# of vacancies
  
  IF @IndicatorType = 7 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 70
          THEN 1 --70
		  ELSE 2 --71
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmVacancies
	 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (70,71)
     ORDER BY  HcmEVSsmVacancies Asc
			   ) Level
  END
    IF @IndicatorType = 7 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmEVSsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmEVSMetricType = 72 
          THEN 1 --72
		  ELSE 2 --73
	 END AS HcmEVSsmTypeID
     FROM [dbo].[HcmEVSStandardMetrics]
	 WHERE @CompareValue <= HcmEVSsmVacancies
	 AND @CompareValue<>0
	 AND @FscYear = FscYear
	 AND HcmEVSMetricType in (72,73)
     ORDER BY  HcmEVSsmVacancies Asc
			   ) Level
  END


RETURN @IndicatorThreshold
END
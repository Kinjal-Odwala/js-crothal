USE [TeamFinv2]
GO
/****** Object:  UserDefinedFunction [dbo].[GetULEDThresholdIndicatorYR]    Script Date: 12/24/2018 10:18:14 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER FUNCTION [dbo].[GetULEDThresholdIndicatorYR]
(
	@NName varchar(8000), --Adding to pass site level Budgeted TPPH value
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

declare @HcmPtmBudgetedTPPH float

set @HcmPtmBudgetedTPPH=(select ISNULL([HcmPtmBudgetedTPPH],-1.00)
						from hcmhousecodes inner join hcmPTmetrics 
						on hcmPTmetrics.hcmhousecode=hcmhousecodes.hcmhousecode
	      				inner join appunits on hcmhousecodes.appunit=appunits.appunit
						where appunititle=@NName and fscyear=@FscYear)


IF @CompareValue = 0
   BEGIN
     SET @IndicatorThreshold = 0
   END
ELSE
   BEGIN
     SET @IndicatorThreshold = 3
   END

  IF @IndicatorType = 1 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
     CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmOnTimeScheduled
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY [HcmPtsmOnTimeScheduled] Desc
			   ) Level
  END

  IF @IndicatorType = 1 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
     CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmOnTimeScheduled
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY [HcmPtsmOnTimeScheduled] Desc
			   ) Level
  END

  IF @IndicatorType = 2 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmRTA10
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  [HcmPtsmRTA10] Desc
			   ) Level
  END

    IF @IndicatorType = 2 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmRTA10
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  [HcmPtsmRTA10] Desc
			   ) Level
  END

  IF @IndicatorType = 3 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmDTC20
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  [HcmPtsmDTC20] Desc
			   ) Level
  END
    IF @IndicatorType = 3 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmDTC20
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  [HcmPtsmDTC20] Desc
			   ) Level
  END

  IF @IndicatorType = 4 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	   CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmRTC30
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  [HcmPtsmRTC30] Desc
			   ) Level
  END

    IF @IndicatorType = 4 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	   CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmRTC30
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  [HcmPtsmRTC30] Desc
			   ) Level
  END

  IF @IndicatorType = 5 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue <= HcmPtsmCancellation
	 AND @CompareValue <> 0
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  HcmPtsmCancellation Asc
			   ) Level
  END

    IF @IndicatorType = 5 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue <= HcmPtsmCancellation
	 AND @CompareValue <> 0
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  HcmPtsmCancellation Asc
			   ) Level
  END

  IF @IndicatorType = 6 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue <= HcmPtsmDelay
	 AND @CompareValue <> 0
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  [HcmPtsmDelay] Asc
			   ) Level
  END

    IF @IndicatorType = 6 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue <= HcmPtsmDelay
	 AND @CompareValue <> 0
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  [HcmPtsmDelay] Asc
			   ) Level
  END


   IF @IndicatorType = 7 AND 
   @CostedTripCycleTime < @CompareValue AND
   @CompareValue <> 0
   BEGIN
   SET @IndicatorThreshold = 3
   END 

   IF @IndicatorType = 7 AND 
   @CostedTripCycleTime = @CompareValue AND
   @CompareValue <> 0
   BEGIN
   SET @IndicatorThreshold = 2
   END 

   IF @IndicatorType = 7 AND 
   @CostedTripCycleTime > @CompareValue AND
   @CompareValue <> 0
   BEGIN
   SET @IndicatorThreshold = 1
   END
   	       


  IF @IndicatorType = 8 AND @TaskTrackingSystem = 'Y'
  BEGIN
   SELECT @IndicatorThreshold = 
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmDischarges
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  HcmPtsmDischarges Desc
			   ) Level
  END

  IF @IndicatorType = 8 AND @TaskTrackingSystem = 'N'
  BEGIN
   SELECT @IndicatorThreshold = 
          Level.HcmPtsmTypeID
   FROM
   ( SELECT TOP 1 
	  CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmDischarges
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  HcmPtsmDischarges Desc
			   ) Level
  END

--Change for TPPH indicators---Richa........Start

IF @HcmPtmBudgetedTPPH<0
BEGIN
		 IF @IndicatorType = 9 AND @TaskTrackingSystem = 'Y' 
		 BEGIN
		   SELECT @IndicatorThreshold =
				  Level.HcmPtsmTypeID
		   FROM
		   ( SELECT TOP 1 
			 CASE WHEN HcmPTMetricType = 21 
				  THEN 1 --21 
				  ELSE 2 --22
			 END AS HcmPtsmTypeID
			 FROM [dbo].[HcmPTStandardMetrics]
			 WHERE @CompareValue >= HcmPtsmTPPH
			 AND @FscYear = FscYear
			 AND HcmPTMetricType in (21,22)
			 ORDER BY  [HcmPtsmTPPH] Desc
					   ) Level
		  END

		 IF @IndicatorType = 9 AND @TaskTrackingSystem = 'N'
		 BEGIN
		   SELECT @IndicatorThreshold =
				  Level.HcmPtsmTypeID
		   FROM
		   ( SELECT TOP 1 
			 CASE WHEN HcmPTMetricType = 23 
				  THEN 1 --23 
				  ELSE 2 --24
			 END AS HcmPtsmTypeID
			 FROM [dbo].[HcmPTStandardMetrics]
			 WHERE @CompareValue >= HcmPtsmTPPH
			 AND @FscYear = FscYear
			 AND HcmPTMetricType in (23,24)
			 ORDER BY  [HcmPtsmTPPH] Desc
					   ) Level
		  END
END


IF @HcmPtmBudgetedTPPH>0 AND @IndicatorType = 9
BEGIN
			IF @CompareValue > @HcmPtmBudgetedTPPH set @IndicatorThreshold=1
			IF @CompareValue < @HcmPtmBudgetedTPPH set @IndicatorThreshold=3
			IF @CompareValue = @HcmPtmBudgetedTPPH set @IndicatorThreshold=2
END
--Change for TPPH indicators---Richa....END
  
   IF @IndicatorType = 10 AND @TaskTrackingSystem = 'Y'
   BEGIN
    SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
    FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmTPPD
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  [HcmPtsmTPPD] Desc
			   ) Level
  END

   IF @IndicatorType = 10 AND @TaskTrackingSystem = 'N'
   BEGIN
    SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
    FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmTPPD
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  [HcmPtsmTPPD] Desc
			   ) Level
  END

   IF @IndicatorType = 11 AND @TaskTrackingSystem = 'Y'
   BEGIN
    SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
    FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmPTMetricType = 21 
          THEN 1 --21 
		  ELSE 2 --22
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmITPPD
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (21,22)
     ORDER BY  [HcmPtsmITPPD] Desc
			   ) Level
  END

   IF @IndicatorType = 11 AND @TaskTrackingSystem = 'N'
   BEGIN
    SELECT @IndicatorThreshold =
          Level.HcmPtsmTypeID
    FROM
   ( SELECT TOP 1 
	 CASE WHEN HcmPTMetricType = 23 
          THEN 1 --23 
		  ELSE 2 --24
	 END AS HcmPtsmTypeID
     FROM [dbo].[HcmPTStandardMetrics]
	 WHERE @CompareValue >= HcmPtsmITPPD
	 AND @FscYear = FscYear
	 AND HcmPTMetricType in (23,24)
     ORDER BY  [HcmPtsmITPPD] Desc
			   ) Level
  END

RETURN @IndicatorThreshold
END

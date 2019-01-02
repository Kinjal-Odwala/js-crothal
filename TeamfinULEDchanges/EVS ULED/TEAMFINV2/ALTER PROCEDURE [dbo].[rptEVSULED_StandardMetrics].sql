USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_StandardMetrics]    Script Date: 7/30/2018 11:36:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[rptEVSULED_StandardMetrics]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
	--@NMetricSelection INT
)
AS


/*
DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
SET @NFscYear = 9
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\KhareR01'
SET @NName = '48132 - Abington Memorial Hosp EVS'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

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
FROM 
    Esmv2.dbo.AppUserHouseCodesSelectFunction(@NUserID) u 
    INNER JOIN Esmv2.dbo.HirNodes hn ON
    u.HirNode = hn.HirNode
WHERE 
    (CASE @NLevel 
    WHEN 'ENT' THEN hn.HirNodLevel1  
    WHEN 'SVP' THEN hn.HirNodLevel2 
    WHEN 'DVP' THEN hn.HirNodLevel3 
    WHEN 'RVP' THEN hn.HirNodLevel4 
    WHEN 'SRM' THEN hn.HirNodLevel5 
    WHEN 'RM' THEN hn.HirNodLevel6
    WHEN 'AM' THEN hn.HirNodLevel7  
    WHEN 'SiteName' THEN hn.HirNodLevel8
    ELSE '' END) IN (@NName)
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

--select * from #Hierarchy

SELECT 
cast([HcmEVSStandardMetric] as decimal (18,3)) as HcmEVSStandardMetric,
hcm.[FscYear] as FscYear,
CASE WHEN hcmt.HcmEVSMetricType = 70 THEN 1 ELSE 2 End as HcmEVSsmTypeID,
[HcmEVSmtTitle] as HcmEVSsmTypeDesc,
cast([HcmEVSsmRTA30] /100 as decimal (18,3)) as HcmEVSsmRTA30,
cast([HcmEVSsmRTC60]/100 as decimal (18,3)) as HcmEVSsmRTC60,
cast([HcmEVSsmTotalTurnTime]/100 as decimal (18,3)) as HcmEVSsmTotalTurnTime,
cast([HcmEVSsmVacancies] as decimal (18,3)) as [HcmEVSsmVacancies],
cast([HcmEVSsmSquareFeetPerProductiveManHour] as decimal (18,3)) as [HcmEVSsmSquareFeetPerProductiveManHour],
cast([HcmEVSsmCostPerAPD] as decimal (18,3)) as [HcmEVSsmCostPerAPD],
cast([HcmEVSsmProductiveHoursWorkedPerAPD] as decimal (18,3)) as HcmEVSsmProductiveHoursWorkedPerAPD
FROM dbo.HcmEVSMetrics hcm
INNER JOIN dbo.HcmEVSMetricTypes hcmt
ON hcmt.HcmEVSMetricType in ( 70,71) --Best in class, Target in-house
INNER JOIN [dbo].[HcmEVSStandardMetrics] hsm
ON hsm.HcmEVSMetricType = hcmt.HcmEVSMetricType AND
   hsm.FscYear = hcm.FscYear
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear AND 
      hcm.HcmPTTaskManagementSystem <>5--IN (1,2) 
	  AND
	   (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy)
UNION
SELECT 
3.000 as HcmEVSStandardMetric,
hcm.[FscYear] as FscYear,
3 as HcmEVSsmTypeID,
'Missed' as HcmEVSsmTypeDesc,
cast(HcmEVSsmRTA30 /100 as decimal (18,3)) - .001 as HcmEVSsmRTA30,
cast(HcmEVSsmRTC60 /100 as decimal (18,3)) - .001 as HcmEVSsmRTC60,
cast(HcmEVSsmTotalTurnTime as decimal (18,3)) - .01  as HcmEVSsmTotalTurnTime,
cast(HcmEVSsmVacancies as decimal (18,3)) + .01  as HcmEVSsmVacancies,
cast(HcmEVSsmSquareFeetPerProductiveManHour as decimal (18,3)) - .01  as HcmEVSsmSquareFeetPerProductiveManHour,
cast(HcmEVSsmCostPerAPD as decimal (18,3)) + .01 as HcmEVSsmCostPerAPD,
cast(HcmEVSsmProductiveHoursWorkedPerAPD as decimal (18,3)) + .01 as HcmEVSsmProductiveHoursWorkedPerAPD
FROM TeamFinv2.dbo.HcmEVSMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON hcmt.HcmEVSMetricType = 71 --Target
INNER JOIN TeamFinv2.dbo.HcmEVSStandardMetrics hsm
ON hsm.HcmEVSMetricType = hcmt.HcmEVSMetricType AND
   hsm.FscYear = hcm.FscYear
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear AND 
      hcm.HcmPTTaskManagementSystem <>5 --IN (1,2) 
	  AND
	   (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy)
UNION
SELECT 
cast([HcmEVSStandardMetric] as decimal (18,3)) as HcmEVSStandardMetric,
hcm.[FscYear] as FscYear,
CASE WHEN hcmt.HcmEVSMetricType = 72 THEN 1 ELSE 2 End as HcmEVSsmTypeID,
[HcmEVSmtTitle] as HcmEVSsmTypeDesc,
cast([HcmEVSsmRTA30] /100 as decimal (18,3)) as HcmEVSsmRTA30,
cast([HcmEVSsmRTC60]/100 as decimal (18,3)) as HcmEVSsmRTC60,
cast([HcmEVSsmTotalTurnTime]/100 as decimal (18,3)) as HcmEVSsmTotalTurnTime,
cast([HcmEVSsmVacancies] as decimal (18,3)) as [HcmEVSsmVacancies],
cast([HcmEVSsmSquareFeetPerProductiveManHour] as decimal (18,3)) as [HcmEVSsmSquareFeetPerProductiveManHour],
cast([HcmEVSsmCostPerAPD] as decimal (18,3)) as [HcmEVSsmCostPerAPD],
cast([HcmEVSsmProductiveHoursWorkedPerAPD] as decimal (18,3)) as HcmEVSsmProductiveHoursWorkedPerAPD
FROM TeamFinv2.dbo.HcmEVSMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON hcmt.HcmEVSMetricType in ( 72, 73) --Best in Class, Target for Teletracking facilities
INNER JOIN TeamFinv2.dbo.HcmEVSStandardMetrics hsm
ON hsm.HcmEVSMetricType = hcmt.HcmEVSMetricType AND
   hsm.FscYear = hcm.FscYear
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear AND 
      hcm.HcmPTTaskManagementSystem=5 -- NOT IN (1,2) 
	  AND
	   (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy)
UNION
SELECT 
3.000 as HcmEVSStandardMetric,
hcm.[FscYear] as FscYear,
3 as HcmEVSsmTypeID,
'Missed' as HcmEVSsmTypeDesc,
cast(HcmEVSsmRTA30 /100 as decimal (18,3)) - .001 as HcmEVSsmRTA30,
cast(HcmEVSsmRTC60 /100 as decimal (18,3)) - .001 as HcmEVSsmRTC60,
cast(HcmEVSsmTotalTurnTime as decimal (18,3)) - .01  as HcmEVSsmTotalTurnTime,
cast(HcmEVSsmVacancies as decimal (18,3)) + .01  as HcmEVSsmVacancies,
cast(HcmEVSsmSquareFeetPerProductiveManHour as decimal (18,3)) - .01  as HcmEVSsmSquareFeetPerProductiveManHour,
cast(HcmEVSsmCostPerAPD as decimal (18,3)) + .01 as HcmEVSsmCostPerAPD,
cast(HcmEVSsmProductiveHoursWorkedPerAPD as decimal (18,3)) + .01 as HcmEVSsmProductiveHoursWorkedPerAPD
FROM TeamFinv2.dbo.HcmEVSMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON hcmt.HcmEVSMetricType = 73 --Target
INNER JOIN TeamFinv2.dbo.HcmEVSStandardMetrics hsm
ON hsm.HcmEVSMetricType = hcmt.HcmEVSMetricType AND
   hsm.FscYear = hcm.FscYear
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
WHERE hcm.FscYear = @NFscYear AND 
      hcm.HcmPTTaskManagementSystem =5 --NOT IN (1,2) 
	  AND
	   (CASE @NLevel 
	   WHEN 'ENT' THEN hn.HirNodLevel1
	   WHEN 'SVP' THEN hn.HirNodLevel2
	   WHEN 'DVP' THEN hn.HirNodLevel3
	   WHEN 'RVP' THEN hn.HirNodLevel4
	   WHEN 'SRM' THEN hn.HirNodLevel5
	   WHEN 'RM' THEN hn.HirNodLevel6
	   WHEN 'AM' THEN hn.HirNodLevel7
	   WHEN 'SiteName' THEN hn.HirNodLevel8
	   ELSE '' END) IN (@NName) AND
	   au.AppUniBrief IN (
		  SELECT HouseCode FROM #Hierarchy)
ORDER BY [HcmEVSsmTypeID]

DROP TABLE #Hierarchy

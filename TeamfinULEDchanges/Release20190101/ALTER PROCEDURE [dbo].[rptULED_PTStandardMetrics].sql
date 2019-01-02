USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptULED_PTStandardMetrics]    Script Date: 12/24/2018 10:17:08 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[rptULED_PTStandardMetrics]
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
DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
SET @NFscYear = 8
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '11063 - San Joaquin Community Hospital PT'
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
cast([HcmPTStandardMetric] as decimal (18,3)) as HcmPTStandardMetric,
hcm.[FscYear] as FscYear,
CASE WHEN hcmt.HcmPTMetricType = 21 
     THEN 1
     ELSE 2 
End as HcmPtsmTypeID,
[HcmPtmtTitle] as HcmPtsmTypeDesc,
cast([HcmPtsmOnTimeScheduled] /100 as decimal (18,3)) as HcmPtsmOnTimeScheduled,
cast([HcmPtsmRTA10] /100 as decimal (18,3)) as HcmPtsmRTA10,
cast([HcmPtsmDTC20]/100 as decimal (18,3)) as HcmPtsmDTC20,
cast([HcmPtsmRTC30]/100 as decimal (18,3)) as HcmPtsmRTC30,
CASE WHEN hcmt.HcmPTMetricType=21 THEN cast(ISNULL(hcm.HcmPtmBudgetedTPPH+.01,[HcmPtsmTPPH]) as decimal (18,3)) 
	 WHEN hcmt.HcmPTMetricType=22 THEN cast(ISNULL(hcm.HcmPtmBudgetedTPPH,[HcmPtsmTPPH]) as decimal (18,3))  END as HcmPtsmTPPH,
cast([HcmPtsmTPPD] as decimal (18,3)) as HcmPtsmTPPD,
cast([HcmPtsmITPPD] as decimal (18,3)) as HcmPtsmITPPD,
cast([HcmPtsmCancellation]/100 as decimal (18,3)) as HcmPtsmCancel,
cast([HcmPtsmDelay]/100 as decimal (18,3)) as HcmPtsmDelay,
cast([HcmPtsmDischarges]/100 as decimal (18,3)) as HcmPtsmPctDischarge
FROM TeamFinv2.dbo.HcmPTMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmPTMetricTypes hcmt
ON hcmt.HcmPTMetricType in ( 21, 22)
INNER JOIN TeamFinv2.dbo.HcmPTStandardMetrics hsm
ON hsm.HcmPTMetricType = hcmt.HcmPTMetricType AND
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
3.000 as HcmPTStandardMetric,
hcm.[FscYear] as FscYear,
3 as HcmPtsmTypeID,
'Missed' as HcmPtsmTypeDesc,
cast([HcmPtsmOnTimeScheduled] /100 as decimal (18,3)) - .001  as HcmPtsmOnTimeScheduled,
cast([HcmPtsmRTA10] /100 as decimal (18,3)) - .001 as HcmPtsmRTA10,
cast([HcmPtsmDTC20] /100 as decimal (18,3)) - .001 as HcmPtsmDTC20,
cast([HcmPtsmRTC30] /100 as decimal (18,3)) - .001 as HcmPtsmRTC30,
cast(ISNULL(hcm.HcmPtmBudgetedTPPH,[HcmPtsmTPPH]) as decimal (18,3))  - .01  as HcmPtsmTPPH,
cast([HcmPtsmTPPD] as decimal (18,3)) - .01  as HcmPtsmTPPD,
cast([HcmPtsmITPPD] as decimal (18,3)) - .01  as HcmPtsmITPPD,
cast([HcmPtsmCancellation] /100 as decimal (18,3)) + .001 as HcmPtsmCancel,
cast([HcmPtsmDelay] /100 as decimal (18,3)) + .001 as HcmPtsmDelay,
cast([HcmPtsmDischarges] /100 as decimal (18,3)) - .001 as HcmPtsmPctDischarge
FROM TeamFinv2.dbo.HcmPTMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmPTMetricTypes hcmt
ON hcmt.HcmPTMetricType = 22
INNER JOIN TeamFinv2.dbo.HcmPTStandardMetrics hsm
ON hsm.HcmPTMetricType = hcmt.HcmPTMetricType AND
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
cast([HcmPTStandardMetric] as decimal (18,3)) as HcmPTStandardMetric,
hcm.[FscYear] as FscYear,
CASE WHEN hcmt.HcmPTMetricType = 23 
     THEN 1
     ELSE 2 
End as HcmPtsmTypeID,
[HcmPtmtTitle] as HcmPtsmTypeDesc,
cast([HcmPtsmOnTimeScheduled] /100 as decimal (18,3)) as HcmPtsmOnTimeScheduled,
cast([HcmPtsmRTA10] /100 as decimal (18,3)) as HcmPtsmRTA10,
cast([HcmPtsmDTC20]/100 as decimal (18,3)) as HcmPtsmDTC20,
cast([HcmPtsmRTC30]/100 as decimal (18,3)) as HcmPtsmRTC30,
CASE WHEN hcmt.HcmPTMetricType=23 THEN cast(ISNULL(hcm.HcmPtmBudgetedTPPH+.01,[HcmPtsmTPPH]) as decimal (18,3)) 
	 WHEN hcmt.HcmPTMetricType=24 THEN cast(ISNULL(hcm.HcmPtmBudgetedTPPH,[HcmPtsmTPPH]) as decimal (18,3))  END as HcmPtsmTPPH,
cast([HcmPtsmTPPD] as decimal (18,3)) as HcmPtsmTPPD,
cast([HcmPtsmITPPD] as decimal (18,3)) as HcmPtsmITPPD,
cast([HcmPtsmCancellation]/100 as decimal (18,3)) as HcmPtsmCancel,
cast([HcmPtsmDelay]/100 as decimal (18,3)) as HcmPtsmDelay,
cast([HcmPtsmDischarges]/100 as decimal (18,3)) as HcmPtsmPctDischarge
FROM TeamFinv2.dbo.HcmPTMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmPTMetricTypes hcmt
ON hcmt.HcmPTMetricType in ( 23, 24)
INNER JOIN TeamFinv2.dbo.HcmPTStandardMetrics hsm
ON hsm.HcmPTMetricType = hcmt.HcmPTMetricType AND
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
3.000 as HcmPTStandardMetric,
hcm.[FscYear] as FscYear,
3 as HcmPtsmTypeID,
'Missed' as HcmPtsmTypeDesc,
cast([HcmPtsmOnTimeScheduled] /100 as decimal (18,3)) - .001  as HcmPtsmOnTimeScheduled,
cast([HcmPtsmRTA10] /100 as decimal (18,3)) - .001 as HcmPtsmRTA10,
cast([HcmPtsmDTC20] /100 as decimal (18,3)) - .001 as HcmPtsmDTC20,
cast([HcmPtsmRTC30] /100 as decimal (18,3)) - .001 as HcmPtsmRTC30,
cast(ISNULL(hcm.HcmPtmBudgetedTPPH,[HcmPtsmTPPH]) as decimal (18,3))  - .01  as HcmPtsmTPPH,
cast([HcmPtsmTPPD] as decimal (18,3)) - .01  as HcmPtsmTPPD,
cast([HcmPtsmITPPD] as decimal (18,3)) - .01  as HcmPtsmITPPD,
cast([HcmPtsmCancellation] /100 as decimal (18,3)) + .001 as HcmPtsmCancel,
cast([HcmPtsmDelay] /100 as decimal (18,3)) + .001 as HcmPtsmDelay,
cast([HcmPtsmDischarges] /100 as decimal (18,3)) - .001 as HcmPtsmPctDischarge
FROM TeamFinv2.dbo.HcmPTMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmPTMetricTypes hcmt
ON hcmt.HcmPTMetricType = 24
INNER JOIN TeamFinv2.dbo.HcmPTStandardMetrics hsm
ON hsm.HcmPTMetricType = hcmt.HcmPTMetricType AND
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
ORDER BY [HcmPtsmTypeID]

DROP TABLE #Hierarchy

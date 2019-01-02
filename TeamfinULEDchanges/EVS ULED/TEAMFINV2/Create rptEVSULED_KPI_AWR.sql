USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[[rptEVSULED_KPI_AWR]]    Script Date: 7/2/2018 3:10:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_KPI_AWR]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
)
AS


/*
DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
DECLARE @NFscPeriod INT
SET @NFscYear = 7
SET @NFscPeriod = 80
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '1859 St Lukes Hospital'
*/
SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

DECLARE @CurrentStartDate DATETIME
DECLARE @CurrentEndDate DATETIME
DECLARE @PriorStartDate DATETIME
DECLARE @PriorEndDate DATETIME
DECLARE @PriorFscYear INT
DECLARE @CurrentPeriodTitle INT
DECLARE @CurrentYearTitle INT
DECLARE @PriorYearTitle INT

SET @CurrentPeriodTitle = (Select FscPerTitle from TeamfinV2.dbo.FscPeriods where FscPeriod = @NFscPeriod)

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
    GrpType.AppUniBrief AS AppUniBrief,
    GrpType.AppUniDescription AS AppUniDescription,
    GrpType.HirNode as HirNode,
	GrpType.GroupDescription as GroupDescription,
	GrpType.Period AS Period,
	Sum(BudgetedAWR) AS BudgetedAWR,
	Sum(ExperiencedAWR) AS ExperiencedAWR
FROM 
(
SELECT au.AppUniBrief as AppUniBrief, 
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
	   'Current Wage Rate Analysis' as GroupDescription,
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   hcmd.BudgetedAWR as BudgetedAWR,
	   0 as ExperiencedAWR
	   
FROM 
TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot
(BudgetedAWR for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSmetricTypes hcmp
ON  hcmp.HcmEVSmetricType = hcmd.HcmEVSmetricType
AND hcmp.hcmEVSmtSubType='EVS Statistics' AND hcmp.HcmEVSmtDescription = 'Budgeted AWR' AND hcmp.HcmEVSmtActive= 1 
INNER JOIN TeamFinv2.dbo.HcmEVSmetrics hcm
ON hcmd.HcmEVSmetric = hcm.HcmEVSmetric
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
inner join TeamFinv2.dbo.HcmServiceLines hcs
ON hcs.HcmServiceLine = hc.HcmServiceLine
WHERE hcm.FscYear = @NFscYear
and Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = @CurrentPeriodTitle AND
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

SELECT au.AppUniBrief as AppUniBrief, 
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
	   'Current Wage Rate Analysis' as GroupDescription,
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as BudgetedAWR,
	   hcmd.ExperiencedAWR as ExperiencedAWR
FROM 
TeamFinv2.dbo.HcmEVSmetricNumericDetails
Unpivot
(ExperiencedAWR for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSmetricTypes hcmp
ON  hcmp.HcmEVSmetricType = hcmd.HcmEVSmetricType
AND hcmp.hcmEVSmtSubType='EVS Statistics' AND hcmp.HcmEVSmtDataType='Decimal'  
AND hcmp.HcmEVSmtDescription = 'Experienced AWR' AND hcmp.HcmEVSmtActive= 1 
INNER JOIN TeamFinv2.dbo.HcmEVSmetrics hcm
ON hcmd.HcmEVSmetric = hcm.HcmEVSmetric
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
inner join TeamFinv2.dbo.HcmServiceLines hcs
ON hcs.HcmServiceLine = hc.HcmServiceLine
WHERE hcm.FscYear = @NFscYear
and Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = @CurrentPeriodTitle AND
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

	) GrpType
GROUP BY
    GrpType.AppUniBrief,
    GrpType.AppUniDescription,
    GrpType.HirNode,
	GrpType.GroupDescription,
	GrpType.Period

DROP TABLE #Hierarchy

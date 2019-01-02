USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_LaborControl]    Script Date: 7/5/2018 12:16:21 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_LaborControl]
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
Dataset:  LaborControl for EVS ULED REPORT

-------------------------------------------
DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
DECLARE @NFscPeriod INT
SET @NFscYear = 7
SET @NFscPeriod = 80
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
--SET @NName = '11063 - San Joaquin Community Hospital PT'
SET @NName = '1859 St Lukes Hospital'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

DECLARE @FscPerTitle INT
SELECT @FscPerTitle = FscPerTitle FROM TeamFinv2..FscPeriods WHERE [FscPeriod] = @NFscPeriod

--select @PerTitle

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

DECLARE @HousePeriodTable TABLE (HouseCode VARCHAR(16) NOT NULL,
                                 HirNode [int] NOT NULL,
                                 FscYear  [int] NOT NULL,
                                 FscPeriod [int] NOT NULL,
							     FscPerTitle [int] NOT NULL
                                 PRIMARY KEY (HouseCode,HirNode, FscYear,FscPeriod,FscPerTitle)) 

INSERT INTO @HousePeriodTable
SELECT hg.HouseCode AS HouseCode,
       hg.HirNode AS HirNode,
       fp.FscYear AS FscYear,
       fp.FscPeriod AS FscPeriod,
	   fp.FscPerTitle AS FscPerTitle
FROM #Hierarchy hg
Inner JOIN dbo.FscPeriods fp
ON fp.FscYear = @NFscYear
ORDER BY
      hg.HouseCode,
	  hg.HirNode,
      fp.FscYear DESC,
      fp.FscPeriod DESC, 
	  fp.FscPerTitle DESC


--Select * from @HousePeriodTable

SELECT
	p.AppUniBrief, 
	p.AppUniDescription,
	p.HirNode,
	p.Period,
	Sum(p.Actual) AS Actual,
	Sum(p.Budget) AS Budget,
	Sum(p.Actual) - Sum(p.Budget) AS Variance,
	Sum(p.ProductiveActualHours) as ProductiveActualHours,
	Sum(p.OvertimeActualHours) as OvertimeActualHours,
	max(p.Comment) AS Comment
FROM
(
	SELECT
		au.AppUniBrief as AppUniBrief, 
		au.AppUniDescription as AppUniDescription,
		au.HirNode as HirNode,
		'1' as TransType, --Actual
		Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
		hcmd.LaborAmount as Actual,
		0 as Budget,
		0 as Variance,
		0 as ProductiveActualHours,
		0 as OvertimeActualHours,
		'' as Comment
	FROM TeamFinv2.dbo.HcmEVSMetricNumericDetails with (nolock)
	Unpivot
		(
			LaborAmount for Detail in
				(
					HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
					HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
		) as hcmd
	INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmp with (nolock)
		ON  hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
		AND hcmp.HcmEVSMetricType
			IN(
				26, --Actual Productive Dollars
				28 --Actual Overtime Dollars
				)
		AND hcmp.HcmEVSmtActive= 1 
	INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm
	ON hcmd.HcmEVSMetric = hcm.HcmEVSMetric
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
	ON hc.HcmHouseCode = hcm.HcmHouseCode
	INNER JOIN ESMv2.dbo.AppUnits au
	ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn
	ON hn.HirNode = au.HirNode
	inner join TeamFinv2.dbo.HcmServiceLines hcs
	ON hcs.HcmServiceLine = hc.HcmServiceLine
	WHERE hcm.FscYear = @NFscYear AND 
		  Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) <= @FscPerTitle AND
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
		au.AppUniBrief as AppUniBrief, 
		au.AppUniDescription as AppUniDescription,
		au.HirNode as HirNode,
		'2' as TransType, --Budget
		Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
		0 as Actual,
		hcmd.LaborAmount as Budget,
		0 as Variance,
		0 as ProductiveActualHours,
		0 as OvertimeActualHours,
		'' as Comment
	FROM TeamFinv2.dbo.HcmEVSMetricNumericDetails with (nolock)
	Unpivot
		(
			LaborAmount for Detail in
				(
					HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
					HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
		) as hcmd
	inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmp
		ON  hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
		AND hcmp.HcmEVSMetricType
			IN(
				25, --Budget Productive Dollars
				27--Budget Overtime Dollars
			   )
		AND hcmp.HcmEVSmtActive= 1 
	INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm
		ON hcmd.HcmEVSMetric = hcm.HcmEVSMetric
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
		ON hc.HcmHouseCode = hcm.HcmHouseCode
	INNER JOIN ESMv2.dbo.AppUnits au
		ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn
		ON hn.HirNode = au.HirNode
	INNER JOIN TeamFinv2.dbo.HcmServiceLines hcs
		ON hcs.HcmServiceLine = hc.HcmServiceLine
	WHERE hcm.FscYear = @NFscYear AND 
		  Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) <= @FscPerTitle AND
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
		   '3' as TransType, --Comments
		   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
		   0 as Actual,
		   0 as Budget,
		   0 as Variance,
		   0 as ProductiveActualHours,
		   0 as OvertimeActualHours,
		   hcmd.Comment as Comment
	FROM 
	TeamFinv2.dbo.HcmEVSMetricTextDetails
	Unpivot
	(Comment for Detail in (HcmEVSmtdPeriod1, HcmEVSmtdPeriod2, HcmEVSmtdPeriod3, HcmEVSmtdPeriod4, HcmEVSmtdPeriod5, HcmEVSmtdPeriod6,
								HcmEVSmtdPeriod7, HcmEVSmtdPeriod8, HcmEVSmtdPeriod9, HcmEVSmtdPeriod10, HcmEVSmtdPeriod11, HcmEVSmtdPeriod12) )
	as hcmd
	inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmt
	ON  hcmt.HcmEVSMetricType = hcmd.HcmEVSMetricType
	AND hcmt.hcmEVSmtSubType='Labor Control'
	AND hcmt.HcmEVSmtBrief = 'Comments'
	AND hcmt.HcmEVSmtDataType='Text'
	AND hcmt.HcmEVSmtActive= 1 
	INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm
	ON hcmd.HcmEVSMetric = hcm.HcmEVSMetric
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
	ON hc.HcmHouseCode = hcm.HcmHouseCode
	INNER JOIN ESMv2.dbo.AppUnits au
	ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn
	ON hn.HirNode = au.HirNode
	inner join TeamFinv2.dbo.HcmServiceLines hcs
	ON hcs.HcmServiceLine = hc.HcmServiceLine
	WHERE hcm.FscYear = @NFscYear AND 
		  Cast(SUBSTRING(Detail,16, 2)as integer) <= @FscPerTitle AND
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
		au.AppUniBrief as AppUniBrief, 
		au.AppUniDescription as AppUniDescription,
		au.HirNode as HirNode,
		'4' as TransType, --OvertimevsProductive
		Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
		0 as Actual,
		0 as Budget,
		0 as Variance,
		0 as ProductiveActualHours,
		ISNULL(OvertimeActualHours,0) as OvertimeActualHours,
		'' as Comment
	FROM TeamFinv2.dbo.HcmEVSMetricNumericDetails with (nolock)
	Unpivot
		(
			OvertimeActualHours for Detail in
				(
					HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
					HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
		) as hcmd
	INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmp with (nolock) ON hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
		AND hcmp.HcmEVSMetricType=22 --Overtime Actual Hours
		AND hcmp.HcmEVSmtActive= 1
	INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm
	ON hcmd.HcmEVSMetric = hcm.HcmEVSMetric
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
	ON hc.HcmHouseCode = hcm.HcmHouseCode
	INNER JOIN ESMv2.dbo.AppUnits au
	ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn
	ON hn.HirNode = au.HirNode
	inner join TeamFinv2.dbo.HcmServiceLines hcs
	ON hcs.HcmServiceLine = hc.HcmServiceLine
	WHERE hcm.FscYear = @NFscYear AND 
		  Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) <= @FscPerTitle AND
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
		au.AppUniBrief as AppUniBrief, 
		au.AppUniDescription as AppUniDescription,
		au.HirNode as HirNode,
		'4' as TransType, --OvertimevsProductive
		Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
		0 as Actual,
		0 as Budget,
		0 as Variance,
		ISNULL(ProductiveActualHours,0) as ProductiveActualHours,
		0 as OvertimeActualHours,
		'' as Comment
	FROM TeamFinv2.dbo.HcmEVSMetricNumericDetails with (nolock)
	Unpivot
		(
			ProductiveActualHours for Detail in
				(
					HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
					HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
				)
		) as hcmd
	INNER JOIN TeamFinv2.dbo.HcmEVSMetricTypes hcmp with (nolock) ON hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
		AND hcmp.HcmEVSMetricType=20 --Productive Actual Hours
		AND hcmp.HcmEVSmtActive= 1
	INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm
	ON hcmd.HcmEVSMetric = hcm.HcmEVSMetric
	INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
	ON hc.HcmHouseCode = hcm.HcmHouseCode
	INNER JOIN ESMv2.dbo.AppUnits au
	ON au.HirNode = hc.HirNode
	INNER JOIN Esmv2..HirNodes hn
	ON hn.HirNode = au.HirNode
	inner join TeamFinv2.dbo.HcmServiceLines hcs
	ON hcs.HcmServiceLine = hc.HcmServiceLine
	WHERE hcm.FscYear = @NFscYear AND 
		  Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) <= @FscPerTitle AND
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
		   '5' as TransType, --Pad zeroes
		   hpt.FscPerTitle as Period,
		   0 as Actual,
		   0 as Budget,
		   0 as Variance,		
		   1 as ProductiveActualHours,
		   0 as OvertimeActualHours,
		   '' as Comment
	FROM @HousePeriodTable hpt
	INNER JOIN ESMv2.dbo.AppUnits au
	ON au.HirNode = hpt.HirNode
	INNER JOIN Esmv2..HirNodes hn
	ON hn.HirNode = au.HirNode

	

) p
GROUP BY
p.AppUniBrief, 
p.AppUniDescription,
p.HirNode,
p.Period


DROP TABLE #Hierarchy

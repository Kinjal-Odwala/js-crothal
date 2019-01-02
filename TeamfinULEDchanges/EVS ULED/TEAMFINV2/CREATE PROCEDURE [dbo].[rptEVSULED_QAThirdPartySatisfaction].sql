USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_QAThirdPartySatisfaction]    Script Date: 8/9/2018 7:43:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_QAThirdPartySatisfaction]
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

SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '48660 - Milford Memorial Hospital'
SET @NFscYear = 9
SET @NFscPeriod = 103
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
AND fp.FscPeriod = @NFscPeriod  
ORDER BY
      hg.HouseCode,
	  hg.HirNode,
      fp.FscYear DESC,
      fp.FscPeriod DESC, 
	  fp.FscPerTitle DESC

--Select * from @HousePeriodTable

declare @Housecode varchar(10)
set @Housecode = (Select distinct Housecode from @HousePeriodTable)

--We are finding the Survey vendor for facility
declare @scoretype varchar(100)
set @scoretype=(
			select ISNULL([HcmEvsmtTitle],' ')
			from  [dbo].[HcmEVSMetrics] hcm
			INNER JOIN [dbo].[HcmEVSMetricTypes] hcmt
			ON hcm.[HcmEvsmThirdPartySatisfaction]=hcmt.HcmEVSMetrictype
			INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
			ON hc.HcmHouseCode = hcm.HcmHouseCode
			INNER JOIN ESMv2.dbo.AppUnits au
			ON au.HirNode = hc.HirNode
			INNER JOIN Esmv2..HirNodes hn
			ON hn.HirNode = au.HirNode
			INNER JOIN TeamFinv2.dbo.HcmServiceLines hcs
			ON hcs.HcmServiceLine = hc.HcmServiceLine
			WHERE hcm.FscYear = @NFscYear
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
				)
set @scoretype=ISNULL(@scoretype,'Third Party')

declare @CurrentPeriodStartDate datetime
set @CurrentPeriodStartDate=(select distinct FscPerStartDate 
							from Fscperiods where FscPeriod=@NFscPeriod)

--Pulling National and State level Averages for HCAHPS scoring done by CMS. We dont have this data for other vendors.
declare @NationalAverage decimal(10,2)
declare @StateAverage decimal(10,2)
set @NationalAverage=(
					SELECT avg(CONVERT(INT, CONVERT(VARCHAR(12), [HCAHPS Answer Percent]))) NationalAverage
					FROM [CMS_DW].[dbo].[HQI_NATIONAL_HCAHPS] a
					inner join 
					(select [HCAHPS Measure ID],max([measure start date]) maxdate 
					from [CMS_DW].[dbo].[HQI_NATIONAL_HCAHPS] group by [HCAHPS Measure ID]) b
					on a.[HCAHPS Measure ID]=b.[HCAHPS Measure ID] and a.[measure start date]=b.maxdate
					where a.[HCAHPS Measure ID] in ('H_CLEAN_HSP_A_P') --Patients who reported that their room and bathroom were "Always" clean
					)

set @StateAverage=(
				  SELECT avg(CONVERT(INT, CONVERT(VARCHAR(12), [HCAHPS Answer Percent]))) StateAverage
				  FROM [CMS_DW].[dbo].[HQI_STATE_HCAHPS] a
					inner join 
					(select [HCAHPS Measure ID],max([measure start date]) maxdate 
					from [CMS_DW].[dbo].[HQI_STATE_HCAHPS] group by [HCAHPS Measure ID]) b
					on (a.[HCAHPS Measure ID]=b.[HCAHPS Measure ID] and a.[measure start date]=b.maxdate)
				    inner join [dbo].rptMrkSiteSetup c
				    on a.state=c.pristate 
				    where c.[housecode] = @Housecode --Hardcoded for 48660-Milford Memorial Hospital
				    and a.[HCAHPS Measure ID] in ('H_CLEAN_HSP_A_P')
				    and ISNUMERIC(CONVERT(VARCHAR(12), [HCAHPS Answer Percent]))=1
				)



SELECT p.AppUniBrief, 
       p.AppUniDescription,
	   p.HirNode,
	   p.SortOrder,
	   p.ThirdPartyGroup,
	   p.Period,
	   max(p.[Target]) AS [Target],
	   sum(p.[Current])  AS [Current],
	   sum(p.YTD)  AS YTD,
	   max(p.StateAverage) AS StateAverage,
	   max(p.NationalAverage) AS NationalAverage,
	   max(p.PercentileRank) AS PercentileRank
FROM (
--CMS-HCAHPS
SELECT au.AppUniBrief as AppUniBrief, 
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
		1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '0' as TransType, --Target
	   fp.FscPerTitle as Period,
	   0 as [Target],
	   0 as [Current],
	   0 as YTD,
	   ISNULL(@stateaverage,0) as StateAverage,
	   ISNULL(@NationalAverage,0) as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM TeamFinv2.dbo.HcmEVSMetrics hcm
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc
ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
INNER JOIN TeamFinv2.dbo.HcmServiceLines hcs
ON hcs.HcmServiceLine = hc.HcmServiceLine
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
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
		1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '1' as TransType, --Target
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   case when @scoretype='HCAHPS' then ISNULL(hcmd.HCAHPSTarget,0) else 0 end as [Target],
	   0 as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM [TeamFinv2].[dbo].[HcmEVSMetricNumericDetails]
Unpivot
(HCAHPSTarget for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmp
ON  (hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmp.HcmEVSMetricType=32) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Target'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
		1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '1' as TransType, --Target
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   case when @scoretype='HCAHPS' then ISNULL(hcmd.HCAHPSTarget,0) else 0 end as [Target],
	   0 as [Current],
	   0 as YTD,
	   ISNULL(@stateaverage,0) as StateAverage,
	   ISNULL(@NationalAverage,0) as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM [TeamFinv2].[dbo].[HcmEVSMetricNumericDetails]
Unpivot
(HCAHPSTarget for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmp
ON  (hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmp.HcmEVSMetricType=32) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Target'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '2' as TransType, --Current
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as [Target],
	   case when @scoretype='HCAHPS' then isnull(hcmd.[Current],0) else 0 end as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM 
TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot
([Current] for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON  (hcmt.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmt.HcmEVSMetricType=33) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Current'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '3' as TransType, --YTD
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as [Target],
	   0 as [Current],
	   case when @scoretype='HCAHPS' then isnull(hcmd.YTD,0) else 0 end as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM 
TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot
(YTD for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON  (hcmt.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmt.HcmEVSMetricType=34) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - YTD'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '4' as TransType,
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as [Target],
	   0 as [Current],
	   0 as YTD,
	   0 as stateaverage,
	   0 as nationalaverage,
	   case when @scoretype='HCAHPS' then isnull(hcmd.PercentileRank,0) else 0 end as PercentileRank,
	   fp.FscPerTitle
FROM 
TeamFinv2.dbo.[HcmEVSMetricNumericDetails]
Unpivot
(PercentileRank for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                           HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmp
ON  (hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmp.HcmEVSMetricType=35) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Percentile Rank'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   1 as SortOrder,
	   'CMS - HCAHPS' as ThirdPartyGroup,
	   '5' as TransType, --Pad Zeroes
	   fp.FscPerTitle as Period,
	   0 as [Target],
	   0 as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM @HousePeriodTable hpt
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hpt.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
where fp.FscPeriod = @NFscPeriod

Union

--Third Party Scores
SELECT au.AppUniBrief as AppUniBrief, 
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
	   2 as SortOrder,
	   case when @scoretype<>'HCAHPS' then concat(@scoretype,'-EVS Question Only') else ' ' end as ThirdPartyGroup,
	   '1' as TransType, --Target
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   case when @scoretype<>'HCAHPS' then ISNULL(hcmd.HCAHPSTarget,0) else 0 end as [Target],
	   0 as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM [TeamFinv2].[dbo].[HcmEVSMetricNumericDetails]
Unpivot
(HCAHPSTarget for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmp
ON  (hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmp.HcmEVSMetricType=32) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Target'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   2 as SortOrder,
	   case when @scoretype<>'HCAHPS' then concat(@scoretype,'-EVS Question Only') else ' ' end as ThirdPartyGroup,
	   '2' as TransType, --Current
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as [Target],
	   case when @scoretype<>'HCAHPS' then isnull(hcmd.[Current],0) else 0 end as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM 
TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot
([Current] for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON  (hcmt.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmt.HcmEVSMetricType=33) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Current'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   2 as SortOrder,
	   case when @scoretype<>'HCAHPS' then concat(@scoretype,'-EVS Question Only') else ' ' end as ThirdPartyGroup,
	   '3' as TransType, --YTD
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as [Target],
	   0 as [Current],
	   case when @scoretype<>'HCAHPS' then isnull(hcmd.YTD,0) else 0 end as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM 
TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot
(YTD for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON  (hcmt.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmt.HcmEVSMetricType=34) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - YTD'
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   2 as SortOrder,
	   case when @scoretype<>'HCAHPS' then concat(@scoretype,'-EVS Question Only') else ' ' end as ThirdPartyGroup,
	   '4' as TransType, --Percentile Rank
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   0 as [Target],
	   0 as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   case when @scoretype<>'HCAHPS' then isnull(hcmd.PercentileRank,0) else 0 end as PercentileRank,
	   fp.FscPerTitle
FROM 
TeamFinv2.dbo.[HcmEVSMetricNumericDetails]
Unpivot
(PercentileRank for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                           HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmp
ON  (hcmp.HcmEVSMetricType = hcmd.HcmEVSMetricType
AND hcmp.HcmEVSMetricType=35) --hcmEVSmtSubType='Quality Assurance', HcmEVSmtDescription = 'Third Party Satisfaction - Percentile Rank' 
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
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
WHERE hcm.FscYear = @NFscYear AND 
      Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) = fp.FscPerTitle AND
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
	   2 as SortOrder,
	   case when @scoretype<>'HCAHPS' then concat(@scoretype,'-EVS Question Only') else ' ' end as ThirdPartyGroup,
	   '5' as TransType, --Pad Zeroes
	   fp.FscPerTitle as Period,
	   0 as [Target],
	   0 as [Current],
	   0 as YTD,
	   0 as StateAverage,
	   0 as NationalAverage,
	   0 as PercentileRank,
	   fp.FscPerTitle
FROM @HousePeriodTable hpt
INNER JOIN ESMv2.dbo.AppUnits au
ON au.HirNode = hpt.HirNode
INNER JOIN Esmv2..HirNodes hn
ON hn.HirNode = au.HirNode
INNER JOIN TeamFinv2.dbo.FscPeriods fp
ON fp.FscPeriod = @NFscPeriod
where fp.FscPeriod = @NFscPeriod
) p
GROUP BY
p.AppUniBrief, 
p.AppUniDescription,
p.HirNode,
p.SortOrder,
p.ThirdPartyGroup,
p.Period


DROP TABLE #Hierarchy


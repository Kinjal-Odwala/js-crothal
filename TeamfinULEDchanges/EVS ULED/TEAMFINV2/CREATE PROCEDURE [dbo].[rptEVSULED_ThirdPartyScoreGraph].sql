USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_ThirdPartyScoreGraph]    Script Date: 7/19/2018 11:03:51 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[rptEVSULED_ThirdPartyScoreGraph]
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
SET @NName = '1859 St Lukes Hospital'
SET @NFscYear = 7
SET @NFscPeriod = 79
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
declare @scoretype varchar(100)
set @scoretype=(
			select ISNULL([HcmEvsmtTitle],'HCAHPS')
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

--Third Party Satisfaction Score Type

SELECT au.AppUniBrief as AppUniBrief,
       au.AppUniDescription as AppUniDescription,
	   au.HirNode as HirNode,
	   ISNULL(@scoretype,'Third Party') as ThirdPartyGroup,
	   Cast(SUBSTRING(hcmd.Detail,16, 2)as integer) as Period,
	   max(isnull(hcmd.[Current],0)) as [Current]
FROM 
TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot
([Current] for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as hcmd
inner join TeamFinv2.dbo.HcmEVSMetricTypes hcmt
ON  hcmt.HcmEVSMetricType = hcmd.HcmEVSMetricType 
AND hcmt.HcmEVSMetricType=33 --hcmEVSmtSubType='Quality Assurance - EVS HCAHPS', HcmEVSmtDescription = 'Third Party Satisfaction - Current'
INNER JOIN TeamFinv2.dbo.HcmEVSMetrics hcm ON hcmd.HcmEVSMetric = hcm.HcmEVSMetric
INNER JOIN TeamFinv2.dbo.HcmHouseCodes hc ON hc.HcmHouseCode = hcm.HcmHouseCode
INNER JOIN ESMv2.dbo.AppUnits au ON au.HirNode = hc.HirNode
INNER JOIN Esmv2..HirNodes hn ON hn.HirNode = au.HirNode
INNER JOIN TeamFinv2.dbo.HcmServiceLines hcs ON hcs.HcmServiceLine = hc.HcmServiceLine
INNER JOIN TeamFinv2.dbo.FscPeriods fp ON fp.FscPeriod <= @NFscPeriod
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
GROUP BY
AppUniBrief, 
AppUniDescription,
au.HirNode,
Cast(SUBSTRING(hcmd.Detail,16, 2)as integer)

DROP TABLE #Hierarchy


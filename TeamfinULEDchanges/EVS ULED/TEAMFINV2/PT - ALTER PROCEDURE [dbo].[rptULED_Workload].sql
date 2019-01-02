USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptULED_Workload]    Script Date: 8/3/2018 8:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[rptULED_Workload]
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
DECLARE @NFscPeriod INT
SET @NFscYear = 7
SET @NFscPeriod = 80
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '1859 St Lukes Hospital'
--SET @NName ='1445 Boston Medical Center'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

DECLARE @CurrentPeriodTitle INT
DECLARE @CurrentYearTitle INT
DECLARE @NoOfDaysInYear INT

SET @CurrentYearTitle = (Select FscYeaTitle from TeamfinV2.dbo.FscYears where FscYear = @NFscYear)
SET @CurrentPeriodTitle = (Select FscPerTitle from TeamfinV2.dbo.FscPeriods where FscPeriod = @NFscPeriod)
--SELECT @CurrentYearTitle,@CurrentPeriodTitle 

SET @NoOfDaysInYear = (SELECT (Case When Day(DATEADD(YEAR,@CurrentYearTitle-1900,0)+59)=29 Then 366 else 365 end))
--SELECT @NoOfDaysInYear

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
								 FscYeaTitle [int] NOT NULL,
                                 FscPeriod [int] NOT NULL,
							     FscPerTitle [int] NOT NULL,
                                 FscPerStartDate DATETIME NOT NULL,
                                 FscPerEndDate DATETIME NOT NULL,
								 NoOfDaysInPeriod [int] NOT NULL
                                 PRIMARY KEY (HouseCode,HirNode, FscYear, FscYeaTitle,FscPeriod,FscPerTitle)) 

INSERT INTO @HousePeriodTable
SELECT hg.HouseCode AS HouseCode,
       hg.HirNode AS HirNode,
       fp.FscYear AS FscYear,
	   fy.FscYeaTitle AS FscYeaTitle,
       fp.FscPeriod AS FscPeriod,
	   fp.FscPerTitle AS FscPerTitle,
	   fp.FscPerStartDate AS FscPerStartDate,
	   fp.FscPerEndDate AS FscPerEndDate,
	   DATEPART(day, DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,fp.FscPerStartDate)+1,0))) AS NoOfDaysInPeriod

FROM #Hierarchy hg
INNER JOIN dbo.FscPeriods fp
ON fp.FscYear = @NFscYear
INNER JOIN dbo.FscYears fy
ON fy.FscYear = fp.FscYear
----ORDER BY
----      hg.HouseCode,
----	  hg.HirNode,
----      fp.FscYear DESC,
----      fp.FscPeriod DESC, 
----	  fp.FscPerTitle DESC

--select * from @HousePeriodTable

Declare @StartDate datetime
Declare @EndDate datetime
SET @StartDate = (Select Min(FscPerStartDate) from @HousePeriodTable)
SET @EndDate = (Select Max(FscPerEndDate) from @HousePeriodTable)

--select @StartDate, @EndDate
select * from
(
select
	tt.HirNode,
	[HH] As [Hour],
	[Hours] As [HourDesc],
	(cast(sum([count]) as decimal(18,4)) / cast(@NoOfDaysInYear as decimal(18,4))) * max(NoOfDaysInPeriod) as [HourCount] 
from @HousePeriodTable hpt
INNER JOIN Esmv2.dbo.AppUnits au
	ON au.AppUniBrief = hpt.HouseCode
INNER JOIN Esmv2..HirNodes hn
	ON au.HirNode = hn.HirNode
INNER JOIN CHIUSCHP341.TT_REP.dbo.steManagement mg
	ON mg.TranHouseCode = hpt.HouseCode
INNER JOIN SuperMart.dbo.HRC_TransWorkload tt
	ON mg.steHirNode = tt.Hirnode  
WHERE 
	tt.receipt >= @StartDate
	AND tt.receipt <= @EndDate
	AND hpt.FscPerTitle = @CurrentPeriodTitle
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
group by tt.HirNode, [HH], [Hours]
-------------------ADDED FOR WORKLOAD DATA FROM EXTERNAL FACILITIES------------------Richa-------
union all
select
	tt.HirNode,
	[HH] As [Hour],
	[Hours] As [HourDesc],
	(cast(sum([count]) as decimal(18,4)) / cast(@NoOfDaysInYear as decimal(18,4))) * max(NoOfDaysInPeriod) as [HourCount] 
from @HousePeriodTable hpt
INNER JOIN Esmv2.dbo.AppUnits au
	ON au.AppUniBrief = hpt.HouseCode
INNER JOIN Esmv2..HirNodes hn
	ON au.HirNode = hn.HirNode
INNER JOIN [chiuschp3024vm\PROD].[FLOW_DW_DB].[dm].[FacilityFuncAreaHouseCode] fac 
	ON fac.[House Code] = hpt.HouseCode
INNER JOIN SuperMart.dbo.FLOW_PTWorkload tt
	ON fac.facilitykey = tt.Hirnode
WHERE 
	tt.receipt >= @StartDate
	AND tt.receipt <= @EndDate
	AND hpt.FscPerTitle = @CurrentPeriodTitle
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
group by tt.HirNode, [HH], [Hours]
) a
-------------------ADDED FOR WORKLOAD DATA FROM EXTERNAL FACILITIES------------Richa-------------
Order by HirNode, [Hour], [HourDesc]

DROP TABLE #Hierarchy

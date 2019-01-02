USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_KPI_QualityControl]    Script Date: 7/10/2018 3:42:06 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[rptEVSULED_KPI_QualityControl]
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
Dataset:  QualityControl under Key Performance Section

1 Average Response Time (minutes)
2 30 Minute RTA % Time Standard
3 Average Turnaround/Bed Turn Time (minutes)
4 60 Minute RTC % Time Standard
5 Overtime as a Percentage of Productive Hours
6 Actual Productivity (Sqft. per Productive Labor Hour)
7 Performance to Hospital Budget

-------------------------------------------

DECLARE @NUserID VARCHAR(50)
DECLARE @NLevel VARCHAR(20)
DECLARE @NName VARCHAR(8000)
DECLARE @NFscYear INT
DECLARE @NFscPeriod INT
SET @NFscYear = 7
SET @NFscPeriod = 79
SET @NLevel = 'SiteName'
SET @NUserID = 'compass-usa\MartiL04'
SET @NName = '1859 St Lukes Hospital'
--SET @NName = '11000 Boston Medical Center PT'
*/

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED

DECLARE @CurrentStartDate DATETIME
DECLARE @CurrentEndDate DATETIME
DECLARE @PriorStartDate DATETIME
DECLARE @PriorEndDate DATETIME
DECLARE @PriorFscYear INT
DECLARE @PriorPeriodTitle int
DECLARE @CurrentPeriodTitle INT
DECLARE @CurrentYearTitle INT
DECLARE @PriorYearTitle INT
DECLARE @TotalPeriods INT
DECLARE @CurrentPeriodStartDate DATETIME
declare @NFscYearForPriorPeriod int
declare @PriorFscYearForPriorPeriod int


SET @CurrentYearTitle = (Select FscYeaTitle from TeamfinV2.dbo.FscYears where FscYear = @NFscYear)
SET @PriorYearTitle = @CurrentYearTitle - 1

SET @PriorFscYear = @NFscYear - 1

SET @CurrentPeriodTitle = (Select FscPerTitle from TeamfinV2.dbo.FscPeriods where FscPeriod = @NFscPeriod)
SET @PriorPeriodTitle = (Select FscPerTitle from TeamfinV2.dbo.FscPeriods where FscPeriod = @NFscPeriod-1)

SET @NFscYearForPriorPeriod =(Select FscYear from TeamfinV2.dbo.FscPeriods where FscPeriod = @NFscPeriod-1)
SET @PriorFscYearForPriorPeriod = @NFscYearForPriorPeriod-1

SET @TotalPeriods = (Select Max(FscPerTitle) from TeamfinV2.dbo.FscPeriods where FscYear = @NFscYear)

--Print @currentperiodtitle
--select @TotalPeriods

SET @CurrentStartDate = (SELECT Min(FscPerStartDate) From TeamFinv2.dbo.FscPeriods where fscyear = @NFscYear)
SET @CurrentEndDate = (SELECT Max(FscPerEndDate) From TeamFinv2.dbo.FscPeriods where fscyear = @NFscYear and FscPerTitle <= @CurrentPeriodTitle)
SET @CurrentPeriodStartDate = (SELECT Min(FscPerStartDate) From TeamFinv2.dbo.FscPeriods where fscyear = @NFscYear and FscPerTitle= @CurrentPeriodTitle)
--Print @currentperiodstartdate
--Print @currentenddate

SET @PriorStartDate = (SELECT Min(FscPerStartDate) From TeamFinv2.dbo.FscPeriods where fscyear = @PriorFscYear)
SET @PriorEndDate = (SELECT Max(FscPerEndDate) From TeamFinv2.dbo.FscPeriods where fscyear = @PriorFscYear)


--SELECT @NFscYear, @PriorFscYear, @CurrentYearTitle, @PriorYearTitle, @NFscPeriod, @CurrentPeriodTitle 
--SELECT @CurrentStartDate,@CurrentEndDate,@PriorStartDate,@PriorEndDate


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
    GrpType.SiteName AS SiteName,
    GrpType.HouseCode AS HouseCode,
    GrpType.hirNode as HireNode,
	GrpType.GroupSortOrder AS GroupSortOrder,
	GrpType.GroupDescription AS GroupDescription,
	Case when isnull(Sum(cast(GrpType.DCurrentFY as decimal(18,2))),0) = 0
	     then 0
		 else Cast(isnull(Sum(cast(GrpType.NCurrentFY as decimal(18,2))),0) / isnull(Sum(cast(GrpType.DCurrentFY as decimal(18,2))),0) as decimal (18,4))
	End	AS CurrentFY,
	 Case when isnull(Sum(cast(GrpType.DPreviousFY as decimal(18,2))),0) = 0
	      then 0
	      else Cast(isnull(Sum(cast(GrpType.NPreviousFY as decimal(18,2))),0) / isnull(Sum(cast(GrpType.DPreviousFY as decimal(18,2))),0) as decimal (18,4))
	End AS PreviousFY
	
FROM 
(

/*-------------------------------------------- Average Response Time (minutes)--------------------------------- */
	
/* CURRENT YEAR */

	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		1 AS GroupSortOrder,
		'Average Response Time (minutes)' As GroupDescription,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE sum(ISNULL(AverageResponseTime,0))
		END AS NCurrentFY,
		1 AS DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (AverageResponseTime for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
	as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and num.HcmEVSMetricType=56 and hcm.FscYear=@NFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode

	UNION 
	
/* PREVIOUS YEAR */
SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		1 AS GroupSortOrder,
		'Average Response Time (minutes)' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE sum(ISNULL(AverageResponseTime,0))
		END  AS NPreviousFY,
		1 DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (AverageResponseTime for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle
			 and num.HcmEVSMetricType=56 and hcm.FscYear=@PriorFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode

UNION 
		 
/*----------------------------------------------------------------30 Minute RTA % Time Standard---from Supermart----------------------------- */

	
	/* CURRENT YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		2 AS GroupSortOrder,
		'30 Minute RTA % Time Standard' As GroupDescription,
		ISNULL(Sum(cast(ISNULL(a.RTA30,0) as decimal(18,2))),0) AS NCurrentFY,
		ISNULL(Sum(cast(ISNULL(a.TotalDemandComplete,0) as decimal(18,2))),1) as DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
		FROM SuperMart.[dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary] a
	INNER JOIN Esmv2..AppUnits au WITH (NOLOCK)
		ON au.AppUniBrief = a.HouseCode
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK)
		ON au.HirNode = hn.HirNode
	Where  
		a.PeriodStartDate >= @CurrentStartDate
		AND a.PeriodEndDate <= @CurrentEndDate
		AND
		(
			CASE @NLevel 
				WHEN 'ENT' THEN hn.HirNodLevel1
				WHEN 'SVP' THEN hn.HirNodLevel2
				WHEN 'DVP' THEN hn.HirNodLevel3
				WHEN 'RVP' THEN hn.HirNodLevel4
				WHEN 'SRM' THEN hn.HirNodLevel5
				WHEN 'RM' THEN hn.HirNodLevel6
				WHEN 'AM' THEN hn.HirNodLevel7
				WHEN 'SiteName' THEN hn.HirNodLevel8
				ELSE ''
			END
		) IN (@NName)
		AND au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
	GROUP BY
		hn.HirNodLevel8,
		au.AppUniBrief,
		au.hirNode

		
	UNION 

	/* PREVIOUS YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		2 AS GroupSortOrder,
		'30 Minute RTA % Time Standard' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		ISNULL(Sum(cast(ISNULL(a.RTA30,0) as decimal(18,2))),0) AS NPreviousFY,
		ISNULL(Sum(cast(ISNULL(a.TotalDemandComplete,0) as decimal(18,2))),1) as DPreviousFY
		FROM SuperMart.[dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary] a
	INNER JOIN Esmv2..AppUnits au WITH (NOLOCK)
		ON au.AppUniBrief = a.HouseCode
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK)
		ON au.HirNode = hn.HirNode
	Where  
		a.PeriodStartDate >= @PriorStartDate
		AND a.PeriodEndDate <= @PriorEndDate
		AND
		(
			CASE @NLevel 
				WHEN 'ENT' THEN hn.HirNodLevel1
				WHEN 'SVP' THEN hn.HirNodLevel2
				WHEN 'DVP' THEN hn.HirNodLevel3
				WHEN 'RVP' THEN hn.HirNodLevel4
				WHEN 'SRM' THEN hn.HirNodLevel5
				WHEN 'RM' THEN hn.HirNodLevel6
				WHEN 'AM' THEN hn.HirNodLevel7
				WHEN 'SiteName' THEN hn.HirNodLevel8
				ELSE ''
			END
		) IN (@NName)
		AND au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
	GROUP BY
		hn.HirNodLevel8,
		au.AppUniBrief,
		au.hirNode
		
UNION
/*-------------------------------------------------------Average Turnaround/Bed Turn Time (minutes)---------------------------*/
	
	/* CURRENT YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		3 AS GroupSortOrder,
		'Average Turnaround/Bed Turn Time (minutes)' As GroupDescription,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE sum(ISNULL(AverageTurnaroundTime,0))
		END AS NCurrentFY,
		1 AS DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (AverageTurnaroundTime for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and num.HcmEVSMetricType=57 and hcm.FscYear=@NFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode

	UNION 
	
/* PREVIOUS YEAR */
SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		3 AS GroupSortOrder,
		'Average Turnaround/Bed Turn Time (minutes)' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE sum(ISNULL(AverageTurnaroundTime,0))
		END  AS NPreviousFY,
	    1 AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (AverageTurnaroundTime for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and num.HcmEVSMetricType=57 and hcm.FscYear=@PriorFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode
 
/*------------------------------------ 60 Minute RTC % Time Standard------------------------------------------------- */

	UNION

	/* CURRENT YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		4 AS GroupSortOrder,
		'60 Minute RTC % Time Standard' As GroupDescription,
		ISNULL(Sum(cast(ISNULL(a.RTC60,0) as decimal(18,2))),0) AS NCurrentFY,
		ISNULL(Sum(cast(ISNULL(a.TotalDemandComplete,0) as decimal(18,2))),1) as DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
	FROM SuperMart.[dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary] a
	INNER JOIN Esmv2..AppUnits au WITH (NOLOCK)
		ON au.AppUniBrief = a.HouseCode
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK)
		ON au.HirNode = hn.HirNode
	Where  
		a.PeriodStartDate >= @CurrentStartDate
		AND a.PeriodEndDate <= @CurrentEndDate
		AND
		(
			CASE @NLevel 
				WHEN 'ENT' THEN hn.HirNodLevel1
				WHEN 'SVP' THEN hn.HirNodLevel2
				WHEN 'DVP' THEN hn.HirNodLevel3
				WHEN 'RVP' THEN hn.HirNodLevel4
				WHEN 'SRM' THEN hn.HirNodLevel5
				WHEN 'RM' THEN hn.HirNodLevel6
				WHEN 'AM' THEN hn.HirNodLevel7
				WHEN 'SiteName' THEN hn.HirNodLevel8
				ELSE ''
			END
		) IN (@NName)
		AND au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
	GROUP BY
		hn.HirNodLevel8,
		au.AppUniBrief,
		au.hirNode

	UNION 

	/* PREVIOUS YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		4 AS GroupSortOrder,
		'60 Minute RTC % Time Standard' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		ISNULL(Sum(cast(ISNULL(a.RTC60,0) as decimal(18,2))),0) AS NPreviousFY,
		ISNULL(Sum(cast(ISNULL(a.TotalDemandComplete,0) as decimal(18,2))),1) as DPreviousFY
	FROM SuperMart.[dbo].[HRCFlow_Combined_EVS_ULEDData_PeriodSummary] a
	INNER JOIN Esmv2..AppUnits au WITH (NOLOCK)
		ON au.AppUniBrief = a.HouseCode
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK)
		ON au.HirNode = hn.HirNode
	Where  
		a.PeriodStartDate >= @PriorStartDate
		AND a.PeriodEndDate <= @PriorEndDate
		AND
	(
			CASE @NLevel 
				WHEN 'ENT' THEN hn.HirNodLevel1
				WHEN 'SVP' THEN hn.HirNodLevel2
				WHEN 'DVP' THEN hn.HirNodLevel3
				WHEN 'RVP' THEN hn.HirNodLevel4
				WHEN 'SRM' THEN hn.HirNodLevel5
				WHEN 'RM' THEN hn.HirNodLevel6
				WHEN 'AM' THEN hn.HirNodLevel7
				WHEN 'SiteName' THEN hn.HirNodLevel8
				ELSE ''
			END
		) IN (@NName)
		AND au.AppUniBrief IN (SELECT HouseCode FROM #Hierarchy)
	GROUP BY
		hn.HirNodLevel8,
		au.AppUniBrief,
		au.hirNode

UNION
/*---------------------------- Overtime as a Percentage of Productive Hours--------------------------- */
 
	/* CURRENT YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		5 AS GroupSortOrder,
		'Overtime as a Percentage of Productive Hours' As GroupDescription,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(OvertimeActualHours,0))
		END AS NCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(ProductivetimeActualHours,1))
		END AS DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (OvertimeActualHours for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
		   and num.HcmEVSMetricType=22 and hcm.FscYear=@NFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (ProductivetimeActualHours for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and numd.HcmEVSMetricType=20 and hcm.FscYear=@NFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode

	UNION 
	
/* PREVIOUS YEAR */
SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		5 AS GroupSortOrder,
		'Overtime as a Percentage of Productive Hours' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(OvertimeActualHours,0))
		END  AS NPreviousFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(ProductivetimeActualHours,1))
		END AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (OvertimeActualHours for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and num.HcmEVSMetricType=22 and hcm.FscYear=@PriorFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (ProductivetimeActualHours for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and numd.HcmEVSMetricType=20 and hcm.FscYear=@PriorFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode
 
UNION
/*------------------------------------Actual Productivity (Sqft. per Productive Labor Hour)--------------------------*/


	/* CURRENT YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		6 AS GroupSortOrder,
		'Actual Productivity (Sqft. per Productive Labor Hour)' As GroupDescription,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(NetCleanableSquareFt,0))
		END AS NCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(ProductiveActualLaborHours,1))
		END AS DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (NetCleanableSquareFt for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
		   and num.HcmEVSMetricType=50 and hcm.FscYear=@NFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (ProductiveActualLaborHours for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and numd.HcmEVSMetricType=20 and hcm.FscYear=@NFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode

	UNION 
	
/* PREVIOUS YEAR */
SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		6 AS GroupSortOrder,
		'Actual Productivity (Sqft. per Productive Labor Hour)' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(NetCleanableSquareFt,0))
		END  AS NPreviousFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(ProductiveActualLaborHours,1))
		END AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (NetCleanableSquareFt for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and num.HcmEVSMetricType=50 and hcm.FscYear=@PriorFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (ProductiveActualLaborHours for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
		   and numd.HcmEVSMetricType=20 and hcm.FscYear=@PriorFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode
		
/*-----------------------Performance to Hospital Budget----------------------------------------------------------------*/
	UNION

	
	/* CURRENT YEAR */
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		7 AS GroupSortOrder,
		'Performance to Hospital Budget' As GroupDescription,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(HospitalFinancialActual-HospitalFinancialBudget,0))
		END AS NCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(HospitalFinancialBudget,1))
		END AS DCurrentFY,
		0 AS NPreviousFY,
		0 AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (HospitalFinancialActual for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
		   and num.HcmEVSMetricType=55 and hcm.FscYear=@NFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (HospitalFinancialBudget for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and numd.HcmEVSMetricType=54 and hcm.FscYear=@NFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode

	UNION 
	
/* PREVIOUS YEAR */
SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		7 AS GroupSortOrder,
		'Performance to Hospital Budget' As GroupDescription,
		0 AS NCurrentFY,
		0 AS DCurrentFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(HospitalFinancialActual-HospitalFinancialBudget,0))
		END  AS NPreviousFY,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE SUM(ISNULL(HospitalFinancialBudget,1))
		END AS DPreviousFY
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (HospitalFinancialActual for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and num.HcmEVSMetricType=55 and hcm.FscYear=@PriorFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (HospitalFinancialBudget for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
		   and numd.HcmEVSMetricType=54 and hcm.FscYear=@PriorFscYear) 
Where  
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
GROUP BY hn.HirNodLevel8,
         au.AppUniBrief,
	     au.hirNode


----------------------
	) GrpType
GROUP BY
    GrpType.SiteName,
    GrpType.HouseCode,
	GrpType.HirNode,
	GrpType.GroupSortOrder,
	GrpType.GroupDescription
ORDER BY
    GrpType.SiteName,
    GrpType.HouseCode,
	GrpType.HirNode,
	GrpType.GroupSortOrder

DROP TABLE #Hierarchy
--DROP TABLE #CPayrollHours
--DROP TABLE #PPayrollHours
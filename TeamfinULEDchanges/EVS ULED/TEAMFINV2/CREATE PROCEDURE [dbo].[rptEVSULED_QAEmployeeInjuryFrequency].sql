USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_QAEmployeeInjuryFrequency]    Script Date: 7/16/2018 6:41:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[rptEVSULED_QAEmployeeInjuryFrequency]
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
Dataset:  Quality Assurance section
*/
-------------------------------------------

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

/*-----------------------Employee Injury Frequency Previous FY, Current FY-------------------------------------------------------*/
	SELECT
		hn.HirNodLevel8 AS SiteName,
		au.AppUniBrief AS HouseCode,
		au.hirNode as HirNode,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE sum(isnull(CurrentEmployeeInjuryFrequency,0))
		END AS CurrentEmployeeInjuryFrequency,
		CASE
			WHEN @CurrentPeriodTitle = 0 THEN 0 ELSE sum(isnull(PreviousEmployeeInjuryFrequency,0))
		END AS PreviousEmployeeInjuryFrequency
	from Esmv2..AppUnits au 
	INNER JOIN Esmv2..HirNodes hn WITH (NOLOCK) ON
    au.HirNode = hn.HirNode
	INNER JOIN TeamfinV2.dbo.HcmHouseCodes hc WITH (NOLOCK) ON
    au.HirNode = hc.HirNode
	INNER JOIN TeamfinV2.dbo.HcmEVSMetrics hcm with (nolock) on 
	hcm.HcmHouseCode=hc.HcmHouseCode
	left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
	Unpivot (CurrentEmployeeInjuryFrequency for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as num on (hcm.HcmEVSMetric = num.HcmEVSMetric and Cast(SUBSTRING(num.Detail,16, 2)as integer) = @CurrentPeriodTitle 
		   and num.HcmEVSMetricType=58 and hcm.FscYear=@NFscYear) 
left outer JOIN TeamFinv2.dbo.HcmEVSMetricNumericDetails
Unpivot (PreviousEmployeeInjuryFrequency for Detail in (HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
	                        HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12) )
as numd on (hcm.HcmEVSMetric = numd.HcmEVSMetric and Cast(SUBSTRING(numd.Detail,16, 2)as integer) = @CurrentPeriodTitle 
			and numd.HcmEVSMetricType=58 and hcm.FscYear=@PriorFscYear) 
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

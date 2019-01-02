USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_QACustSurvery]    Script Date: 7/17/2018 2:14:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[rptEVSULED_QACustSurvery]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
)
AS

SET NOCOUNT ON
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED DECLARE @CurrentPeriodTitle INT DECLARE @CurrentYearTitle INT
SET                @CurrentYearTitle =
                             (SELECT        FscYeaTitle
                               FROM            TeamfinV2.dbo.FscYears
                               WHERE        FscYear = @NFscYear)
SET                @CurrentPeriodTitle =
                             (SELECT        FscPerTitle
                               FROM            TeamfinV2.dbo.FscPeriods
                               WHERE        FscPeriod = @NFscPeriod) /*SELECT @NFscYear, @CurrentYearTitle, @NFscPeriod, @CurrentPeriodTitle*/ CREATE TABLE #Hierarchy(ENT VARCHAR(64), 
                         SVP VARCHAR(64), DVP VARCHAR(64), RVP VARCHAR(64), SRM VARCHAR(64), RM VARCHAR(64), AM VARCHAR(64), SiteName VARCHAR(64), 
                         HouseCode VARCHAR(16), HirNode INT)
                             INSERT        
                              INTO               #Hierarchy(ENT, SVP, DVP, RVP, SRM, RM, AM, SiteName, HouseCode, HirNode)
                                                           SELECT        hn.HirNodLevel1 AS ENT, hn.HirNodLevel2 AS SVP, hn.HirNodLevel3 AS DVP, hn.HirNodLevel4 AS RVP, hn.HirNodLevel5 AS SRM, 
                                                                                     hn.HirNodLevel6 AS RM, hn.HirNodLevel7 AS AM, hn.HirNodLevel8 AS SiteName, u.AppUniBrief AS HouseCode, u.HirNode
                                                            FROM            Esmv2.dbo.AppUserHouseCodesSelectFunction(@NUserID) u INNER JOIN
                                                                                     Esmv2.dbo.HirNodes hn ON u.HirNode = hn.HirNode
                                                            WHERE        (CASE @NLevel WHEN 'ENT' THEN hn.HirNodLevel1 WHEN 'SVP' THEN hn.HirNodLevel2 WHEN 'DVP' THEN hn.HirNodLevel3 WHEN 'RVP'
                                                                                      THEN hn.HirNodLevel4 WHEN 'SRM' THEN hn.HirNodLevel5 WHEN 'RM' THEN hn.HirNodLevel6 WHEN 'AM' THEN hn.HirNodLevel7 WHEN
                                                                                      'SiteName' THEN hn.HirNodLevel8 ELSE '' END) IN (@NName)
                                                            ORDER BY hn.HirNodLevel1, hn.HirNodLevel2, hn.HirNodLevel3, hn.HirNodLevel4, hn.HirNodLevel5, hn.HirNodLevel6, hn.HirNodLevel7, 
                                                                                     hn.HirNodLevel8, u.AppUniBrief, u.HirNode /*select * from #Hierarchy*/ DECLARE @HouseCode varchar(16)
SET                @HouseCode =
                             (SELECT        TOP 1 HouseCode
                               FROM            #Hierarchy) /*Select @HouseCode */ 
							   
							   
CREATE TABLE #CustomerSurvey(Facility_HouseCode varchar(16), 
							FiscalYear int, 
							GroupTitle varchar(50),
							Q1_Score int, 
							Q1_Max_Score int, 
							Q2_Score int, 
							Q2_Max_Score int, 
							Q3_Score int, 
							Q3_Max_Score int, 
							Q4_Score int, 
							Q4_Max_Score int, 
							YTD_Score int, 
							YTD_Max_Score int)
                            
							
INSERT INTO #CustomerSurvey 
EXEC SuperMart.dbo.Coach_EVSULEDCustomerSurveyScores @CurrentYearTitle, @CurrentPeriodTitle, @HouseCode

SELECT        Facility_HouseCode AS HouseCode, 
			  FiscalYear AS FiscalYear, 
			  GroupTitle AS GroupTitle, 
			  Q1_Score AS Q1_Score, 
			  Q1_Max_Score AS Q1_Max_Score, 
              CASE WHEN ISNULL(Q1_Max_Score, 0) = 0 THEN 0 ELSE CAST(CAST(Q1_Score AS decimal(12, 2)) / CAST(Q1_Max_Score AS decimal(12,2)) AS decimal(12, 2)) END AS Q1_Percent, 
			  Q2_Score AS Q2_Score, 
			  Q2_Max_Score AS Q2_Max_Score, 
              CASE WHEN ISNULL(Q2_Max_Score, 0) = 0 THEN 0 ELSE CAST(CAST(Q2_Score AS decimal(12, 2)) / CAST(Q2_Max_Score AS decimal(12,2)) AS decimal(12, 2)) END AS Q2_Percent, 
			  Q3_Score AS Q3_Score, 
			  Q3_Max_Score AS Q3_Max_Score, 
              CASE WHEN ISNULL(Q3_Max_Score, 0) = 0 THEN 0 ELSE CAST(CAST(Q3_Score AS decimal(12, 2)) / CAST(Q3_Max_Score AS decimal(12,2)) AS decimal(12, 2)) END AS Q3_Percent, 
			  Q4_Score AS Q4_Score, Q4_Max_Score AS Q4_Max_Score,
			  CASE WHEN ISNULL(Q4_Max_Score, 0) = 0 THEN 0 ELSE CAST(CAST(Q4_Score AS decimal(12, 2)) / CAST(Q4_Max_Score AS decimal(12,2)) AS decimal(12, 2)) END AS Q4_Percent,
			  YTD_Score AS YTD_Score, YTD_Max_Score AS YTD_Max_Score, 
              CASE WHEN ISNULL(YTD_Max_Score, 0) = 0 THEN 0 ELSE CAST(CAST(YTD_Score AS decimal(12, 2)) / CAST(YTD_Max_Score AS decimal(12, 2)) AS decimal(12, 2)) END AS YTD_Percent
FROM            #CustomerSurvey 
															

															DROP TABLE #CustomerSurvey 
															DROP TABLE #Hierarchy

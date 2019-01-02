USE [TeamFinv2]
GO
/****** Object:  StoredProcedure [dbo].[rptEVSULED_QAPositiveImpressions]    Script Date: 7/16/2018 6:41:00 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[rptEVSULED_QAPositiveImpressions]
(
	@NUserID varchar(50),
	@NLevel varchar(20),
	@NName varchar(8000),
	@NFscYear INT,
	@NFscPeriod INT
)
AS

/*
DECLARE @NFscYear int
DECLARE @NFscPeriod int
DECLARE @NHouseCode varchar(16)
declare @NLevel varchar(10)
declare @NName varchar(50)
declare @NuserID varchar(20)

SET @NFscYear = 9
SET @NFscPeriod = 103
SET @NLevel='SiteName'
set @NNAME='48660 - Milford Memorial Hospital'
set @Nuserid='compass-usa\KhareR01'


*/



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
							   
							   
CREATE TABLE #PositiveImpressions(Facility_HouseCode varchar(16), 
							FiscalYear int, 
							SortOrder int,
							GroupTitle varchar(50),
							CurrentFY int, 
							CurrentFY_Max int, 
							PreviousFY int, 
							PreviousFY_Max int)
                            
							
INSERT INTO #PositiveImpressions 
EXEC SuperMart.dbo.Coach_EVSULEDPositiveImpressions @CurrentYearTitle, @CurrentPeriodTitle, @HouseCode

SELECT        Facility_HouseCode AS HouseCode, 
			  FiscalYear AS FiscalYear, 
			  SortOrder As SortOrder,
			  GroupTitle AS GroupTitle, 
			  CurrentFY AS CurrentFY, 
			  CurrentFY_Max AS CurrentFY_Max, 
              PreviousFY AS PreviousFY, 
			  PreviousFY_Max AS PreviousFY_Max
FROM            #PositiveImpressions 
															

															DROP TABLE #PositiveImpressions 
															DROP TABLE #Hierarchy

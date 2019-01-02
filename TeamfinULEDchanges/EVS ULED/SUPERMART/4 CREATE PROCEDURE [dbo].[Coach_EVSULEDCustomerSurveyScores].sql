USE [SuperMart]
GO
/****** Object:  StoredProcedure [dbo].[Coach_EVSULEDCustomerSurveyScores]    Script Date: 7/17/2018 2:17:17 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[Coach_EVSULEDCustomerSurveyScores]
(
	@FiscalYear int,
	@FiscalPeriod int,
	@HouseCode varchar(16)
)

AS
BEGIN

/*
Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This proc will return the Customer Round Scores and compliances for all Quarters up to the end of the selected Period, as well as YTD Scores


exec [dbo].[Coach_EVSULEDPTCustomerSurveyScores] @FiscalYear = 2016, @FiscalPeriod = 10, @HouseCode = '1054'

*/


DECLARE @NFiscalYear int
DECLARE @NFiscalPeriod int
DECLARE @NHouseCode varchar(16)

SET @NFiscalYear = @FiscalYear
SET @NFiscalPeriod = @FiscalPeriod
SET @NHouseCode = @HouseCode


select
	Coach.Facility_HouseCode,
	Fisc.FiscalYear,
	'Customer Round Score' as GroupTitle,
	/* Quarter 1 Results */
	sum(
		case
			when Fisc.FiscalPeriod < 4 then Coach.Question_Score
			else 0
		end
	) as Q1_Score,
	sum(
		case
			when Fisc.FiscalPeriod < 4 then Coach.Question_Max_Score
			else 0
		end
	) as Q1_Max_Score,
	
	/* Quarter 2 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 3 and Fisc.FiscalPeriod < 7 then Coach.Question_Score
			else 0
		end
	) as Q2_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 3 and Fisc.FiscalPeriod < 7 then Coach.Question_Max_Score
			else 0
		end
	) as Q2_Max_Score,
	
	/* Quarter 3 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 6 and Fisc.FiscalPeriod < 10 then Coach.Question_Score
			else 0
		end
	) as Q3_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 6 and Fisc.FiscalPeriod < 10 then Coach.Question_Max_Score
			else 0
		end
	) as Q3_Max_Score,
	
	/* Quarter 4 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 9 then Coach.Question_Score
			else 0
		end
	) as Q4_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 9 then Coach.Question_Max_Score
			else 0
		end
	) as Q4_Max_Score,
	
	/* YTD Results */
	sum(Coach.Question_Score) as YTD_Score,
	sum(Coach.Question_Max_Score) as YTD_Max_Score
	
from [TeamCoach v2].[dbo].[vwSurveyDetailsbyQuestionV2] Coach with (nolock)
inner join [SuperMart].[dbo].[TeamFin_FiscalPeriods] Fisc with (nolock)
	on Coach.InspectionDate between Fisc.FscPerStartDate and Fisc.FscPerEndDate

where
	/* Only return results from the EVS Customer Survey */
	Coach.svySurveyTemplate = 139 --EVS Customer Rounds
	/* Looking at results from 3 questions on the survey 
	2049 Rate the cleanliness of your area.
	2050 Rate the responsiveness of our staff to your requests.
	2051 Rate the availability of restroom and patient area supplies.
	*/
	and Coach.Question_id in (2049,2050,2051)
	and Fisc.FiscalYear = @NFiscalYear
	and Fisc.FiscalPeriod < (@NFiscalPeriod + 1)
	and Coach.Facility_HouseCode = @NHouseCode

group by
	Coach.Facility_HouseCode,
	Fisc.FiscalYear
union
select
	Coach.Facility_HouseCode,
	Fisc.FiscalYear,
	'Customer Round Compliance' as GroupTitle,
	/* Quarter 1 Results */
	sum(
		case
			when Fisc.FiscalPeriod < 4 then 
				case when Coach.Question_Score>=0.9*Coach.Question_Max_Score then 1 else 0 end
			else 0
		end
	) as Q1_Score,
	sum(
		case
			when Fisc.FiscalPeriod < 4 then 1
			else 0
		end
	) as Q1_Max_Score,
	
	/* Quarter 2 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 3 and Fisc.FiscalPeriod < 7 then 
				case when Coach.Question_Score>=0.9*Coach.Question_Max_Score then 1 else 0 end
			else 0
		end
	) as Q2_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 3 and Fisc.FiscalPeriod < 7 then 1 
			else 0
		end
	) as Q2_Max_Score,
	
	/* Quarter 3 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 6 and Fisc.FiscalPeriod < 10 then 
				case when Coach.Question_Score>=0.9*Coach.Question_Max_Score then 1 else 0 end
			else 0
		end
	) as Q3_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 6 and Fisc.FiscalPeriod < 10 then 1
			else 0
		end
	) as Q3_Max_Score,
	
	/* Quarter 4 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 9 then 
				case when Coach.Question_Score>=0.9*Coach.Question_Max_Score then 1 else 0 end
			else 0
		end
	) as Q4_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 9 then 1
			else 0
		end
	) as Q4_Max_Score,
	
	/* YTD Results */
	sum(case when Coach.Question_Score>=0.9*Coach.Question_Max_Score then 1 else 0 end) as YTD_Score,
	sum(1) as YTD_Max_Score
	
from [TeamCoach v2].[dbo].[vwSurveyDetailsbyQuestionV2] Coach with (nolock)
inner join [SuperMart].[dbo].[TeamFin_FiscalPeriods] Fisc with (nolock)
	on Coach.InspectionDate between Fisc.FscPerStartDate and Fisc.FscPerEndDate
where
	/* Only return results from the EVS Customer Survey */
	Coach.svySurveyTemplate = 139 --EVS Customer Rounds
	/* Looking at results from 3 questions on the survey 
	2049 Rate the cleanliness of your area.
	2050 Rate the responsiveness of our staff to your requests.
	2051 Rate the availability of restroom and patient area supplies.
	*/
	and Coach.Question_id in (2049,2050,2051)
	and Fisc.FiscalYear = @NFiscalYear
	and Fisc.FiscalPeriod < (@NFiscalPeriod + 1)
	and Coach.Facility_HouseCode = @NHouseCode

group by
	Coach.Facility_HouseCode,
	Fisc.FiscalYear
union
select  Coach.Facility_HouseCode,
	Fisc.FiscalYear,
	'Hygiena ATP Testing Score' as GroupTitle,
	/* Quarter 1 Results */
	sum(
		case
			when Fisc.FiscalPeriod < 4 then Coach.Question_Score
			else 0
		end
	) as Q1_Score,
	sum(
		case
			when Fisc.FiscalPeriod < 4 then 100
			else 0
		end
	) as Q1_Max_Score,
	
	/* Quarter 2 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 3 and Fisc.FiscalPeriod < 7 then Coach.Question_Score
			else 0
		end
	) as Q2_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 3 and Fisc.FiscalPeriod < 7 then 100
			else 0
		end
	) as Q2_Max_Score,
	
	/* Quarter 3 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 6 and Fisc.FiscalPeriod < 10 then Coach.Question_Score
			else 0
		end
	) as Q3_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 6 and Fisc.FiscalPeriod < 10 then 100
			else 0
		end
	) as Q3_Max_Score,
	
	/* Quarter 4 Results */
	sum(
		case
			when Fisc.FiscalPeriod > 9 then Coach.Question_Score
			else 0
		end
	) as Q4_Score,
	sum(
		case
			when Fisc.FiscalPeriod > 9 then 100
			else 0
		end
	) as Q4_Max_Score,
	
	/* YTD Results */
	sum(Coach.Question_Score) as YTD_Score,
	sum(Coach.Question_Max_Score) as YTD_Max_Score	
from [TeamCoach v2].[dbo].[vwSurveyDetailsbyQuestionV2] Coach with (nolock)
inner join [SuperMart].[dbo].[TeamFin_FiscalPeriods] Fisc with (nolock)
	on Coach.InspectionDate between Fisc.FscPerStartDate and Fisc.FscPerEndDate
where
	/* Hygiena ATP Testing Score */
	Coach.survey_title = 'EVS ATP Testing Results'
	/* Looking at answer from each quarter on the survey*/
	and Coach.section_title='ATP Testing Quarterly Percentage' --What is your ATP Testing Results for this past quarter?
	and Coach.survey_question='What is your ATP Testing Results ( in percentage ) for this past quarter?'
	and Fisc.FiscalYear = @NFiscalYear
	and Fisc.FiscalPeriod < (@NFiscalPeriod + 1)
	and Coach.Facility_HouseCode = @NHouseCode

group by
	Coach.Facility_HouseCode,
	Fisc.FiscalYear
END


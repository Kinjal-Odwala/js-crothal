USE [SuperMart]
GO
/****** Object:  StoredProcedure [dbo].[Coach_EVSULEDPositiveImpressions]    Script Date: 8/1/2018 1:25:23 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



CREATE PROCEDURE [dbo].[Coach_EVSULEDPositiveImpressions]
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
This proc will return Positive Impressions for QA


exec [dbo].[Coach_EVSULEDPositiveImpressions] @FiscalYear = 2016, @FiscalPeriod = 10, @HouseCode = '1054'

*/


DECLARE @NFiscalYear int
DECLARE @NFiscalPeriod int
DECLARE @NHouseCode varchar(16)

SET @NFiscalYear = @FiscalYear
SET @NFiscalPeriod = @FiscalPeriod
SET @NHouseCode = @HouseCode


select Facility_HouseCode,
	   FiscalYear,
	   SortOrder,
	   GroupTitle,
	   sum(CurrentFY) CurrentFY,
	   sum(CurrentFY_Max) CurrentFY_Max,
	   sum(PreviousFY) PreviousFY,
	   sum(PreviousFY_max) PreviousFY_max
From
(

---------------------------------TEAM LEAD DATA...Start......
select
	gg.HouseCode as Facility_HouseCode,
	@NFiscalYear as FiscalYear,
	1 as SortOrder,
	'New Admission Visits' as GroupTitle,
	/* Current FY Results */
	count(
		case
			when 	((DATEPART(Year,av.VisitDate)=@NFiscalYear AND DATEPART(Month,av.VisitDate) between 1 and 9 )
						or
					 (DATEPART(Year,av.VisitDate)=@NFiscalYear-1 AND DATEPART(Month,av.VisitDate) >= 10))
							then 1
			else 0
		end
	) as CurrentFY,
	
	1 as CurrentFY_Max,
	
	/* Previous FY Results */
	sum(
		case
			when ((DATEPART(Year,av.VisitDate)=@NFiscalYear-1 AND DATEPART(Month,av.VisitDate) between 1 and 9 )
						or
				  (DATEPART(Year,av.VisitDate)=@NFiscalYear-2 AND DATEPART(Month,av.VisitDate) >= 10))	
							then 1
			else 0
		end
	) as PreviousFY,

	1 as PreviousFY_Max
	
from [TeamLead].[dbo].[AppVisits] av
       LEFT OUTER JOIN [TeamLead].[dbo].[GeoGroupLocations] gl
       ON av.GeoLocationAncestor = gl.GeoLocation
       LEFT OUTER Join [TeamLead].[dbo].[GeoGroups] gg
       ON gl.GeoGroup = gg.GeoGroup
WHERE 
       gg.HouseCode = '49154'--@NHouseCode 
	   and av.newadmissionvisit=1
	   and datepart(Year,av.VisitDate) IN  (@NFiscalYear,@NFiscalYear-1,@NFiscalYear-2)
GROUP BY
	gg.HouseCode,
	datepart(Year,av.VisitDate)	 

union all
select
	gg.HouseCode as Facility_Housecode,
	@NFiscalYear as FiscalYear,
	2 as SortOrder,
	'Service Recovery' as GroupTitle,
	/* Current FY Results */
	sum(
		case
			when 	((DATEPART(Year,ar.[RecoveryDate])=@NFiscalYear AND DATEPART(Month,ar.[RecoveryDate]) between 1 and 9 )
						or
					 (DATEPART(Year,ar.[RecoveryDate])=@NFiscalYear-1 AND DATEPART(Month,ar.[RecoveryDate]) >= 10))
							then 1
			else 0
		end
	) as CurrentFY,
	
	1 as CurrentFY_Max,
	
	/* Previous FY Results */
	sum(
		case
			when ((DATEPART(Year,ar.[RecoveryDate])=@NFiscalYear-1 AND DATEPART(Month,ar.[RecoveryDate]) between 1 and 9 )
						or
				  (DATEPART(Year,ar.[RecoveryDate])=@NFiscalYear-2 AND DATEPART(Month,ar.[RecoveryDate]) >= 10))	
							then 1
			else 0
		end
	) as PreviousFY,

	1 as PreviousFY_Max
	
from [TeamLead].[dbo].[AppRecoverys] ar
       LEFT OUTER JOIN [TeamLead].[dbo].[GeoGroupLocations] gl
       ON ar.GeoLocationAncestor = gl.GeoLocation
       LEFT OUTER Join [TeamLead].[dbo].[GeoGroups] gg
       ON gl.GeoGroup = gg.GeoGroup
WHERE 
       gg.HouseCode = '49269'--@NHouseCode 
	   and ar.Completed=1
	   and datepart(Year,ar.[RecoveryDate]) IN  (@NFiscalYear,@NFiscalYear-1,@NFiscalYear-2)
GROUP BY
	gg.HouseCode,
	datepart(Year,ar.[RecoveryDate])	

-----------------------------------TEAM LEAD DATA...End......
union all
select
	Coach.Facility_HouseCode,
	@NFiscalYear as FiscalYear,
	3 as SortOrder,
	'HPC Report Card Compliance' as GroupTitle,
	/* Current FY Results */
	sum(
		case
			when 	((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear AND DATEPART(Month,Coach.InspectionDate) between 1 and 9 )
						or
					 (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) >= 10))
							then Coach.Question_Score
			else 0
		end
	) as CurrentFY,
	sum(
		case
			when 	((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear AND DATEPART(Month,Coach.InspectionDate) between 1 and 9)
						or
					 (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) >= 10)) 
							then Coach.Question_Max_Score
			else 0
		end
	) as CurrentFY_Max,
	
	/* Previous FY Results */
	sum(
		case
			when ((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) between 1 and 9 )
						or
				  (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-2 AND DATEPART(Month,Coach.InspectionDate) >= 10))	
							then Coach.Question_Score
			else 0
		end
	) as PreviousFY,

	sum(
		case
			when ((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) between 1 and 9) 
						or
				  (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-2 AND DATEPART(Month,Coach.InspectionDate) >= 10))
							then Coach.Question_Max_Score
			else 0
		end
	) as PreviousFY_Max
	
from [TeamCoach v2].[dbo].[vwSurveyDetailsbyQuestionV2] Coach with (nolock)
where datepart(Year,Coach.InspectionDate) IN  (@NFiscalYear,@NFiscalYear-1,@NFiscalYear-2)

	/* High Profile Patient Room Cleaning QA */

	and Coach.svySurveyTemplate = 158 --EVS Customer Rounds
	
	/* Looking at results from 10 questions on the survey 
	
			2504	Light Switches
			2505	Sink Faucets
			2506	Restroom Door Handle
			2507	Toilet and Flusher
			2508	Bed Hand Rail
			2509	Bed Side Table
			2510	Shower Handle/Rail
			2511	Telephone
			2512	Remote Control / Call Button
			2513	Overbed Table
	*/
	and Coach.Question_id in (2504,2505,2506,2508,2510,2512,2513,2507,2509,2511)
	and Coach.Facility_HouseCode = @NHouseCode

group by
	Coach.Facility_HouseCode,
	datepart(Year,Coach.InspectionDate) 
union
select
	Coach.Facility_HouseCode,
	@NFiscalYear as FiscalYear,
	4 as SortOrder,
	'Nonverbal Cues of Clean Compliance' as GroupTitle,
	/* Current FY Results */
	/* Current FY Results */
	sum(
		case
			when 	((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear AND DATEPART(Month,Coach.InspectionDate) between 1 and 9 )
						or
					 (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) >= 10))
							then Coach.Question_Score
			else 0
		end
	) as CurrentFY,
	sum(
		case
			when 	((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear AND DATEPART(Month,Coach.InspectionDate) between 1 and 9) 
						or
					 (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) >= 10) )
							then Coach.Question_Max_Score
			else 0
		end
	) as CurrentFY_Max,
	
	/* Previous FY Results */
	sum(
		case
			when ((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) between 1 and 9 )
						or
				  (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-2 AND DATEPART(Month,Coach.InspectionDate) >= 10))	
							then Coach.Question_Score
			else 0
		end
	) as PreviousFY,

	sum(
		case
			when ((DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-1 AND DATEPART(Month,Coach.InspectionDate) between 1 and 9) 
						or
				  (DATEPART(Year,Coach.InspectionDate)=@NFiscalYear-2 AND DATEPART(Month,Coach.InspectionDate) >= 10) )
							then Coach.Question_Max_Score
			else 0
		end
	) as PreviousFY_Max
	
from [TeamCoach v2].[dbo].[vwSurveyDetailsbyQuestionV2] Coach with (nolock)
where datepart(Year,Coach.InspectionDate) IN  (@NFiscalYear,@NFiscalYear-1,@NFiscalYear-2)

	/* Nonverbal Cues of Clean Compliance */
	and	Coach.svySurveyTemplate = 1174
	/* Looking at results from 3 questions on the survey 
			3045	Tent Card Placed on the Overbed Table
			3046	Tent Card Signed by Employee
			3047	Tent Card Dated upon Completion
			3048	While You Were out Cards/Courtesy Cards
			3049	Toilet Bands / Sterile Strips in Place
			3050	Blue Water in Toilet
			3051	Bedside Bag Placed on the Overbed Table
			3052	Trash Receptacle Accessible to the Patient
			3053	Trash Receptacle Empty and Liners are in Place
			3054	V-Tip Toilet Tissue
			3055	The use of a Sticker on the end of the V-Tip
			3056	Patient-room / Restroom "Linens Change Needed" Door Sign
			3057	Creative Towel Folding
			3058	The Use of the White Board
			3059	External Patient Room Door Seal
	*/
	and Coach.Question_id in (3045,3046,3047,3048,3049,3050,3051,3052,3053,3054,3055,3056,3057,3058,3059)
	and Coach.Facility_HouseCode = @NHouseCode
group by
	Coach.Facility_HouseCode,datepart(Year,Coach.InspectionDate) 
) x
group by Facility_HouseCode,GroupTitle,FiscalYear,SortOrder
order by SortOrder asc
END


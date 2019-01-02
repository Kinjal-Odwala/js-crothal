USE [TeamFinv2]
GO

/****** Object:  View [dbo].[vw_rptEVSULEDMetricDetails]    Script Date: 7/10/2018 6:29:49 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO



CREATE VIEW [dbo].[vw_rptEVSULEDMetricDetails] 
AS
/*
Description
--------------------------------------------------------------------------------------------------------------------------------------------------------
This view unpivots all of the numeric and text details from the EVS Metrics tables so that they can be easily summarized for the EVS ULED Report

*/
	
	SELECT
		EVSM.FscYear,
		MD.FscPeriodTitle,
		EVSM.HcmHouseCode,
		MD.SourceDetailTable,
		MD.HcmEVSMetric,
		MD.HcmEVSMetricType,
		MD.HcmEVSMetricNumericDetail,
		MD.HcmEVSMetricTextDetail,
		MD.NumMetricValue,
		MD.TextMetricValue
	FROM
		(
	
			SELECT
				'Numeric' as SourceDetailTable,
				num.HcmEVSMEtricNumericDetail,
				NULL as HcmEVSMEtricTextDetail,
				num.HcmEVSMetric,
				num.HcmEVSMetricType,
				num.MetricValue as NumMetricValue,
				NULL as TextMetricValue,
				Cast(SUBSTRING(num.Detail,16, 2)as integer) as FscPeriodTitle
			FROM TeamFinv2.dbo.HcmEVSMetricNumericDetails
			Unpivot (
					 MetricValue for Detail in (
						HcmEVSmndPeriod1, HcmEVSmndPeriod2, HcmEVSmndPeriod3, HcmEVSmndPeriod4, HcmEVSmndPeriod5, HcmEVSmndPeriod6,
						HcmEVSmndPeriod7, HcmEVSmndPeriod8, HcmEVSmndPeriod9, HcmEVSmndPeriod10, HcmEVSmndPeriod11, HcmEVSmndPeriod12
					)
				) as num
				
			UNION ALL
			
			SELECT
				'Text' as SourceDetailTable,
				NULL as HcmEVSMEtricNumericDetail,
				textmetrics.HcmEVSMEtricTextDetail,
				textmetrics.HcmEVSMetric,
				textmetrics.HcmEVSMetricType,
				NULL as NumMetricValue,
				textmetrics.MetricValue as TextMetricValue,
				Cast(SUBSTRING(textmetrics.Detail,16, 2)as integer) as FscPeriodTitle
			FROM TeamFinv2.dbo.HcmEVSMetricTextDetails
			Unpivot (
					 MetricValue for Detail in (
						HcmEVSmtdPeriod1, HcmEVSmtdPeriod2, HcmEVSmtdPeriod3, HcmEVSmtdPeriod4, HcmEVSmtdPeriod5, HcmEVSmtdPeriod6,
						HcmEVSmtdPeriod7, HcmEVSmtdPeriod8, HcmEVSmtdPeriod9, HcmEVSmtdPeriod10, HcmEVSmtdPeriod11, HcmEVSmtdPeriod12
					)
				) as textmetrics
		
		) MD
	INNER JOIN HcmEVSMetrics EVSM with (Nolock)
		ON MD.HcmEVSMetric = EVSM.HcmEVSMetric


GO



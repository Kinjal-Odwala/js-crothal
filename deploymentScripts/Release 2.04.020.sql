/*
Last production release version 2.04.019 on 30th March 2016 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.020', M_ENV_ENV_Database_Version = '2.04.020' 
Where M_ENV_ENVIRONMENT = 4

-- House Codes --> CMS/PBJ Reporting Menu Insert [Begin] 
Declare @DisplayOrderMenu Int
	, @HirNodeParent Int
Set @DisplayOrderMenu = 712
Select @HirNodeParent = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup'

Exec EsmV2.dbo.AppMenuItemUpdate
	'CMS/PBJ Report' --@MenuTitle Varchar(64)
	, 2 --@MenuAction Int 1-mainmenu, 2-submenu
	, 4 --@MenuState Int 3-selected, 4-enabled
	, @DisplayOrderMenu
	, '/fin/hcm/pbjReport/usr/markup.htm'
	, @HirNodeParent

Select * From EsmV2.dbo.AppMenuItems
Select * From ESMV2.dbo.HirNodes Where HirNodFullPath like '\crothall\chimes\fin\HouseCodeSetup%'
-- House Codes --> CMS/PBJ Reporting Menu Insert [End] 

INSERT INTO dbo.AppTransactionStatusTypes(AppTransactionStatusType, AppTrastBrief, AppTrastTitle, AppTrastDescription, AppTrastDisplayOrder, AppTrastActive, AppTrastModBy, AppTrastModAt)
VALUES(11, 10, 'Audited', 'Audited', 1, 1, 'Compass-USA\Data Conversion', GetDate())

/* -- Please verify before executing the INSERT script
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Sandy Schuster', 'Sandy Schuster', 1, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Sally Mazzola', 'Sally Mazzola', 2, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Brad Burden', 'Brad Burden', 3, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Kim DeSarno', 'Kim DeSarno', 4, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Lynn Macenko', 'Lynn Macenko', 5, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Stephanie Drayton', 'Stephanie Drayton', 6, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Rob Harris', 'Rob Harris', 7, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Tracy Lewis', 'Tracy Lewis', 8, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Katie Benfer', 'Katie Benfer', 9, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Susan Lockridge', 'Susan Lockridge', 10, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('HRReview', '', 'Steve Abrams', 'Steve Abrams', 11, 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Senior Regional Director of Operations', 'Senior Regional Director of Operations', 7, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Regional Vice President', 'Regional Vice President', 8, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Vice President, Operations', 'Vice President, Operations', 9, 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpPersonnelActionTypes(EmpPatTypeName, EmpPatBrief, EmpPatTitle, EmpPatDescription, EmpPatDisplayOrder, EmpPatActive, EmpPatModBy, EmpPatModAt)
Values('BonusEligible', '', 'Division President', 'Division President', 10, 1, 'Compass-USA\Data Conversion', GetDate())
*/

INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('1', 'Administrator', 'Administrator', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('2', 'Medical Director', 'Medical Director', 1, 2, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('3', 'Other Physician', 'Other Physician', 1, 3, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('4', 'Physician Assistant', 'Physician Assistant', 1, 4, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('5', 'Registered Nurse Director of Nursing', 'Registered Nurse Director of Nursing', 1, 5, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('6', 'Registered Nurse with Administrative Duties', 'Registered Nurse with Administrative Duties', 1, 6, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('7', 'Registered Nurse', 'Registered Nurse', 1, 7, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('8', 'Licensed Practical/Vocational Nurse with Administrative Duties', 'Licensed Practical/Vocational Nurse with Administrative Duties', 1, 8, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('9', 'Licensed Practical/Vocational Nurse', 'Licensed Practical/Vocational Nurse', 1, 9, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('10', 'Certified Nurse Aide', 'Certified Nurse Aide', 1, 10, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('11', 'Nurse Aide in Training', 'Nurse Aide in Training', 1, 11, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('12', 'Medication Aide/Technician', 'Medication Aide/Technician', 1, 12, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('13', 'Nurse Practitioner', 'Nurse Practitioner', 1, 13, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('14', 'Clinical Nurse Specialist', 'Clinical Nurse Specialist', 1, 14, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('15', 'Pharmacist', 'Pharmacist', 1, 15, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('16', 'Dietitian', 'Dietitian', 1, 16, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('17', 'Feeding Assistant', 'Feeding Assistant', 1, 17, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('18', 'Occupational Therapist', 'Occupational Therapist', 1, 18, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('19', 'Occupational Therapy Assistant', 'Occupational Therapy Assistant', 1, 19, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('20', 'Occupational Therapy Aide', 'Occupational Therapy Aide', 1, 20, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('21', 'Physical Therapist', 'Physical Therapist', 1, 21, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('22', 'Physical Therapy Assistant', 'Physical Therapy Assistant', 1, 22, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('23', 'Physical Therapy Aide', 'Physical Therapy Aide', 1, 23, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('24', 'Respiratory Therapist', 'Respiratory Therapist', 1, 24, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('25', 'Respiratory Therapy Technician', 'Respiratory Therapy Technician', 1, 25, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('26', 'Speech/Language Pathologist', 'Speech/Language Pathologist', 1, 26, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('27', 'Therapeutic Recreation Specialist', 'Therapeutic Recreation Specialist', 1, 27, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('28', 'Qualified Activities Professional', 'Qualified Activities Professional', 1, 28, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('29', 'Other Activities Staff', 'Other Activities Staff', 1, 29, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('30', 'Qualified Social Worker', 'Qualified Social Worker', 1, 30, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('31', 'Other Social Worker', 'Other Social Worker', 1, 31, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('32', 'Dentist', 'Dentist', 1, 32, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('33', 'Podiatrist', 'Podiatrist', 1, 33, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('34', 'Mental Health Service Worker', 'Mental Health Service Worker', 1, 34, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('35', 'Vocational Service Worker', 'Vocational Service Worker', 1, 35, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('36', 'Clinical Laboratory Service Worker', 'Clinical Laboratory Service Worker', 1, 36, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('37', 'Diagnostic X-ray Service Worker', 'Diagnostic X-ray Service Worker', 1, 37, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('38', 'Blood Service Worker', 'Blood Service Worker', 1, 38, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('39', 'Housekeeping Service Worker', 'Housekeeping Service Worker', 1, 39, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjJobTitleCodes (PbjJobtcBrief, PbjJobtcTitle, PbjJobtcDescription, PbjJobtcActive, PbjJobtcDisplayOrder, PbjJobtcModBy, PbjJobtcModAt)
VALUES ('40', 'Other Service Worker', 'Other Service Worker', 1, 40, 'Compass-USA\Data Conversion', GetDate())

INSERT INTO dbo.PbjPayTypeCodes(PbjPaytcBrief, PbjPaytcTitle, PbjPaytcDescription, PbjPaytcActive, PbjPaytcDisplayOrder, PbjPaytcModBy, PbjPaytcModAt)
VALUES ('1', 'Exempt', 'Exempt', 1, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjPayTypeCodes(PbjPaytcBrief, PbjPaytcTitle, PbjPaytcDescription, PbjPaytcActive, PbjPaytcDisplayOrder, PbjPaytcModBy, PbjPaytcModAt)
VALUES ('2', 'Non-Exempt', 'Non-Exempt', 1, 2, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.PbjPayTypeCodes(PbjPaytcBrief, PbjPaytcTitle, PbjPaytcDescription, PbjPaytcActive, PbjPaytcDisplayOrder, PbjPaytcModBy, PbjPaytcModAt)
VALUES ('3', 'Contract', 'Contract', 1, 3, 'Compass-USA\Data Conversion', GetDate())

--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucPBJReporting BIT NULL
--ALTER TABLE dbo.EmpEmployeeGenerals ADD EmpEmpgPBJReporting BIT NULL
--ALTER TABLE dbo.PurPORequisitions ADD PurPorTemplate BIT NULL
--ALTER TABLE dbo.PurPORequisitions ADD PurPorTemplateTitle VARCHAR(50) NULL

INSERT INTO dbo.HcmManagerJobTypes(HcmMjtBrief,	HcmMjtTitle, HcmMjtDescription, HcmMjtDisplayOrder, HcmMjtActive, HcmMjtModBy, HcmMjtModAt)
VALUES ('FH', 'Field Hourly', 'Field Hourly', 1, 1, 'Compass-USA\Data Conversion', GetDate())

/*
CT updated on 18th May 2016 11PM EST
*/

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Hours Labor Actual', 'Total Hours Labor Actual', 'Decimal', 25, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Hours Labor Budget', 'Total Hours Labor Budget', 'Decimal', 26, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Labor Control', '', 'Total Hours Labor Comments', 'Total Hours Labor Comments', 'Text', 27, 1, 'Compass-Usa\Data Conversion', GetDate())

Update dbo.HcmPTMetricTypes Set HcmPtmtTitle = 'Total Paid Labor Comments', HcmPtmtDescription = 'Total Paid Labor Comments' Where HcmPTMetricType = 3

INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Admin Objective', '', 'Objective 1', 'Objective 1', 'Int', 28, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Admin Objective', '', 'Objective 2', 'Objective 2', 'Int', 29, 1, 'Compass-Usa\Data Conversion', GetDate())
INSERT INTO [dbo].[HcmPTMetricTypes] (HcmPtmtSubType, HcmPtmtBrief, HcmPtmtTitle, HcmPtmtDescription, HcmPtmtDataType, HcmPtmtDisplayOrder, HcmPtmtActive, HcmPtmtModBy, HcmPtmtModAt)
VALUES ('Admin Objective', '', 'Objective 3', 'Objective 3', 'Int', 30, 1, 'Compass-Usa\Data Conversion', GetDate())

-- Add security nodes for HouseCodes - PT Metrics -Admin Objectives UI [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\HouseCodeSetup\PTMetrics'

Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'AdminObjectives', 'Admin Objectives', 'Admin Objectives', @DisplayOrder + 1, 1, '\crothall\chimes\fin\HouseCodeSetup\PTMetrics\AdminObjectives', 'crothall', 'chimes', 'fin', 'HouseCodeSetup', 'PTMetrics', 'AdminObjectives', 'Compass-USA\Data Conversion', GetDate())

Select * From ESMV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\HouseCodeSetup\PTMetrics%'
-- Add security nodes for HouseCodes - PT Metrics - Admin Objectives UI [End]

Select * From dbo.AppWorkflowSteps

Update AppWorkflowSteps Set AppWfsTitle = 'Step 3 (Second Level Manager)', AppWfsDescription = 'Send an email notification to Second Level Manager for approve or unapprove the employee personnel action form.'
Where AppWorkflowStep = 6

Select * From dbo.AppWorkflowSteps Where AppWorkflowModule = 2

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsModBy, AppWfsModAt)
VALUES(2, 'Step 6', 'Step 6 (Process HR)', 'Send an email notification to SUS-ProcessHR@compass-usa.com for approve or unapprove the employee personnel action form.', 6, 6, 1, 1, 0, 'Compass-USA\Data Conversion', GetDate())

Update AppWorkflowSteps Set AppWfsTitle = 'Step 5 (Recruiter)', AppWfsDescription = 'Send an email notification to Recruiter for approve or unapprove the employee personnel action form.'
Where AppWorkflowStep = 8

--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaRecruiterName VARCHAR(50) NULL
--ALTER TABLE dbo.EmpEmployeePersonnelActions ADD EmpEpaRecruiterEmail VARCHAR(50) NULL
--ALTER TABLE dbo.AppWorkflowSteps ADD AppWfsAddHierarchyUser BIT NULL
--ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrRegionalVicePresidentName VARCHAR(256) NULL
--ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrRegionalVicePresidentEmail VARCHAR(256) NULL
--ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrDivisionVicePresidentName VARCHAR(256) NULL
--ALTER TABLE dbo.PurPOCapitalRequisitions ADD PurPocrDivisionVicePresidentEmail VARCHAR(256) NULL
--ALTER TABLE dbo.AppWorkflowHistories ADD AppWfhAdministrator BIT NULL

Select * From dbo.AppWorkflowSteps Where AppWorkflowModule = 3

Update dbo.AppWorkflowSteps Set AppWfsAddHierarchyUser = 0

INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsAddHierarchyUser, AppWfsModBy, AppWfsModAt)
VALUES(3, 'Step 2', 'Step 2 (Regional Vice President)', 'Send an email notification to Regional Vice President for approve or unapprove the PO capital requisition.', 2, 2, 1, 0, 0, 1, 'Compass-USA\Data Conversion', GetDate())
INSERT INTO dbo.AppWorkflowSteps(AppWorkflowModule, AppWfsBrief, AppWfsTitle, AppWfsDescription, AppWfsStepNumber, AppWfsDisplayOrder, AppWfsActive, AppWfsAddWorkflowUser, AppWfsAddJDECompanyUser, AppWfsAddHierarchyUser, AppWfsModBy, AppWfsModAt)
VALUES(3, 'Step 3', 'Step 3 (Division Vice President)', 'Send an email notification to Division Vice President for approve or unapprove the PO capital requisition.', 3, 3, 1, 0, 0, 1, 'Compass-USA\Data Conversion', GetDate())

Update AppWorkflowSteps Set AppWfsBrief = 'Step 4', AppWfsTitle = 'Step 4 (Division President)', AppWfsDescription = 'Send an email notification to Division President for approve or unapprove the PO capital requisition.'
, AppWfsStepNumber = 4, AppWfsDisplayOrder = 4, AppWfsAddWorkflowUser = 0, AppWfsAddJDECompanyUser = 1
Where AppWorkflowStep = 10

Update AppWorkflowSteps Set AppWfsBrief = 'Step 5', AppWfsTitle = 'Step 5 (Finance Director)', AppWfsDescription = 'Send an email notification to Finance Director for approve or unapprove the PO capital requisition.'
, AppWfsStepNumber = 5, AppWfsDisplayOrder = 5, AppWfsAddWorkflowUser = 0, AppWfsAddJDECompanyUser = 1
Where AppWorkflowStep = 11

Update AppWorkflowSteps Set AppWfsBrief = 'Step 6', AppWfsTitle = 'Step 6 (CFO)', AppWfsDescription = 'Send an email notification to Chief Financial Officer for approve or unapprove the PO capital requisition.'
, AppWfsStepNumber = 6, AppWfsDisplayOrder = 6, AppWfsAddWorkflowUser = 1, AppWfsAddJDECompanyUser = 0
Where AppWorkflowStep = 12

Update AppWorkflowSteps Set AppWfsBrief = 'Step 7', AppWfsTitle = 'Step 7 (CEO)', AppWfsDescription = 'Send an email notification to Chief Executive Officer for approve or unapprove the PO capital requisition.'
, AppWfsStepNumber = 7, AppWfsDisplayOrder = 7, AppWfsAddWorkflowUser = 1, AppWfsAddJDECompanyUser = 0
Where AppWorkflowStep = 13

/*
CT updated on 28th June 2016 11PM EST
*/

--ALTER TABLE dbo.HcmHouseCodes ADD HcmHoucFacilityId VARCHAR(16) NULL

-- Add the following key in srv\act\web.config file.
<add key="UserName" value="Compass-Usa\\Crothall_Service" />

-- Copy the following files manually
js folder
../emp/employeeImport/usr/BulkEmployeeImport.xlsx
../emp/employeePAF/usr/fin.emp.employeePaf.js
../emp/employeePAF/usr/pafeditor.htm
../emp/employeePAF/usr/paflist.htm
../emp/employeePAF/usr/style.css

net folder
../app/act/bin/crothall.chimes.fin.app.act.dll
../emp/act/bin/crothall.chimes.fin.cmn.rep.dll
../emp/act/bin/crothall.chimes.fin.emp.srv.dll

-- update the following files manually
js folder
../rpt/ssrsReport/usr/controllers.js

-- Add the following keys in teamfin service app.config file.
 <add key="EmployeeImportFilePath" value="D:\Users\Chandru\Dropbox (i3)\repos\js\crothall\js-crothall-chimes-fin\importFromJDE\"/>
 <add key="EmployeeBackupFilePath" value="D:\Users\Chandru\Dropbox (i3)\repos\js\crothall\js-crothall-chimes-fin\importFromJDE\Backup\"/>
 <add key="EmployeeImportFileName" value="CrothallNH_07252016_WOTC_2.csv"/>
 <add key="TempFilePath" value="D:\Users\Chandru\Dropbox (i3)\repos\js\crothall\js-crothall-chimes-fin\temp\" />
 <add key="EmployeeImportTemplateFilePath" value="D:\Users\Chandru\\Dropbox (i3)\repos\js\crothall\js-crothall-chimes-fin\emp\employeeImport\usr\BulkEmployeeImport.xlsx" />
 <add key="EmployeeImportNotificationEmail" value="chandru.balekkala@iicorporate.com"/>
 <add key="FinSMTPServer" value="172.29.25.152" />
 <add key="FinSenderEmail" value="teamfinpostoffice@crothall.com" />

--Update GetEmployeesDemoGraphicsSourceFirst function on CMDB database
Update dbo.EmpMaritalStatusFederalTaxTypes Set EmpMarsfttBrief = 'S' Where EmpMaritalStatusFederalTaxType = 1
Update dbo.EmpMaritalStatusFederalTaxTypes Set EmpMarsfttBrief = 'M' Where EmpMaritalStatusFederalTaxType = 2
Select * from EmpMaritalStatusFederalTaxTypes
Select * from EmpMaritalStatusStateTaxTypes

/*
Last production release version 2.04.020 on 10th August 2016 11PM EST
*/
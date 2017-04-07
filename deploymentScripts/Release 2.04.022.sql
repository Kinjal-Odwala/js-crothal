/*
Last production release version 2.04.021 on 30th November 2016 11PM EST
*/

Select * From Esmv2.dbo.M_ENV_ENVIRONMENTS
Update Esmv2.dbo.M_ENV_ENVIRONMENTS 
Set M_ENV_ENV_Application_Version = '2.04.022', M_ENV_ENV_Database_Version = '2.04.022' 
Where M_ENV_ENVIRONMENT = 4

Select * From dbo.HcmJobTypes
Insert Into dbo.HcmJobTypes(HcmJobtBrief, HcmJobtTitle, HcmJobtDescription, HcmJobtDisplayOrder, HcmJobtActive, HcmJobtModBy, HcmJobtModAt)
Values('Employee Spec', 'Employee Specification', 'Employee Specification', 5, 1, 'Compass-USA\Data Conversion', GetDate())

-- Verify before executing the following scripts
Select * From dbo.EmpEmployeeTypeMappings
INSERT INTO dbo.EmpEmployeeTypeMappings(EmpEtmTypeName, EmpEtmTypeTitle, EmpEtmTitle, EmpEtmActive, EmpEtmModBy, EmpEtmModAt)
VALUES ('EmpUnionType', 'Union 1', '-1', 1, 'Compass-USA\Data Conversion', GetDate())

-- Update the DisplayOrder field in EmpJobCodeTypes table
Select * From EmpJobCodeTypes
UPDATE x
SET x.EmpJobctDisplayOrder = x.New_Order
FROM (
      SELECT EmpJobctDisplayOrder, ROW_NUMBER() OVER (ORDER BY [EmpJobctTitle] Asc) AS New_Order
      FROM EmpJobCodeTypes
      ) x

-- Verify before executing the following scripts
Select * From dbo.EmpHRDDetails

Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'AR'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'LA'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'ND'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NE'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'KS'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'OK'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'SD'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'TX'), 'Katie Benfer', 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'CT'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'DC'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'DE'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'MA'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'MD'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'ME'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NH'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NJ'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NY'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'PA'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'RI'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'VT'), 'Kim Desarno', 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'GA'), 'Stephanie Drayton', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NC'), 'Stephanie Drayton', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'SC'), 'Stephanie Drayton', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'VA'), 'Stephanie Drayton', 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'AL'), 'Rob Harris', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'FL'), 'Rob Harris', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'MS'), 'Rob Harris', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'TN'), 'Rob Harris', 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'AK'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'AZ'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'CA'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'CO'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'ID'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'MT'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NM'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'NV'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'OR'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'UT'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'WA'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'WY'), 'Tracy Lewis', 1, 'Compass-USA\Data Conversion', GetDate())

Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'IA'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'IL'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'IN'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'KY'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'MN'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'MO'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'OH'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'WI'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())
Insert Into dbo.EmpHRDDetails(AppStateType, EmpHRDdName, EmpHRDdActive, EmpHRDdModBy, EmpHRDdModAt)
Values((Select AppStateType From EsmV2.dbo.AppStateTypes Where AppStatBrief = 'WV'), 'Lynn Macenko', 1, 'Compass-USA\Data Conversion', GetDate())

-- Update WomWorkOrderTasks [Begin]

Update WomWorkOrderTasks set WomwotMarkup = 0.00 where WomwotMarkup is Null
Update WomWorkOrderTasks set FscAccount = (select FscAccount from FscAccounts where FscAccCode = 4016) where WomwotTitle in ('Snow Removal', 'Window Cleaning', 'Landscaping')

INSERT INTO WomWorkOrderTasks (WomwotBrief, WomwotTitle, WomwotDescription, WomwotDisplayOrder, WomwotActive, WomwotModBy, WomwotModAt, FscAccount, WomwotMarkup)
VALUES ('Admin Operating', 'Admin Operating Costs', 'Admin Operating Costs', 199, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Admin Charge', 'Administrative Charge', 'Administrative Charge', 200, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('Advertising/Fees', 'Advertising/Fees', 'Advertising/Fees', 201, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Air Travel', 'Air Travel', 'Air Travel', 202, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4005), 0.00),
('Benefits Hourly', 'Benefits - Hourly', 'Benefits - Hourly', 203, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Benefits Manage', 'Benefits - Management', 'Benefits - Management', 204, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Biomed - Demand', 'Biomedical - Demand Services', 'Biomedical - Demand Services', 205, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4085), 0.00),
('Biomedical Parts', 'Biomedical - Parts', 'Biomedical - Parts', 206, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Biomed Supplies', 'Biomedical Supplies/Parts-Frgt', 'Biomedical Supplies/Parts-Frgt', 207, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Bonuses', 'Bonuses', 'Bonuses', 208, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Clean Room Supp', 'Clean Room Supplies', 'Clean Room Supplies', 209, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00), 
('CR Supp Freight', 'Clean Room Supplies - Freight', 'Clean Room Supplies - Freight', 210, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Client Paid Cost', 'Client Paid Costs', 'Client Paid Costs', 211, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('CP Holiday Pay', 'Client Paid Holiday Pay', 'Client Paid Holiday Pay', 212, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('Client Paid Oth', 'Client Paid Other', 'Client Paid Other', 213, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('CP Prod Labor', 'Client Paid Productive Labor', 'Client Paid Productive Labor', 214, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('CP Sick Pay', 'Client Paid Sick Pay', 'Client Paid Sick Pay', 215, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Client Paid Supp', 'Client Paid Supplies', 'Client Paid Supplies', 216, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('CP Supp Freight', 'Client Paid Supplies - Freight', 'Client Paid Supplies - Freight', 217, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('CP Utilities', 'Client Paid Utilities', 'Client Paid Utilities', 218, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('CP Util -Freight', 'Client Paid Utilities -Freight', 'Client Paid Utilities -Freight', 219, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('CP Vacation Pay', 'Client Paid Vacation Pay', 'Client Paid Vacation Pay', 220, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('Client Rebate', 'Client Rebate', 'Client Rebate', 221, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('COG Linen Reimb', 'COG Linen Reimbursement', 'COG Linen Reimbursement', 222, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4043), 0.00),
('Comp Rel Charge', 'Computer Related Charge', 'Computer Related Charge', 223, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Computer Supp', 'Computer Supplies', 'Computer Supplies', 224, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Construction', 'Construction', 'Construction', 225, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Consultant Exp', 'Consultant Expenses', 'Consultant Expenses', 226, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4016), 0.00),
('Consultants', 'Consultants', 'Consultants', 227, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4016), 0.00),
('Consultants-Comp', 'Consultants - Computer', 'Consultants - Computer', 228, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4016), 0.00),
('Contract Labor', 'Contract Labor', 'Contract Labor', 229, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Contract Lab Exp', 'Contract Labor Expenses', 'Contract Labor Expenses', 230, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Courier Services', 'Courier Services', 'Courier Services', 231, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('CP Tax/Ins/Fring', 'CP Taxes/Insurance/Fringe', 'CP Taxes/Insurance/Fringe', 232, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Crothall-Pension', 'Crothall - Pension', 'Crothall - Pension', 233, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Equip Reimburse', 'Equip Reimbursement', 'Equip Reimbursement', 234, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4050), 0.00),
('Fin Incentiv Inc', 'Financial Incentive Income', 'Financial Incentive Income', 235, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4095), 0.00),
('Fin Incent Reimb', 'Financial Incentive Reimb', 'Financial Incentive Reimb', 236, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4080), 0.00),
('Fringe -Passback', 'Fringe - Passback', 'Fringe - Passback', 237, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('FB - Admin', 'Fringe Benefits - Admin', 'Fringe Benefits - Admin', 238, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('FB - Management', 'Fringe Benefits - Management', 'Fringe Benefits - Management', 239, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Ground Transport', 'Ground Transportation', 'Ground Transportation', 240, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Grounds/Time&Mat', 'Grounds/Time & Materials', 'Grounds/Time & Materials', 241, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Grounds/Time &MF', 'Grounds/Time & Materials-Frght', 'Grounds/Time & Materials-Frght', 242, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Hand Soap Suppli', 'Hand Soap Supplies', 'Hand Soap Supplies', 243, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Hand Soap Sup-Ft', 'Hand Soap Supplies - Freight', 'Hand Soap Supplies - Freight', 244, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('HCR Ex Fee -Hrly', 'HCR Exchange Fee - Hrly', 'HCR Exchange Fee - Hrly', 245, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('HCR Ex Fee - Mgt', 'HCR Exchange Fee - Mgt', 'HCR Exchange Fee - Mgt', 246, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('HCR Reimburse', 'HCR Reimbursement', 'HCR Reimbursement', 247, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4047), 0.00),
('Health/Dental', 'Health/Dental', 'Health/Dental', 248, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Holiday Pay', 'Holiday Pay', 'Holiday Pay', 249, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Hour Fringe Bene', 'Hourly Fringe Benefits', 'Hourly Fringe Benefits', 250, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Hourly Payrol-CP', 'Hourly Payroll - Client Paid', 'Hourly Payroll - Client Paid', 251, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Hourly Pay-Cm Pd', 'Hourly Payroll - Company Pd', 'Hourly Payroll - Company Pd', 252, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Hourly Wages', 'Hourly Wages', 'Hourly Wages', 253, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00), 
('HRC Con charge', 'HRC Connectivity charge', 'HRC Connectivity charge', 254, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Initial Linen Pr', 'Initial Linen Purchase', 'Initial Linen Purchase', 255, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Int Plants&Decor', 'Interior Plants & Decor', 'Interior Plants & Decor', 256, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Janitorial', 'Janitorial', 'Janitorial', 257, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Janitorial Supp', 'Janitorial Supplies', 'Janitorial Supplies', 258, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Janitorl Sup-F/S', 'Janitorl Supp - Freight/Ship', 'Janitorl Supp - Freight/Ship', 259, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Labor Reimburse', 'Labor Reimbursement', 'Labor Reimbursement', 260, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4046), 0.00),
('Laundry', 'Laundry', 'Laundry', 261, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Laundry - Other', 'Laundry - Other', 'Laundry - Other', 262, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Laundry Chemical', 'Laundry Chemicals', 'Laundry Chemicals', 263, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Laundry Chem-Frg', 'Laundry Chemicals - Freight', 'Laundry Chemicals - Freight', 264, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Laundry Linen', 'Laundry Linen', 'Laundry Linen', 265, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Laundry Lin-F/S', 'Laundry Linen - Freight/Ship', 'Laundry Linen - Freight/Ship', 266, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Laundry Outsour', 'Laundry Outsourcing', 'Laundry Outsourcing', 267, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Linen Loss Reimb', 'Linen Loss Reimbursement', 'Linen Loss Reimbursement', 268, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4042), 0.00),
('Linen Surch Bill', 'Linen Surcharge Billing', 'Linen Surcharge Billing', 269, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4045), 0.00),
('Mailroom', 'Mailroom', 'Mailroom', 270, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Maint/Dem Svc-Fr', 'Maintenance/Demand Svcs -Frght', 'Maintenance/Demand Svcs -Frght', 271, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Mgmt Fringe Ben', 'Management Fringe Benefits', 'Management Fringe Benefits', 272, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Mgmnt Labor', 'Management Labor', 'Management Labor', 273, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Mgmnt Overtime', 'Management Overtime', 'Management Overtime', 274, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Mgmnt Payroll', 'Management Payroll', 'Management Payroll', 275, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Mgmnt Salary', 'Management Salary', 'Management Salary', 276, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Meals', 'Meals', 'Meals', 277, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Meeting/Conv/Sem', 'Meetings/Conventi/Seminars', 'Meetings/Conventi/Seminars', 278, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Misc Income', 'Miscellaneous Income', 'Miscellaneous Income', 279, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Other', 'Other', 'Other', 280, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Overtime', 'Overtime', 'Overtime', 281, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Paper Supplies', 'Paper Supplies', 'Paper Supplies', 282, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Paper Sup - F/S', 'Paper Supplies - Freight/Ship', 'Paper Supplies - Freight/Ship', 283, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Pest Control', 'Pest Control', 'Pest Control', 284, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4016), 0.00),
('Physical/BG Chec', 'Physical/Background Checks', 'Physical/Background Checks', 285, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Plastic Supplies', 'Plastic Supplies', 'Plastic Supplies', 286, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Plastic Supp F/S', ' Plastic Supplies -Freight/Ship', 'Plastic Supplies -Freight/Ship', 287, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Postage/Exp Mail', 'Postage/Express Mail', 'Postage/Express Mail', 288, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Prdctv Labor Dr', 'Prdctv Labor - Driver', 'Prdctv Labor - Driver', 289, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Prdctv Labor Ls', 'Prdctv Labor - Landscaping', 'Prdctv Labor - Landscaping', 290, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Prepay Discount', 'Prepayment Discount', 'Prepayment Discount', 291, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4070), 0.00),
('Printing&Station', 'Printing & Stationary', 'Printing & Stationary', 292, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Productive Labor', 'Productive Labor', 'Productive Labor', 293, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('QI - Bed Turns', 'QI - Bed Turns', 'QI - Bed Turns', 294, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4063), NULL),
('QI-Emp Satisfact', 'QI - Employee Satisfaction', 'QI - Employee Satisfaction', 295, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4062), NULL),
('QI - Financial', 'QI - Financial', 'QI - Financial', 296, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4064), 0.00),
('QI-Patient Satis', 'QI - Patient Satisfaction', 'QI - Patient Satisfaction', 297, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4061), 0.00),
('QI - PT KPI''s', 'QI - PT KPI''s', 'QI - PT KPI''s', 298, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4065), 0.00),
('Qual Incent Inc', 'Quality Incentive Income', 'Quality Incentive Income', 299, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4060), 0.00),
('Reim Direct Cost', 'Reimbursement Direct Costs', 'Reimbursement Direct Costs', 300, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Relocation-Accom', 'Relocation - Accomodations', 'Relocation - Accomodations', 301, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Relocation-Airfa', 'Relocation - Airfare', 'Relocation - Airfare', 302, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Relocation-Gen', 'Relocation - General', 'Relocation - General', 303, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Relocation-Meals', 'Relocation - Meals', 'Relocation - Meals', 304, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Rep/Main/Eqp Cal', 'Repairs/Maint/Eqpmt Calibr', 'Repairs/Maint/Eqpmt Calibr', 305, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Sick Pay', 'Sick Pay', 'Sick Pay', 306, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Snow Supp/ Other', 'Snow Supplies/ Other', 'Snow Supplies/ Other', 307, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Snow Sup/Othr-Fr', 'Snow Supplies/ Other - Frieght', 'Snow Supplies/ Other - Frieght', 308, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Std Hours Income', 'Standard Hours Income', 'Standard Hours Income', 309, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4085), 0.00),
('Subcont Billings', 'Subcontract Billings', 'Subcontract Billings', 310, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4016), NULL),
('Supplies', 'Supplies', 'Supplies', 311, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Supplies Surchar', 'Supplies Surcharge', 'Supplies Surcharge', 312, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Supplies, Other', 'Supplies, Other', 'Supplies, Other', 313, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Sup, Other-Fr/Sh', 'Supplies, Other - Freight/Ship', 'Supplies, Other - Freight/Ship', 314, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4017), 0.00),
('Svc Cont pas-thr', 'Svc Contract pass-through', 'Svc Contract pass-through', 315, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Telephone/Beeper', 'Telephone/Beepers', 'Telephone/Beepers', 316, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Training/Educat', 'Training/Education', 'Training/Education', 317, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Travel - Air', 'Travel - Air', 'Travel - Air', 318, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Travel-Emp Meals', 'Travel - Employee Meals', 'Travel - Employee Meals', 319, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Trvl-Grnd Transp', 'Travel - Ground Transportati', 'Travel - Ground Transportati', 320, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Travel-Hotel/Oth', 'Travel - Hotel/Other', 'Travel - Hotel/Other', 321, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Travel/Entertain', 'Travel/Entertainment', 'Travel/Entertainment', 322, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('UIC-Hourly-Canad', 'UIC - Hourly - Canada', 'UIC - Hourly - Canada', 323, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('UIC-Mgt-Canada', 'UIC - Mgt - Canada', 'UIC - Mgt - Canada', 324, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Uniforms', 'Uniforms', 'Uniforms', 325, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Uniform-Frg/Ship', 'Uniforms - Freight/Shipping', 'Uniforms - Freight/Shipping', 326, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4040), 0.00),
('Union - H & W', 'Union - H & W', 'Union - H & W', 327, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Union-Lg/Trng Fd', 'Union - Legal/Traing Fund', 'Union - Legal/Traing Fund', 328, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Union-Pension', 'Union - Pension', 'Union - Pension', 329, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Union Contributi', 'Union Contributions', 'Union Contributions', 330, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Utility Reimburs', 'Utility Reimbursement', 'Utility Reimbursement', 331, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4041), 0.00),
('Vacation Pay', 'Vacation Pay', 'Vacation Pay', 332, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00),
('Vehicle Fuel Rmb', 'Vehicle Fuel Reimbursement', 'Vehicle Fuel Reimbursement', 333, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4044), 0.00),
('Waste Removal', 'Waste Removal', 'Waste Removal', 334, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4016), 0.00),
('Worker Compensat', 'Worker''s Compensation', 'Worker''s Compensation', 335, 1, 'Compass-USA\Data Conversion', GetDate(), (select FscAccount from FscAccounts where FscAccCode = 4020), 0.00)

-- Update WomWorkOrderTasks [End]

--ALTER TABLE dbo.EmpPTOPlanTypes ADD EmpPtopPayStatusHourly BIT NULL
--ALTER TABLE dbo.EmpPTOPlanTypes ADD EmpPtopPayStatusSalary BIT NULL
--ALTER TABLE dbo.EmpPTOPlanTypes ADD EmpPtopStatuscategory INT NULL

-- Add security nodes for action menu items in PTO Setup - Employee PTO [Begin]
Declare @HirNode As Int
Declare @DisplayOrder Int

Select @DisplayOrder = Max(HirNode) From ESMV2.dbo.HirNodes
Select @HirNode = HirNode From ESMV2.dbo.HirNodes Where HirNodFullPath = '\crothall\chimes\fin\PTOSetup\EmployeePTO'
Insert Into ESMV2.dbo.HirNodes(HirHierarchy, HirLevel, HirNodeparent, HirNodBrief, HirNodTitle, HirNodDescription, HirNodDisplayOrder, HirNodActive, HirNodFullPath, HirNodLevel1, HirNodLevel2, HirNodLevel3, HirNodLevel4, HirNodLevel5, HirNodLevel6, HirNodModBy, HirNodModAt)
Values(1, 9, @HirNode, 'PTOPlanTypes', 'PTO Plan Types', 'PTO Plan Types', @DisplayOrder + 1, 1, '\crothall\chimes\fin\PTOSetup\EmployeePTO\PTOPlanTypes', 'crothall', 'chimes', 'fin', 'PTOSetup', 'EmployeePTO', 'PTOPlanTypes', 'Compass-USA\Data Conversion', GetDate())

Select * From EsmV2.dbo.HirNodes Where HirNodFullPath Like '\crothall\chimes\fin\PTOSetup\EmployeePTO%'
-- Add security nodes for action menu items in PTO Setup - Employee PTO [End]

Select * From dbo.HcmBudgetTemplates
INSERT INTO dbo.HcmBudgetTemplates(HcmBudgetTemplate, HcmBudtBrief, HcmBudtTitle, HcmBudtDescription, HcmBudtDisplayOrder, HcmBudtActive, HcmBudtModBy, HcmBudtModAt)
VALUES(8, 'HTS', 'HTS', 'Health Technical Services', 8, 1,'Compass-USA\Data Conversion', GetDate())

UPDATE dbo.BudStaffingHours SET BudStahPfcType = CASE BudStahPfcOnly WHEN 1 THEN 1 ELSE 2 END

/*
CT updated on 8th March 2017 11PM EST
*/

/*
CT updated on 22nd March 2017 11PM EST
*/

EXEC sp_rename 'EMPEMPLOYEETYPEMAPPINGS', 'EmpEmployeeTypeMappings'
EXEC sp_rename 'EMPPTOPLANASSIGNMENTS', 'EmpPTOPlanAssignments'
EXEC sp_rename 'HCMDEDUCTIONFREQUENCYTYPES', 'HcmDeductionFrequencyTypes'
EXEC sp_rename 'HCMHOUSECODEUNIONDEDUCTIONPAYRATERANGES', 'HcmHouseCodeUnionDeductionPayRateRanges'

--Update the following key values in TeamFin service app.config file
<add key="EmployeeImportNotificationEmail" value="Nicole.pasquarello@compass-usa.com"/>

--Add the following key values in TeamFin service app.config file
<add key="EmployeeImportProcessDailyReportEmailCC" value="Sandy.Bailey@compass-usa.com;Demetra.Bell@compass-usa.com;Patrick.Daly@compass-usa.com;Kelly.Segovia@compass-usa.com"/>

-- Copy the following files manually
js folder
../bud/res/scripts/all.js
../emp/planAssignment/usr/main.js
../emp/employeePTOSetup/usr/main.js
../rpt/ssrsReport/usr/controllers.js

net folder
../bud/act/bin/crothall.chimes.fin.bud.srv.dll

/*
Last production release version 2.04.022 on 29th March 2017 11PM EST
*/
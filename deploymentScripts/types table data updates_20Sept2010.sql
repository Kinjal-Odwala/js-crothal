Select * from Esmv2.dbo.AppIndustryTypes 
Select * from Esmv2.dbo.AppLocationTypes
Select * from Esmv2.dbo.AppProfitDesignationTypes
Select * from Esmv2.dbo.AppGPOTypes

Select * from Teamfinv2.dbo.HcmTermsOFcontractTypes
Select * from Teamfinv2.dbo.HcmServiceTypes


Truncate table Esmv2.dbo.AppIndustryTypes

Insert into Esmv2.dbo.AppIndustryTypes (AppIndtBrief,	AppIndtTitle,	AppIndtDescription,	AppIndtDisplayOrder,	AppIndtActive,	AppIndtModBy,	AppIndtModAt)
Values ('College','College','College',1,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppIndustryTypes (AppIndtBrief,	AppIndtTitle,	AppIndtDescription,	AppIndtDisplayOrder,	AppIndtActive,	AppIndtModBy,	AppIndtModAt)
Values ('Commercial','Commercial','Commercial',2,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppIndustryTypes (AppIndtBrief,	AppIndtTitle,	AppIndtDescription,	AppIndtDisplayOrder,	AppIndtActive,	AppIndtModBy,	AppIndtModAt)
Values ('Government','Government','Government',4,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppIndustryTypes (AppIndtBrief,	AppIndtTitle,	AppIndtDescription,	AppIndtDisplayOrder,	AppIndtActive,	AppIndtModBy,	AppIndtModAt)
Values ('Hospital','Hospital','Hospital',6,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppIndustryTypes (AppIndtBrief,	AppIndtTitle,	AppIndtDescription,	AppIndtDisplayOrder,	AppIndtActive,	AppIndtModBy,	AppIndtModAt)
Values ('Education','Education','Education',3,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppIndustryTypes (AppIndtBrief,	AppIndtTitle,	AppIndtDescription,	AppIndtDisplayOrder,	AppIndtActive,	AppIndtModBy,	AppIndtModAt)
Values ('Healthcare','Healthcare','Healthcare',5,1,'compass-usa\data conversion', getdate())

Truncate Table Esmv2.dbo.AppLocationTypes

Insert into Esmv2.dbo.AppLocationTypes (AppLoctBrief,AppLoctTitle,AppLoctDescription,AppLoctDisplayOrder,AppLoctActive,AppLoctModBy,AppLoctModAt)
Values ('Rural','Rural','Rural',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppLocationTypes (AppLoctBrief,AppLoctTitle,AppLoctDescription,AppLoctDisplayOrder,AppLoctActive,AppLoctModBy,AppLoctModAt)
Values ('Suburban','Suburban','Suburban',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppLocationTypes (AppLoctBrief,AppLoctTitle,AppLoctDescription,AppLoctDisplayOrder,AppLoctActive,AppLoctModBy,AppLoctModAt)
Values ('Urban','Urban','Urban',0,1,'compass-usa\data conversion', getdate())

Truncate Table Esmv2.dbo.AppProfitDesignationTypes

Insert into Esmv2.dbo.AppProfitDesignationTypes(AppProdtBrief,AppProdtTitle,AppProdtDescription,AppProdtDisplayOrder,AppProdtActive,AppProdtModBy,AppProdtModAt)
Values ('For Profit','For Profit','For Profit',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppProfitDesignationTypes(AppProdtBrief,AppProdtTitle,AppProdtDescription,AppProdtDisplayOrder,AppProdtActive,AppProdtModBy,AppProdtModAt)
Values ('Non Profit','Non Profit','Non Profit',0,1,'compass-usa\data conversion', getdate())

Truncate Table Esmv2.dbo.AppGPOTypes

Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('Amerinet','Amerinet','Amerinet',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('Broadlane','Broadlane','Broadlane',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('Consorta','Consorta','Consorta',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('HTPG','HTPG','HTPG',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('MedAssets','MedAssets','MedAssets',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('Novation','Novation','Novation',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('Other (Specify)','Other (Specify)','Other (Specify)',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('Premier','Premier','Premier',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('UHC','UHC','UHC',0,1,'compass-usa\data conversion', getdate())
Insert into Esmv2.dbo.AppGPOTypes(AppGPOtBrief,AppGPOtTitle,AppGPOtDescription,AppGPOtDisplayOrder,AppGPOtActive,AppGPOtModBy,AppGPOtModAt)
Values ('VHA','VHA','VHA',0,1,'compass-usa\data conversion', getdate())

Truncate Table Teamfinv2.dbo.HcmTermsOfContractTypes

Insert Into Teamfinv2.dbo.HcmTermsOfContractTypes(HcmTeroctBrief,HcmTeroctTitle,HcmTeroctDescription,HcmTeroctDisplayOrder,HcmTeroctActive,HcmTeroctModBy,HcmTeroctModAt)
Values ('Monthly','Monthly','Monthly',1,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmTermsOfContractTypes(HcmTeroctBrief,HcmTeroctTitle,HcmTeroctDescription,HcmTeroctDisplayOrder,HcmTeroctActive,HcmTeroctModBy,HcmTeroctModAt)
Values ('Yearly','Yearly','Yearly',2,1,'compass-usa\data conversion', getdate())

Truncate Table Teamfinv2.dbo.HcmServiceTypes

Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Biomedical Engg','Biomedical Engg','Biomedical Engg',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('CAM','CAM','CAM',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Central Distn','Central Distribution','Central Distribution',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Clean Room','Clean Room','Clean Room',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Construction','Construction','Construction',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('EVS','EVS','EVS',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('HRC','Hospitality Resource Center','Hospitality Resource Center',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Laundry','Laundry','Laundry',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Light Maint','Light Maintenance','Light Maintenance',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Linen Distn','Linen Distribution','Linen Distribution',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Mail Room','Mail Room','Mail Room',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Patient Trans','Patient Transport','Patient Transport',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('POM','POM','POM',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Security','Security','Security',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Business Service','Business Services','Business Services',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('CES','CES','CES',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Grounds','Grounds','Grounds',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('PSG','PSG','PSG',0,1,'compass-usa\data conversion', getdate())
Insert Into Teamfinv2.dbo.HcmServiceTypes(HcmSertBrief,HcmSertTitle,HcmSertDescription,HcmSertDisplayOrder,HcmSertActive,HcmSertModBy,HcmSertModAt)
Values ('Janitorial','Janitorial','Janitorial',0,1,'compass-usa\data conversion', getdate())

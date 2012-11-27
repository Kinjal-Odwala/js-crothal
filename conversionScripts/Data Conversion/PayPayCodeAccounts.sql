Declare @PayCode as varchar(20)
Declare @AccountCode as varchar(10)
Declare @JobCode as varchar(25)
Declare @RCount int, @PayPayCode int, @FscAccount int, @JobCodeType int
Set @RCount = 1

While 1=1
Begin
	if exists (Select * from TeamFin.dbo.PayCodesToAcctCodes where Id = @RCount )
	Begin
	
		Set @PayPayCode = 0
		Set @FscAccount = 0
		Set @JobCodeType = 0
		
		Select @PayCode = PayCode, @AccountCode = AcctCode, @JobCode = JobCode
			From TeamFin.dbo.PayCodesToAcctCodes Where Id = @RCount
			
		Print @PayCode Print @AccountCode Print @JobCode

		Select @PayPayCode = payPayCode From PayPayCodes where PayPayCBrief = @PayCode
		Select @FscAccount = FscAccount From FscAccounts where FscAccCode = @AccountCode
		Select @JobCodeType = EmpJobCodeType from EmpJobCodeTypes where EmpJobctTitle = @JobCode 

		INSERT INTO [TeamFinv2].[dbo].[PayPayCodeAccounts]
		   ([PayPayCode]
		   ,[FscAccount]
		   ,[EmpJobCodeType])
		VALUES
		   (@PayPayCode
		   ,@FscAccount
		   ,@JobCodeType)
	End


Set @RCount = @RCount+1
if @RCount > 560 Break
End
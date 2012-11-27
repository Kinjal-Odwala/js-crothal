use esmv2
go

/*declare @appUser int, @appRoleCurrent int, @pplperson int
set @appUSer = 2644
select @appRoleCurrent=appRoleCurrent, @pplperson=pplperson from appusers where appuser = @appuser
select pplperson, pplpeofirstname, pplpeolastname, hirnode from pplpeople where pplperson = @pplperson
select appuseusername, pplperson, approlecurrent from appusers where appuser = @appuser
select approle, hirnodecurrent, hirnodetop from approles where appuser = @appuser
select approle, hirnode from approlenodes where approle = @appRoleCurrent
select hirgroup from approlegroups where approle = @appRoleCurrent
*/

-- Setup ESmv2 User to have access to Esmv2 and Teamfinv2 Databases

update appusers set appuseusername = 'persistech\matt kay' where appuser = 3 --old id is crothall-usa\kaym01

update appusers set appuseusername = 'persistech\chandru balekkala' where appuser = 4
update pplpeople set pplpeofirstname = 'Chandru', pplpeolastname = 'Balekkala' where pplperson = (select pplperson from appusers where appuser = 4)

update appusers set appuseusername = 'persistech\anis shikalgar' where appuser = 6
update pplpeople set pplpeofirstname = 'anisiiT', pplpeolastname = 'shikalgar' where pplperson = (select pplperson from appusers where appuser = 6)
update appusers set appusepassword ='Test123' where appuser = 6
--select * from approles where appuser = 6
delete from approlegroups where approle = 417
insert into approlegroups values (417,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 417
delete from approlenodes where approle = 417
insert into approlenodes values (417, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\shilpa priyadarshini' where appuser = 63
update pplpeople set pplpeofirstname = 'ShilpaiiT', pplpeolastname = 'Priyadarshini' where pplperson = (select pplperson from appusers where appuser = 63)

update appusers set appuseusername = 'persistech\raymond liu' where appuser = 107
update pplpeople set pplpeofirstname = 'RaymondiiT', pplpeolastname = 'Liu' where pplperson = (select pplperson from appusers where appuser = 107)

update appusers set appuseusername = 'RAYMOND-DEV-XP\Raymond Liu' where appuser = 201
update pplpeople set pplpeofirstname = 'RaymondDev', pplpeolastname = 'Liu' where pplperson = (select pplperson from appusers where appuser = 201)

update appusers set appuseusername = 'persistech\trisha etz' where appuser = 317
update pplpeople set pplpeofirstname = 'TrishaiiT', pplpeolastname = 'Etz' where pplperson = (select pplperson from appusers where appuser = 317)
update appusers set appusepassword ='Test123' where appuser = 317
--SElect * from approles where appuser = 317
--SElect * from approlegroups where approle = 329
delete from approlegroups where approle = 329
insert into approlegroups values (329,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 329
delete from approlenodes where approle = 329
insert into approlenodes values (329, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'queenie-vpc/Administrator/1959' where appuser = 973
update pplpeople set pplpeofirstname = 'Queenie1', pplpeolastname = 'Han' where pplperson = (select pplperson from appusers where appuser = 973)

update appusers set appuseusername = 'QUEENIE-VPC\Queenie' where appuser = 1581
update pplpeople set pplpeofirstname = 'Queenie2', pplpeolastname = 'Han' where pplperson = (select pplperson from appusers where appuser = 1581)

update appusers set appuseusername = 'Persistech\Queenie Han' where appuser = 1630
update pplpeople set pplpeofirstname = 'Queenie3', pplpeolastname = 'Han' where pplperson = (select pplperson from appusers where appuser = 1630)

update appusers set appuseusername = 'persistech\ryan mcdonald' where appuser = 1795
update pplpeople set pplpeofirstname = 'RyaniiT', pplpeolastname = 'Mac' where pplperson = (select pplperson from appusers where appuser = 1795)
--SElect * from approles where appuser = 1795
delete from approlegroups where approle = 1832
insert into approlegroups values (1832,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1832
delete from approlenodes where approle = 1832
insert into approlenodes values (1832, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\kishor pandey' where appuser = 1799
update pplpeople set pplpeofirstname = 'KishoriiT', pplpeolastname = 'Pandey' where pplperson = (select pplperson from appusers where appuser = 1799)
--SElect * from approles where appuser = 1799
delete from approlegroups where approle = 1836
insert into approlegroups values (1836,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1832
delete from approlenodes where approle = 1836
insert into approlenodes values (1836, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\ashwin kumar' where appuser = 1808
update pplpeople set pplpeofirstname = 'AshwiniiT', pplpeolastname = 'Kumar' where pplperson = (select pplperson from appusers where appuser = 1808)

--Coach Users
update appusers set appuseusername = 'Persistech\Venu Madhav' where appuser = 1843
update pplpeople set pplpeofirstname = 'VenuiiT', pplpeolastname = 'Madhav', pplpeobrief = 'venumadhav' where pplperson = (select pplperson from appusers where appuser = 1843)
delete from approlegroups where approle = 1880
insert into approlegroups values (1880,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1880
delete from approlenodes where approle = 1880
insert into approlenodes values (1880, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'Persistech\Shantilaxmi Patro' where appuser = 1793
update pplpeople set pplpeofirstname = 'ShantiiiT', pplpeolastname = 'Patro', pplpeobrief = 'shantipatro' where pplperson = (select pplperson from appusers where appuser = 1793)
delete from approlegroups where approle = 1830
insert into approlegroups values (1830,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1830
delete from approlenodes where approle = 1830
insert into approlenodes values (1830, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'Persistech\Rajendra Sahu' where appuser = 1797
update pplpeople set pplpeofirstname = 'Rajendra', pplpeolastname = 'Sahu', pplpeobrief = 'rajsahu' where pplperson = (select pplperson from appusers where appuser = 1797)
delete from approlegroups where approle = 1834
insert into approlegroups values (1834,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1834
delete from approlenodes where approle = 1834
insert into approlenodes values (1834, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'Persistech\John Sudhakar' where appuser = 1806
update pplpeople set pplpeofirstname = 'JohniiT', pplpeolastname = 'Sudha', pplpeobrief = 'johnsudha' where pplperson = (select pplperson from appusers where appuser = 1806)
delete from approlegroups where approle = 1843
insert into approlegroups values (1843,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1843
delete from approlenodes where approle = 1843
insert into approlenodes values (1843, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\hemant vyas' where appuser = 1809
update pplpeople set pplpeofirstname = 'HemnatiiT', pplpeolastname = 'Vyas', pplpeobrief = 'hemantvyas' where pplperson = (select pplperson from appusers where appuser = 1809)
delete from approlegroups where approle = 1846
insert into approlegroups values (1846,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1846
delete from approlenodes where approle = 1846
insert into approlenodes values (1846, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'MINDFIRE\shantilaxmip' where appuser = 1762
update pplpeople set pplpeofirstname = 'ShantiMind', pplpeolastname = 'Patro', pplpeobrief='shantipatro' where pplperson = (select pplperson from appusers where appuser = 1762)
delete from approlegroups where approle = 1799
insert into approlegroups values (1799,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1799
delete from approlenodes where approle = 1799
insert into approlenodes values (1799, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'MINDFIRE\rajendras' where appuser = 1835
update pplpeople set pplpeofirstname = 'RajendraMind', pplpeolastname = 'Sahu', pplpeobrief='rajsahu' where pplperson = (select pplperson from appusers where appuser = 1835)
delete from approlegroups where approle = 1872
insert into approlegroups values (1872,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1872
delete from approlenodes where approle = 1872
insert into approlenodes values (1872, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\sadheesh subramaniam' where appuser = 2981
update pplpeople set pplpeofirstname = 'sadheesh', pplpeolastname = 'subramaniam', pplpeobrief = 'persistech\sadhs' where pplperson = (select pplperson from appusers where appuser = 2981)
delete from approlegroups where approle = 3022
insert into approlegroups values (3022,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 3022
delete from approlenodes where approle = 3022
insert into approlenodes values (3022, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\yalloji rao' where appuser = 2644
update pplpeople set pplpeofirstname = 'yalloji', pplpeolastname = 'rao', pplpeobrief = 'persistech\yall' where pplperson = (select pplperson from appusers where appuser = 2644)
delete from approlegroups where approle = 2684
insert into approlegroups values (2684,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 2684
delete from approlenodes where approle = 2684
insert into approlenodes values (2684, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'persistech\isha begum' where appuser = 3045
update pplpeople set pplpeofirstname = 'isha', pplpeolastname = 'begum', pplpeobrief = 'persistech\isha' where pplperson = (select pplperson from appusers where appuser = 3045)

update appusers set appuseusername = 'persistech\kiran kommi' where appuser = 3077
update pplpeople set pplpeofirstname = 'kiran', pplpeolastname = 'kommi', pplpeobrief = 'persistech\kkk' where pplperson = (select pplperson from appusers where appuser = 3077)

update appusers set appuseusername = 'Time',appusepassword = 'Test123' where appuser = 3136
update pplpeople set pplpeofirstname = 'time', pplpeolastname = 'test', pplpeobrief = 'timetest0515' where pplperson = (select pplperson from appusers where appuser = 3136)
--select * from approles where appuser = 3136
delete from approlegroups where approle = 3184
insert into approlegroups values (3184,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 3184
delete from approlenodes where approle = 3184
insert into approlenodes values (3184, 1, 'compass-usa\iisetup', getdate())

/*

Select * from approles where hirnodecurrent =1 and appuser not 
in (3, 4, 6, 63, 107, 201, 317, 329, 973, 1581, 1630, 1678, 1762, 1772, 1793, 1795, 1797, 1799
, 1806, 1808, 1809, 1830, 1832, 1833, 1834, 1835, 1843, 1846, 1848, 1872, 1880, 1799
, 2644, 2684, 2981, 3022, 3045, 3077,3136) and appuser > 3136

use esmv2
go
exec appmenuitemsselect 'time', '\crothall\chimes\fin'
*/

Exec HirNodAuthorizationSelect 'time', '\crothall\chimes\fin\report'
select * from appusers order by appuselastlogon desc

update appusers set appuselastlogon = '1/1/1900' where appuselastlogon is null

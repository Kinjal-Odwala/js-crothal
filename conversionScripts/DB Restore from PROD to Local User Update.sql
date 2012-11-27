select * from appusers where appuser not in (4,6,1799,1808,1845,1843,1880,1806,2944,2981)

update appusers set appuseusername = 'Surisoft\chandru' where appuser = 4
update pplpeople set pplpeofirstname = 'Chandru', pplpeolastname = 'Balekkala' where pplperson = (select pplperson from appusers where appuser = 4)

update appusers set appuseusername = 'Surisoft\anis' where appuser = 6
update pplpeople set pplpeofirstname = 'anisiiT', pplpeolastname = 'shikalgar' where pplperson = (select pplperson from appusers where appuser = 6)

update appusers set appuseusername = 'Surisoft\kishor' where appuser = 1799
update pplpeople set pplpeofirstname = 'KishoriiT', pplpeolastname = 'Pandey' where pplperson = (select pplperson from appusers where appuser = 1799)
delete from approlegroups where approle = 1836
insert into approlegroups values (1836,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1836
delete from approlenodes where approle = 1836
insert into approlenodes values (1836, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'IIS APPPOOL\asp2.0' where appuser = 3
update pplpeople set pplpeofirstname = 'KishorlocalDup', pplpeolastname = 'Pandey' where pplperson = (select pplperson from appusers where appuser = 3)
--select * from approles where appuser = 3

update appusers set appuseusername = 'Surisoft\ashwin' where appuser = 1808
update pplpeople set pplpeofirstname = 'AshwiniiT', pplpeolastname = 'Kumar' where pplperson = (select pplperson from appusers where appuser = 1808)
delete from approlegroups where approle = 1845
insert into approlegroups values (1845,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1845
delete from approlenodes where approle = 1845
insert into approlenodes values (1845, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'Surisoft\Venu' where appuser = 1843
update pplpeople set pplpeofirstname = 'VenuiiT', pplpeolastname = 'Madhav', pplpeobrief = 'venumadhav' where pplperson = (select pplperson from appusers where appuser = 1843)
delete from approlegroups where approle = 1880
insert into approlegroups values (1880,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1880
delete from approlenodes where approle = 1880
insert into approlenodes values (1880, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'Surisoft\John' where appuser = 1806
update pplpeople set pplpeofirstname = 'JohniiT', pplpeolastname = 'Sudha', pplpeobrief = 'johnsudha' where pplperson = (select pplperson from appusers where appuser = 1806)
delete from approlegroups where approle = 1843
insert into approlegroups values (1843,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 1843
delete from approlenodes where approle = 1843
insert into approlenodes values (1843, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'sadheeshold' where appuser = 317
update appusers set appuseusername = 'Surisoft\Sadheesh' where appuser = 2981
update pplpeople set pplpeofirstname = 'sadheesh', pplpeolastname = 'subramaniam', pplpeobrief = 'Surisoft\sadhs' where pplperson = (select pplperson from appusers where appuser = 2981)
delete from approlegroups where approle = 3022
insert into approlegroups values (3022,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 3022
delete from approlenodes where approle = 3022
insert into approlenodes values (3022, 1, 'compass-usa\iisetup', getdate())

update appusers set appuseusername = 'Surisoft\kiran' where appuser = 2644
update pplpeople set pplpeofirstname = 'kiran', pplpeolastname = 'kommi', pplpeobrief = 'Surisoft\kira' where pplperson = (select pplperson from appusers where appuser = 2644)
delete from approlegroups where approle = 2684
insert into approlegroups values (2684,1,'compass-usa\iisetup', getdate())
update approles set hirnodecurrent = 1, hirnodetop =1 where approle = 2684
delete from approlenodes where approle = 2684
insert into approlenodes values (2684, 1, 'compass-usa\iisetup', getdate())

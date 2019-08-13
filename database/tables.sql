
create table currency
(
  currencyid serial not null primary key,
  code char(3) not null,
  name varchar(30) not null 
);

create table rate
(
  rateid serial not null primary key,
  currencyid int not null references currency(currencyid),
  date timestamp not null,
  buyrate numeric(12,4) not null,
  sellrate numeric(12,4) not null
);

create table cash
(
  currencyid int not null primary key references currency(currencyid),
  amount numeric(12,2) not null 
);

create table transactions
(
  transactionid serial not null primary key,
  transactiontypeid int not null, -- 1 - buy, 2 - sell, 3 - send, 4 - receive
  currencyid int not null references currency(currencyid),
  amount numeric(12,2) not null,
  date timestamp not null,
  rate numeric(12,4) not null,
  commission numeric(12,4) null,
  note varchar(100) null,
  username varchar(50) null
); 

CREATE INDEX idx_transaction_currencyid 
    ON public.transactions USING btree (currencyid);

create table setting
(
  settingid serial not null primary key,
  name varchar(100) not null,
  value numeric(8,2) not null
);

insert into currency(code,name)
select 'USD', 'United States dollar'
union all
select 'EUR', 'European euro'
union all
select 'GBP', 'Pound sterling'
union all
select 'ILS', 'Israeli new shekel'
union all
select 'TRY', 'Turkish lira'
union all
select 'CAD', 'Canadian dollar'
union all
select 'CNY', 'Chinese Yuan Renminbi';

insert into rate (currencyid, date, buyrate, sellrate)
select c.currencyid, now(), 1.1075, 1.1203
from currency c
where code='EUR'
union all
select c.currencyid, now(), 1.2014, 1.2256
from currency c
where code='GBP'
union all
select c.currencyid, now(), 0.2828, 0.2886
from currency c
where code='ILS'
union all
select c.currencyid, now(), 0.1768, 0.1804
from currency c
where code='TRY'
union all
select c.currencyid, now(), 0.7402, 0.7552
from currency c
where code='CAD'
union all
select c.currencyid, now(), 0.1430, 0.1458
from currency c
where code='CNY';


insert into cash(currencyid, amount)
select c.currencyid, 5000
from currency c
where code='USD'
union all
select c.currencyid, 5000
from currency c
where code='EUR'
union all
select c.currencyid, 5000
from currency c
where code='GBP'
union all
select c.currencyid, 5000
from currency c
where code='ILS'
union all
select c.currencyid, 5000
from currency c
where code='TRY'
union all
select c.currencyid, 5000
from currency c
where code='CAD'
union all
select c.currencyid, 5000
from currency c
where code='CNY';

insert into setting(name, value)
select 'RefreshPeriod', 10
union all
select 'Commission', 2
union all
select 'Surcharge', 2
union all
select 'MinimalCommission', 2
union all
select 'BuySellRateMargin', 2;
union all
select 'MinimalCurrencyRest', 1000;

/* 
drop table setting;
drop table cash;
drop table rate;
drop table transactions;
drop table currency;
*/

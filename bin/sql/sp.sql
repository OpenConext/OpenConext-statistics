select
ps.logins AS logins,
ps.users AS users,
p.type AS period_type,
p.period AS period,
p.year AS year,
p.from AS period_from,
s.entityid AS sp_entityid,
s.environment AS sp_env
from statsview_periodstats_sptotal ps
inner join statsview_period p on p.id = ps.period_id
inner join statsview_sp s on s.id = ps.sp_id
where s.entityid = '@@entityid@@' and p.type <> 'a'
and p.year < 2018 and s.environment = '@@environment@@'
select
ps.logins AS logins,
ps.users AS users,
p.type AS period_type,
p.period AS period,
p.year AS year,
p.from AS period_from,
i.entityid AS idp_entityid,
i.environment AS idp_env
from statsview_periodstats_idptotal ps
inner join statsview_period p on p.id = ps.period_id
inner join statsview_idp i on i.id = ps.idp_id
where i.entityid = '@@entityid@@' and p.type <> 'a'
and p.year < 2018 and i.environment = '@@environment@@'
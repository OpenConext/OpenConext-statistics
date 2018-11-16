select
ps.logins AS logins,
ps.users AS users,
p.type AS period_type,
p.period AS period,
p.year AS year,
p.from AS period_from,
i.entityid AS idp_entityid,
i.environment AS idp_env,
s.entityid AS sp_entityid,
s.environment AS sp_env from statsview_periodstats ps
inner join statsview_period p on p.id = ps.period_id
inner join statsview_idp i on i.id = ps.idp_id
inner join statsview_sp s on s.id = ps.sp_id
where p.type = 'd' and i.environment <> 'U' and s.environment <> 'U'
and  DATE(p.from) = '@@date@@';
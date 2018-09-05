select
svp.type AS period_type,
svp.period AS period,
svp.year AS year,
svp.from AS period_from,
svp.logins AS logins,
svp.users AS users
from statsview_period svp
where svp.year < 2018 and svp.environment = '@@environment@@' and svp.type <> 'a'
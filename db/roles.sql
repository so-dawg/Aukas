
CREATE USER kanha
WITH PASSWORD 'Kanha@123';

CREATE USER pheaktra
WITH PASSWORD 'Pheaktra@123';


CREATE ROLE database_admin;
CREATE ROLE backend_developer;


GRANT CONNECT ON DATABASE opportunities_hub TO database_admin;
GRANT USAGE ON SCHEMA public TO database_admin;

GRANT ALL PRIVILEGES
ON ALL TABLES IN SCHEMA public
TO database_admin;

GRANT ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA public
TO database_admin;

GRANT CONNECT ON DATABASE opportunities_hub TO backend_developer;
GRANT USAGE ON SCHEMA public TO backend_developer;

GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO backend_developer;

GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO backend_developer;

GRANT database_admin TO kanha;
GRANT backend_developer TO pheaktra;
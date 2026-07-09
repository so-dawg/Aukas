-- ===========================================
-- AUKAS Opportunity Hub
-- PostgreSQL User Roles & Privileges
-- ===========================================

-- Create Roles
CREATE ROLE aukas_admin LOGIN PASSWORD 'Admin@123';
CREATE ROLE aukas_organization LOGIN PASSWORD 'Org@123';
CREATE ROLE aukas_student LOGIN PASSWORD 'Student@123';

------------------------------------------------------------
-- Database Connection
------------------------------------------------------------
GRANT CONNECT ON DATABASE opportunities_hub TO aukas_admin;
GRANT CONNECT ON DATABASE opportunities_hub TO aukas_organization;
GRANT CONNECT ON DATABASE opportunities_hub TO aukas_student;

------------------------------------------------------------
-- Allow schema access
------------------------------------------------------------
GRANT USAGE ON SCHEMA public
TO aukas_admin,
   aukas_organization,
   aukas_student;

------------------------------------------------------------
-- Admin Permissions
------------------------------------------------------------
GRANT ALL PRIVILEGES
ON ALL TABLES IN SCHEMA public
TO aukas_admin;

GRANT ALL PRIVILEGES
ON ALL SEQUENCES IN SCHEMA public
TO aukas_admin;

------------------------------------------------------------
-- Organization Permissions
------------------------------------------------------------
GRANT SELECT, INSERT, UPDATE
ON ALL TABLES IN SCHEMA public
TO aukas_organization;

------------------------------------------------------------
-- Student Permissions
------------------------------------------------------------
GRANT SELECT
ON ALL TABLES IN SCHEMA public
TO aukas_student;

GRANT INSERT
ON TABLE applications
TO aukas_student;

GRANT INSERT
ON TABLE bookmarks
TO aukas_student;
-- ===========================================
-- AUKAS Opportunity Hub
-- Meaningful SQL Queries
-- PostgreSQL
-- ===========================================

------------------------------------------------------------
-- Query 1
-- Display all users
------------------------------------------------------------
SELECT id, full_name, email, role, created_at
FROM users
ORDER BY created_at DESC;

------------------------------------------------------------
-- Query 2
-- Display all opportunities with organization names
------------------------------------------------------------
SELECT
    o.title,
    org.org_name,
    o.location,
    o.deadline,
    o.status
FROM opportunities o
JOIN organizations org
ON o.organization_id = org.user_id
ORDER BY o.deadline;

------------------------------------------------------------
-- Query 3
-- Display opportunities with category names
------------------------------------------------------------
SELECT
    o.title,
    c.name AS category,
    o.location,
    o.deadline
FROM opportunities o
JOIN categories c
ON o.category_id = c.id
ORDER BY c.name;

------------------------------------------------------------
-- Query 4
-- Count opportunities posted by each organization
------------------------------------------------------------
SELECT
    org.org_name,
    COUNT(o.id) AS total_opportunities
FROM organizations org
LEFT JOIN opportunities o
ON org.user_id = o.organization_id
GROUP BY org.org_name
ORDER BY total_opportunities DESC;

------------------------------------------------------------
-- Query 5
-- Show all students and the opportunities they applied for
------------------------------------------------------------
SELECT
    u.full_name,
    o.title,
    a.status,
    a.applied_at
FROM applications a
JOIN users u
ON a.student_id = u.id
JOIN opportunities o
ON a.opportunity_id = o.id
ORDER BY u.full_name;

------------------------------------------------------------
-- Query 6
-- Count total applications for each opportunity
------------------------------------------------------------
SELECT
    o.title,
    COUNT(a.id) AS total_applications
FROM opportunities o
LEFT JOIN applications a
ON o.id = a.opportunity_id
GROUP BY o.title
ORDER BY total_applications DESC;

------------------------------------------------------------
-- Query 7
-- Display all bookmarked opportunities
------------------------------------------------------------
SELECT
    u.full_name,
    o.title,
    b.saved_at
FROM bookmarks b
JOIN users u
ON b.student_id = u.id
JOIN opportunities o
ON b.opportunity_id = o.id
ORDER BY b.saved_at DESC;

------------------------------------------------------------
-- Query 8
-- Find all approved opportunities
------------------------------------------------------------
SELECT
    title,
    location,
    deadline
FROM opportunities
WHERE status = 'approved'
ORDER BY deadline;

------------------------------------------------------------
-- Query 9
-- Find opportunities closing within the next 30 days
------------------------------------------------------------
SELECT
    title,
    deadline
FROM opportunities
WHERE deadline BETWEEN CURRENT_DATE
AND CURRENT_DATE + INTERVAL '30 days'
ORDER BY deadline;

------------------------------------------------------------
-- Query 10
-- Count users based on their roles
------------------------------------------------------------
SELECT
    role,
    COUNT(*) AS total_users
FROM users
GROUP BY role
ORDER BY total_users DESC;

------------------------------------------------------------
-- Query 11
-- List verified organizations only
------------------------------------------------------------
SELECT
    org_name,
    website
FROM organizations
WHERE verified = TRUE;

------------------------------------------------------------
-- Query 12
-- Show opportunities approved by the admin
------------------------------------------------------------
SELECT
    o.title,
    u.full_name AS approved_by
FROM opportunities o
JOIN users u
ON o.approved_by = u.id
WHERE o.approved_by IS NOT NULL;
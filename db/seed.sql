-- Apply against a database that already has the schema:
--   docker exec -i aukas-db psql -U opportunities -d opportunities_hub < db/seed.sql
--
-- Idempotent: wipes user/opportunity data, leaves categories untouched.
-- password_hash values are placeholders; real auth lands in Week 3+.

BEGIN;

TRUNCATE TABLE applications, bookmarks, opportunities, students, organizations, users
  RESTART IDENTITY CASCADE;

-- =============================================================================
-- Users  (1 admin, 3 organizations, 3 students)
-- =============================================================================
INSERT INTO users (email, password_hash, full_name, role) VALUES
  ('admin@aukas.test',     '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Aukas Admin',         'admin'),
  ('hr@mekongtech.test',   '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Mekong Tech HR',      'organization'),
  ('jobs@angkormob.test',  '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Angkor Mobility',     'organization'),
  ('hello@tonlesap.test',  '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Tonle Sap NGO',       'organization'),
  ('sopheak@student.test', '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Sopheak Chan',        'student'),
  ('dara@student.test',    '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Dara Ouk',            'student'),
  ('mealea@student.test',  '$2b$10$placeholderhashplaceholderhashplaceholderhashplacehol', 'Mealea Sam',          'student');

-- Organization profiles (2 verified, 1 unverified)
INSERT INTO organizations (user_id, org_name, website, description, verified)
SELECT id, 'Mekong Tech Co.',         'https://mekongtech.example',   'Software studio building products for the Cambodian market.', true
  FROM users WHERE email = 'hr@mekongtech.test';
INSERT INTO organizations (user_id, org_name, website, description, verified)
SELECT id, 'Angkor Mobility',         'https://angkormob.example',    'Ride-hailing and delivery platform across Phnom Penh.',       true
  FROM users WHERE email = 'jobs@angkormob.test';
INSERT INTO organizations (user_id, org_name, website, description, verified)
SELECT id, 'Tonle Sap Conservation',  'https://tonlesap.example',     'Freshwater ecosystem NGO around the Tonle Sap lake.',         false
  FROM users WHERE email = 'hello@tonlesap.test';

-- Student profiles
INSERT INTO students (user_id, university, major, year_of_study)
SELECT id, 'Royal University of Phnom Penh',     'Information Technology',  3
  FROM users WHERE email = 'sopheak@student.test';
INSERT INTO students (user_id, university, major, year_of_study)
SELECT id, 'Institute of Technology of Cambodia', 'Computer Science',       4
  FROM users WHERE email = 'dara@student.test';
INSERT INTO students (user_id, university, major, year_of_study)
SELECT id, 'American University of Phnom Penh',   'Business Administration', 2
  FROM users WHERE email = 'mealea@student.test';

-- =============================================================================
-- Opportunities  (12 rows: 9 approved, 1 pending, 1 draft, 1 rejected)
-- type is auto-set from the category by the sync_opportunity_type trigger.
-- =============================================================================
INSERT INTO opportunities (organization_id, category_id, approved_by, title, description, location, deadline, status) VALUES
  ( (SELECT user_id FROM organizations WHERE org_name = 'Mekong Tech Co.'),
    (SELECT id      FROM categories    WHERE slug = 'internship'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Backend Engineering Intern',
    'Three-month paid internship building Node.js and PostgreSQL APIs. Open to 3rd and 4th year IT students.',
    'Phnom Penh', '2026-06-30', 'approved' ),
  ( (SELECT user_id FROM organizations WHERE org_name = 'Mekong Tech Co.'),
    (SELECT id      FROM categories    WHERE slug = 'job'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Junior DevOps Engineer',
    'Maintain CI/CD pipelines and container deployments. Linux + Docker required.',
    'Phnom Penh', '2026-07-15', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Mekong Tech Co.'),
    (SELECT id      FROM categories    WHERE slug = 'scholarship'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Mekong Tech Scholarship 2026',
    'Full-tuition scholarship for one final-year IT student. Includes 6-month mentorship.',
    'Phnom Penh', '2026-07-31', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Angkor Mobility'),
    (SELECT id      FROM categories    WHERE slug = 'internship'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Frontend Intern (React Native)',
    'Help ship features for the driver and rider mobile apps. Stipend + lunch provided.',
    'Phnom Penh', '2026-06-10', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Angkor Mobility'),
    (SELECT id      FROM categories    WHERE slug = 'job'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Data Analyst',
    'SQL-heavy analytics role. Build dashboards for the operations and growth teams.',
    'Phnom Penh', '2026-08-01', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Angkor Mobility'),
    (SELECT id      FROM categories    WHERE slug = 'competition'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Angkor Hack 2026',
    '48-hour hackathon for university students. Build a transportation feature. Prize pool $5,000.',
    'Phnom Penh', '2026-07-05', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Angkor Mobility'),
    (SELECT id      FROM categories    WHERE slug = 'scholarship'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Women in Tech Scholarship',
    '$2,000 scholarship for women pursuing computer science degrees in Cambodia.',
    'Remote',      '2026-08-15', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Tonle Sap Conservation'),
    (SELECT id      FROM categories    WHERE slug = 'volunteer'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Freshwater Survey Volunteer',
    'Two-week field program monitoring fish populations on the Tonle Sap. Training provided.',
    'Siem Reap',   '2026-06-20', 'approved' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Tonle Sap Conservation'),
    (SELECT id      FROM categories    WHERE slug = 'volunteer'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Community Outreach Coordinator',
    'Weekend volunteer role running environmental education workshops in lakeside villages.',
    'Siem Reap',   '2026-09-30', 'approved' ),

  -- Not yet approved
  ( (SELECT user_id FROM organizations WHERE org_name = 'Mekong Tech Co.'),
    (SELECT id      FROM categories    WHERE slug = 'internship'),
    NULL,
    'QA Automation Intern',
    'Write Playwright tests for the customer portal. Awaiting admin review.',
    'Phnom Penh', '2026-07-20', 'pending' ),

  ( (SELECT user_id FROM organizations WHERE org_name = 'Angkor Mobility'),
    (SELECT id      FROM categories    WHERE slug = 'job'),
    NULL,
    'Product Manager',
    'Lead product strategy for the driver app. Draft, not yet submitted by the organization.',
    'Phnom Penh', '2026-09-01', 'draft' ),
  ( (SELECT user_id FROM organizations WHERE org_name = 'Tonle Sap Conservation'),
    (SELECT id      FROM categories    WHERE slug = 'competition'),
    (SELECT id      FROM users         WHERE email = 'admin@aukas.test'),
    'Eco Innovation Challenge',
    'Rejected by moderation: missing judging criteria and prize details.',
    'Siem Reap',  '2026-07-10', 'rejected' );

-- =============================================================================
-- Bookmarks  (so saved-items pages have content)
-- =============================================================================
INSERT INTO bookmarks (student_id, opportunity_id)
SELECT (SELECT id FROM users WHERE email = 'sopheak@student.test'),
       o.id
FROM opportunities o
WHERE o.title IN ('Backend Engineering Intern',
                  'Mekong Tech Scholarship 2026',
                  'Angkor Hack 2026');

INSERT INTO bookmarks (student_id, opportunity_id)
SELECT (SELECT id FROM users WHERE email = 'dara@student.test'),
       o.id
FROM opportunities o
WHERE o.title IN ('Junior DevOps Engineer', 'Data Analyst');

-- =============================================================================
-- Applications  (click-apply records, with a few advanced statuses)
-- =============================================================================
INSERT INTO applications (student_id, opportunity_id, status)
SELECT (SELECT id FROM users WHERE email = 'sopheak@student.test'),
       o.id, 'clicked'
FROM opportunities o WHERE o.title = 'Backend Engineering Intern';

INSERT INTO applications (student_id, opportunity_id, status)
SELECT (SELECT id FROM users WHERE email = 'dara@student.test'),
       o.id, 'in_review'
FROM opportunities o WHERE o.title = 'Junior DevOps Engineer';

INSERT INTO applications (student_id, opportunity_id, status)
SELECT (SELECT id FROM users WHERE email = 'mealea@student.test'),
       o.id, 'accepted'
FROM opportunities o WHERE o.title = 'Women in Tech Scholarship';

COMMIT;

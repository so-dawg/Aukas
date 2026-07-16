-- ===========================================
-- AUKAS Opportunity Hub
-- Query Optimization (Indexes)
-- ===========================================

------------------------------------------------------------
-- Users
------------------------------------------------------------
CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_role
ON users(role);

-- Opportunities
------------------------------------------------------------
CREATE INDEX idx_opportunity_status
ON opportunities(status);

CREATE INDEX idx_opportunity_deadline
ON opportunities(deadline);

CREATE INDEX idx_opportunity_location
ON opportunities(location);

CREATE INDEX idx_opportunity_category
ON opportunities(category_id);

CREATE INDEX idx_opportunity_org
ON opportunities(organization_id);

------------------------------------------------------------
-- Applications
------------------------------------------------------------
CREATE INDEX idx_application_student
ON applications(student_id);

CREATE INDEX idx_application_opportunity
ON applications(opportunity_id);

CREATE INDEX idx_application_status
ON applications(status);

------------------------------------------------------------
-- Bookmarks
------------------------------------------------------------
CREATE INDEX idx_bookmark_student
ON bookmarks(student_id);

CREATE INDEX IF NOT EXISTS idx_bookmark_opportunity
ON bookmarks(opportunity_id);
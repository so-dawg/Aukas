# Backup and Recovery

## Backup

The PostgreSQL database was backed up using pgAdmin.

Steps:

1. Right-click the `opportunities_hub` database.
2. Select **Backup...**
3. Save the backup file as `opportunities_backup.backup`.

## Recovery

To restore the database:

1. Create a new database or select an existing one.
2. Right-click the database.
3. Select **Restore...**
4. Choose `opportunities_backup.backup`.
5. Click **Restore**.

## Purpose

Backup protects the system from accidental data loss and allows the database to be restored when needed.
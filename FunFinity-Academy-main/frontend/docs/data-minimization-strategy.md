# Data Minimization Strategy

## Overview

This document outlines FunFinity Academy's data minimization strategy in compliance with GDPR Article 5(1)(c), which requires that personal data be "adequate, relevant and limited to what is necessary for the purposes for which they are processed."

## Principles

1. **Collect Only What's Needed**: We collect only the minimum data required to provide educational services
2. **Purpose Limitation**: Data is used only for the specific purpose it was collected
3. **Data Retention**: Data is retained only as long as necessary
4. **Privacy by Design**: Data minimization is built into our systems from the ground up

## Data Collection Categories

### Essential Data (Required for Core Functionality)

| Data Field | Purpose | Retention Period | Legal Basis |
|-----------|---------|------------------|-------------|
| Email Address | User authentication, communication | Account lifetime + 30 days after deletion | Contract performance |
| Password Hash | Account security | Account lifetime | Contract performance |
| Date of Birth | Age verification, COPPA compliance | Account lifetime | Legal obligation |
| Learning Progress | Educational tracking, personalization | Account lifetime (anonymized after deletion) | Contract performance |
| Quiz Results | Educational assessment, progress tracking | Account lifetime (anonymized after deletion) | Contract performance |

### Optional Data (User-Provided)

| Data Field | Purpose | Retention Period | Legal Basis | Consent Required |
|-----------|---------|------------------|-------------|------------------|
| Display Name | Personalization | Account lifetime | Contract performance | No |
| Profile Picture | Personalization | Account lifetime | Contract performance | No |
| Phone Number | Emergency contact, notifications | Account lifetime | Contract performance | No |
| Learning DNA Preferences | Personalization | Account lifetime | Contract performance | No |
| Accessibility Settings | Accessibility compliance | Account lifetime | Legal obligation | No |

### Marketing Data (Explicit Consent Required)

| Data Field | Purpose | Retention Period | Legal Basis | Consent Required |
|-----------|---------|------------------|-------------|------------------|
| Marketing Preferences | Personalized marketing | Until consent withdrawn | Consent | Yes |
| Engagement Analytics | Marketing optimization | 2 years | Consent | Yes |

## Data Minimization Implementation

### 1. Collection Phase

**Form Design:**
- Only request fields that are absolutely necessary
- Mark optional fields clearly
- Provide context for why each field is needed
- Allow users to skip optional fields

**Example:**
```typescript
// Bad: Collecting unnecessary data
const registrationForm = {
  fullName: string,
  email: string,
  phone: string,        // Not needed for core functionality
  address: string,      // Not needed for core functionality
  birthPlace: string,   // Not needed for core functionality
  favoriteColor: string // Not needed for core functionality
}

// Good: Minimal data collection
const registrationForm = {
  email: string,        // Required for authentication
  dateOfBirth: Date,    // Required for age verification
  displayName?: string  // Optional for personalization
}
```

### 2. Storage Phase

**Database Schema:**
- Separate PII from educational data
- Use nullable fields for optional data
- Implement data encryption at rest
- Use anonymization for analytics

**Example:**
```sql
-- Minimal user table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Optional profile data (separate table)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  display_name VARCHAR(100),
  phone VARCHAR(50),
  -- All fields are nullable
);
```

### 3. Processing Phase

**Data Access:**
- Implement role-based access control
- Log all data access
- Use data masking for non-essential views
- Implement principle of least privilege

**Example:**
```typescript
// Bad: Returning all user data
function getUserProfile(userId: string) {
  return database.users.find(userId);
  // Returns: email, password_hash, phone, address, etc.
}

// Good: Returning only necessary data
function getUserProfile(userId: string, requesterRole: string) {
  const user = database.users.find(userId);
  
  if (requesterRole === 'student') {
    return {
      displayName: user.displayName,
      progress: user.progress
      // No PII returned
    };
  }
  
  if (requesterRole === 'parent') {
    return {
      displayName: user.displayName,
      progress: user.progress,
      lastActive: user.lastActive
      // No contact details
    };
  }
}
```

### 4. Retention Phase

**Automatic Cleanup:**
- Implement automated data deletion
- Set retention periods for each data type
- Use soft delete with hard delete after retention period
- Implement data anonymization for long-term analytics

**Example:**
```typescript
// Automated data cleanup job
async function cleanupOldData() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  // Hard delete soft-deleted accounts after 30 days
  await database.users.deleteMany({
    deleted_at: { lt: thirtyDaysAgo }
  });
  
  // Anonymize educational data after 1 year
  const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
  await database.quiz_submissions.updateMany({
    created_at: { lt: oneYearAgo },
    is_anonymized: false
  }, {
    user_id: null,
    is_anonymized: true
  });
}
```

## Data Minimization by Role

### Students
- **Collected**: Email, display name, learning progress, quiz results
- **Not Collected**: Full name, address, phone (unless provided), social security number
- **Access**: Can view own data only

### Parents
- **Collected**: Name, email, phone (for consent), relationship to child
- **Not Collected**: Child's detailed quiz answers, other children's data
- **Access**: Can view child's progress data only

### Teachers
- **Collected**: Name, email, professional credentials
- **Not Collected**: Personal address, phone (unless provided)
- **Access**: Can view student progress data for assigned students only

### Admins
- **Collected**: Name, email, role
- **Not Collected**: Unnecessary personal details
- **Access**: Can view aggregated data, individual data only when necessary

## Data Retention Policy

| Data Type | Retention Period | Post-Retention Action |
|-----------|------------------|----------------------|
| User Account | Active + 30 days after deletion | Hard delete |
| User Profile | Active + 30 days after deletion | Hard delete |
| Learning Progress | Active + 1 year (anonymized) | Anonymize |
| Quiz Results | Active + 1 year (anonymized) | Anonymize |
| Consent Records | 7 years after account deletion | Archive |
| Audit Logs | 1 year | Hard delete |
| Marketing Data | Until consent withdrawn | Immediate delete |

## Compliance Monitoring

### Automated Checks
1. **Data Collection Audit**: Log all data collection events
2. **Retention Monitoring**: Alert when data exceeds retention period
3. **Access Logging**: Monitor who accesses what data
4. **Anomaly Detection**: Flag unusual data access patterns

### Regular Reviews
1. **Quarterly**: Review data collection forms for unnecessary fields
2. **Semi-annually**: Audit database for data exceeding retention
3. **Annually**: Review and update data minimization policy

## Implementation Checklist

- [x] Database schema separates PII from educational data
- [x] All optional fields are clearly marked in UI
- [x] Role-based access control implemented
- [x] Data access logging enabled
- [x] Automated data cleanup jobs scheduled
- [x] Data anonymization functions implemented
- [x] Consent management system in place
- [x] GDPR deletion request functionality available
- [x] Parental consent flow for users under 13
- [ ] Regular compliance audits scheduled

## References

- GDPR Article 5(1)(c): Data minimization principle
- GDPR Article 25: Data protection by design and by default
- COPPA: Children's Online Privacy Protection Act
- FERPA: Family Educational Rights and Privacy Act

## Document Control

- **Version**: 1.0
- **Last Updated**: 2024-01-15
- **Next Review**: 2024-07-15
- **Owner**: Compliance Team
- **Approved By**: CTO

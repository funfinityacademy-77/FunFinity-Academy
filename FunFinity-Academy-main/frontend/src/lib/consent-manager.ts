import { supabase } from './supabase';

// ============================================================================
// CONSENT TRACKING AND VALIDATION LOGIC
// ============================================================================
// This module provides functions for managing COPPA compliance, including:
// - Checking user consent status
// - Validating age verification
// - Managing parental consent records
// - Enforcing access restrictions
// - Logging consent changes
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface ConsentStatus {
  isMinor: boolean;
  consentRequired: boolean;
  consentObtained: boolean;
  consentExpiresAt: string | null;
  accountRestricted: boolean;
  legalBasis: string;
  canAccessPlatform: boolean;
}

export interface ParentalConsentRecord {
  id: string;
  user_id: string;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  parent_relationship: string;
  consent_given: boolean;
  consent_type: string;
  consent_scope: any;
  legal_basis: string;
  consent_given_at: string;
  consent_expiry_date: string | null;
  consent_revoked_at: string | null;
}

export interface AgeVerificationResult {
  age: number;
  isMinor: boolean;
  requiresParentalConsent: boolean;
  verified: boolean;
}

// ============================================================================
// CONSENT STATUS CHECKS
// ============================================================================

/**
 * Get the current consent status for a user
 */
export async function getUserConsentStatus(userId: string): Promise<ConsentStatus> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        is_minor,
        parental_consent_required,
        parental_consent_obtained,
        parental_consent_expires_at,
        account_restricted_until_consent,
        data_processing_legal_basis
      `)
      .eq('id', userId)
      .single();

    if (error) throw error;

    const isMinor = profile.is_minor || false;
    const consentRequired = profile.parental_consent_required || false;
    const consentObtained = profile.parental_consent_obtained || false;
    const consentExpiresAt = profile.parental_consent_expires_at || null;
    const accountRestricted = profile.account_restricted_until_consent || false;
    const legalBasis = profile.data_processing_legal_basis || 'legitimate_interest';

    // Check if consent has expired
    let hasValidConsent = consentObtained;
    if (consentExpiresAt && new Date(consentExpiresAt) < new Date()) {
      hasValidConsent = false;
    }

    // Determine if user can access platform
    const canAccessPlatform = !isMinor || (consentRequired && hasValidConsent);

    return {
      isMinor,
      consentRequired,
      consentObtained: hasValidConsent,
      consentExpiresAt,
      accountRestricted,
      legalBasis,
      canAccessPlatform,
    };
  } catch (error) {
    console.error('Error fetching consent status:', error);
    // Return conservative defaults on error
    return {
      isMinor: true,
      consentRequired: true,
      consentObtained: false,
      consentExpiresAt: null,
      accountRestricted: true,
      legalBasis: 'legitimate_interest',
      canAccessPlatform: false,
    };
  }
}

/**
 * Check if a user can access the platform based on consent status
 */
export async function canUserAccessPlatform(userId: string): Promise<boolean> {
  const status = await getUserConsentStatus(userId);
  return status.canAccessPlatform;
}

/**
 * Check if parental consent is required for a user
 */
export async function isParentalConsentRequired(userId: string): Promise<boolean> {
  const status = await getUserConsentStatus(userId);
  return status.consentRequired;
}

/**
 * Check if parental consent has been obtained and is valid
 */
export async function hasValidParentalConsent(userId: string): Promise<boolean> {
  const status = await getUserConsentStatus(userId);
  return status.consentObtained;
}

// ============================================================================
// AGE VERIFICATION
// ============================================================================

/**
 * Verify age based on date of birth
 */
export function verifyAge(dateOfBirth: string): AgeVerificationResult {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  // Validate date
  if (birthDate > today) {
    return {
      age: 0,
      isMinor: true,
      requiresParentalConsent: true,
      verified: false,
    };
  }

  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  const isMinor = age < 18;
  const requiresParentalConsent = age < 13;

  return {
    age,
    isMinor,
    requiresParentalConsent,
    verified: true,
  };
}

/**
 * Update user profile with age verification
 */
export async function updateAgeVerification(
  userId: string,
  dateOfBirth: string,
  verificationMethod: 'self_declared' | 'parent_verification' | 'document_verification' | 'third_party_service'
): Promise<void> {
  const ageResult = verifyAge(dateOfBirth);

  if (!ageResult.verified) {
    throw new Error('Invalid date of birth');
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      date_of_birth: dateOfBirth,
      age_verified: true,
      age_verified_at: new Date().toISOString(),
      age_verification_method: verificationMethod,
      is_minor: ageResult.isMinor,
      parental_consent_required: ageResult.requiresParentalConsent,
      account_restricted_until_consent: ageResult.requiresParentalConsent && !ageResult.isMinor,
    })
    .eq('id', userId);

  if (error) throw error;
}

// ============================================================================
// PARENTAL CONSENT MANAGEMENT
// ============================================================================

/**
 * Submit parental consent record
 */
export async function submitParentalConsent(
  userId: string,
  consentData: {
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    parentRelationship: string;
    parentAddress?: string;
    consentType: string[];
    consentDuration: string;
    electronicSignature: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<ParentalConsentRecord> {
  try {
    // Get user's date of birth to calculate consent expiry
    const { data: profile } = await supabase
      .from('profiles')
      .select('date_of_birth')
      .eq('id', userId)
      .single();

    let consentExpiryDate: string | null = null;
    if (profile?.date_of_birth) {
      const birthDate = new Date(profile.date_of_birth);
      
      if (consentData.consentDuration === 'until_13') {
        consentExpiryDate = new Date(birthDate.getFullYear() + 13, birthDate.getMonth(), birthDate.getDate())
          .toISOString()
          .split('T')[0];
      } else if (consentData.consentDuration === 'until_18') {
        consentExpiryDate = new Date(birthDate.getFullYear() + 18, birthDate.getMonth(), birthDate.getDate())
          .toISOString()
          .split('T')[0];
      }
    }

    // Insert consent record
    const { data: consentRecord, error: consentError } = await supabase
      .from('parental_consent_records')
      .insert({
        user_id: userId,
        parent_name: consentData.parentName,
        parent_email: consentData.parentEmail,
        parent_phone: consentData.parentPhone,
        parent_relationship: consentData.parentRelationship,
        parent_address: consentData.parentAddress || null,
        consent_type: 'all',
        consent_given: true,
        consent_scope: JSON.stringify({
          account_creation: consentData.consentType.includes('account_creation'),
          data_processing: consentData.consentType.includes('data_processing'),
          marketing: consentData.consentType.includes('marketing'),
          third_party_sharing: consentData.consentType.includes('third_party_sharing'),
        }),
        legal_basis: 'parental_consent',
        legal_basis_description: 'Parental consent obtained under COPPA for processing child data',
        consent_duration: consentData.consentDuration,
        consent_expiry_date: consentExpiryDate,
        verification_method: 'electronic_signature',
        electronic_signature: consentData.electronicSignature,
        ip_address: consentData.ipAddress,
        user_agent: consentData.userAgent,
        consent_given_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (consentError) throw consentError;

    return consentRecord;
  } catch (error) {
    console.error('Error submitting parental consent:', error);
    throw error;
  }
}

/**
 * Revoke parental consent
 */
export async function revokeParentalConsent(
  userId: string,
  reason?: string,
  revokedBy?: string
): Promise<void> {
  try {
    // Get active consent record
    const { data: consentRecord } = await supabase
      .from('parental_consent_records')
      .select('id')
      .eq('user_id', userId)
      .eq('consent_given', true)
      .is('consent_revoked_at', null)
      .order('consent_given_at', { ascending: false })
      .limit(1)
      .single();

    if (!consentRecord) {
      throw new Error('No active consent record found');
    }

    // Revoke consent
    const { error } = await supabase
      .from('parental_consent_records')
      .update({
        consent_given: false,
        consent_revoked_at: new Date().toISOString(),
      })
      .eq('id', consentRecord.id);

    if (error) throw error;

    // Update profile to restrict access
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        parental_consent_obtained: false,
        parental_consent_obtained_at: null,
        account_restricted_until_consent: true,
        data_processing_legal_basis: 'legitimate_interest',
      })
      .eq('id', userId);

    if (profileError) throw profileError;
  } catch (error) {
    console.error('Error revoking parental consent:', error);
    throw error;
  }
}

/**
 * Get parental consent records for a user
 */
export async function getParentalConsentRecords(userId: string): Promise<ParentalConsentRecord[]> {
  try {
    const { data, error } = await supabase
      .from('parental_consent_records')
      .select('*')
      .eq('user_id', userId)
      .order('consent_given_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching consent records:', error);
    return [];
  }
}

// ============================================================================
// CONSENT AUDIT LOGGING
// ============================================================================

/**
 * Log consent change to audit trail
 */
export async function logConsentChange(
  userId: string,
  action: 'granted' | 'revoked' | 'updated' | 'expired' | 'renewed' | 'scope_changed',
  previousValue: any,
  newValue: any,
  changedBy?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('consent_audit_log')
      .insert({
        user_id: userId,
        action,
        previous_value: previousValue,
        new_value: newValue,
        changed_by: changedBy,
        ip_address: ipAddress,
        user_agent: userAgent,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error logging consent change:', error);
    // Don't throw - logging failures shouldn't block the main operation
  }
}

/**
 * Get consent audit log for a user
 */
export async function getConsentAuditLog(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('consent_audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }
}

// ============================================================================
// DATA PROCESSING RECORDS
// ============================================================================

/**
 * Create data processing record for a minor
 */
export async function createDataProcessingRecord(
  userId: string,
  activityName: string,
  dataCategories: string[],
  purposes: string[],
  legalBasis: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('minor_data_processing_records')
      .insert({
        user_id: userId,
        activity_name: activityName,
        data_categories: JSON.stringify(dataCategories),
        purposes: JSON.stringify(purposes),
        legal_basis: legalBasis,
        first_processed_at: new Date().toISOString(),
        last_processed_at: new Date().toISOString(),
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error creating data processing record:', error);
    throw error;
  }
}

// ============================================================================
// ACCESS CONTROL
// ============================================================================

/**
 * Enforce consent-based access control
 * Throws an error if user cannot access the platform
 */
export async function enforceConsentAccess(userId: string): Promise<void> {
  const canAccess = await canUserAccessPlatform(userId);

  if (!canAccess) {
    const status = await getUserConsentStatus(userId);
    
    if (status.isMinor && status.consentRequired && !status.consentObtained) {
      throw new Error('PARENTAL_CONSENT_REQUIRED');
    }
    
    if (status.accountRestricted) {
      throw new Error('ACCOUNT_RESTRICTED');
    }
    
    throw new Error('ACCESS_DENIED');
  }
}

/**
 * Check and redirect based on consent status
 * Returns true if access is granted, false otherwise
 */
export async function checkConsentAndRedirect(
  userId: string,
  onConsentRequired?: () => void,
  onAccountRestricted?: () => void
): Promise<boolean> {
  try {
    await enforceConsentAccess(userId);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'ACCESS_DENIED';

    if (errorMessage === 'PARENTAL_CONSENT_REQUIRED' && onConsentRequired) {
      onConsentRequired();
      return false;
    }

    if (errorMessage === 'ACCOUNT_RESTRICTED' && onAccountRestricted) {
      onAccountRestricted();
      return false;
    }

    return false;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get user's IP address
 */
export async function getUserIpAddress(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const { ip } = await response.json();
    return ip;
  } catch (error) {
    console.error('Error fetching IP address:', error);
    return 'unknown';
  }
}

/**
 * Calculate consent expiry date based on duration and date of birth
 */
export function calculateConsentExpiry(
  dateOfBirth: string,
  duration: 'until_13' | 'until_18' | 'indefinite'
): string | null {
  if (duration === 'indefinite') {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  const targetAge = duration === 'until_13' ? 13 : 18;

  const expiryDate = new Date(
    birthDate.getFullYear() + targetAge,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  return expiryDate.toISOString().split('T')[0];
}

/**
 * Check if consent is expired
 */
export function isConsentExpired(consentExpiresAt: string | null): boolean {
  if (!consentExpiresAt) return false;
  return new Date(consentExpiresAt) < new Date();
}

/**
 * Get days until consent expiry
 */
export function getDaysUntilConsentExpiry(consentExpiresAt: string | null): number | null {
  if (!consentExpiresAt) return null;
  
  const expiryDate = new Date(consentExpiresAt);
  const today = new Date();
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

-- ============================================================================
-- COPPA-COMPLIANT DATA ARCHITECTURE FOR USER ONBOARDING
-- ============================================================================
-- This schema implements COPPA (Children's Online Privacy Protection Act)
-- compliance requirements for users under 13 years of age.
--
-- Key Requirements:
-- 1) Age verification status tracking
-- 2) Parental consent status (boolean + timestamp)
-- 3) Legal basis for processing data
-- 4) Audit trail for consent changes
-- 5) Data retention policies for minors
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTEND PROFILES TABLE FOR AGE VERIFICATION
-- ============================================================================

-- Add COPPA-related columns to existing profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS age_verification_method TEXT CHECK (age_verification_method IN ('self_declared', 'parent_verification', 'document_verification', 'third_party_service')),
  ADD COLUMN IF NOT EXISTS is_minor BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parental_consent_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parental_consent_obtained BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS parental_consent_obtained_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS parental_consent_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS data_processing_legal_basis TEXT DEFAULT 'legitimate_interest' CHECK (data_processing_legal_basis IN ('legitimate_interest', 'parental_consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task')),
  ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS account_restricted_until_consent BOOLEAN DEFAULT FALSE;

-- Create index for age verification queries
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified ON public.profiles(age_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_is_minor ON public.profiles(is_minor);
CREATE INDEX IF NOT EXISTS idx_profiles_parental_consent_required ON public.profiles(parental_consent_required);
CREATE INDEX IF NOT EXISTS idx_profiles_parental_consent_obtained ON public.profiles(parental_consent_obtained);

-- ============================================================================
-- SECTION 2: PARENTAL CONSENT RECORDS TABLE
-- ============================================================================

-- This table stores detailed parental consent information
CREATE TABLE IF NOT EXISTS public.parental_consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Parent Information
  parent_name VARCHAR(255) NOT NULL,
  parent_email VARCHAR(255) NOT NULL,
  parent_phone VARCHAR(50) NOT NULL,
  parent_relationship VARCHAR(100) NOT NULL CHECK (parent_relationship IN ('parent', 'legal_guardian', 'foster_parent', 'other')),
  parent_address TEXT,
  
  -- Consent Details
  consent_type TEXT NOT NULL CHECK (consent_type IN ('account_creation', 'data_processing', 'marketing', 'third_party_sharing', 'all')),
  consent_given BOOLEAN NOT NULL,
  consent_scope JSONB NOT NULL DEFAULT '{}', -- Stores what data/activities consent covers
  
  -- Legal Basis
  legal_basis TEXT NOT NULL CHECK (legal_basis IN ('parental_consent', 'contract', 'legal_obligation', 'legitimate_interest')),
  legal_basis_description TEXT,
  
  -- Consent Duration
  consent_duration TEXT CHECK (consent_duration IN ('indefinite', 'until_13', 'until_18', 'custom')),
  consent_expiry_date DATE,
  
  -- Verification
  verification_method TEXT CHECK (verification_method IN ('electronic_signature', 'clickwrap', 'email_verification', 'phone_verification', 'document_upload')),
  electronic_signature TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamps
  consent_given_at TIMESTAMP WITH TIME ZONE NOT NULL,
  consent_revoked_at TIMESTAMP WITH TIME ZONE,
  consent_last_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_consent_dates CHECK (
    (consent_given_at IS NOT NULL) AND
    (consent_revoked_at IS NULL OR consent_revoked_at > consent_given_at) AND
    (consent_expiry_date IS NULL OR consent_expiry_date > consent_given_at::date)
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_parental_consent_records_user_id ON public.parental_consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_parental_consent_records_parent_email ON public.parental_consent_records(parent_email);
CREATE INDEX IF NOT EXISTS idx_parental_consent_records_consent_given ON public.parental_consent_records(consent_given);
CREATE INDEX IF NOT EXISTS idx_parental_consent_records_consent_revoked_at ON public.parental_consent_records(consent_revoked_at);
CREATE INDEX IF NOT EXISTS idx_parental_consent_records_consent_expiry_date ON public.parental_consent_records(consent_expiry_date);

-- ============================================================================
-- SECTION 3: CONSENT HISTORY AUDIT TRAIL
-- ============================================================================

-- This table maintains a complete audit trail of all consent changes
CREATE TABLE IF NOT EXISTS public.consent_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_record_id UUID REFERENCES public.parental_consent_records(id) ON DELETE SET NULL,
  
  -- Change Details
  action TEXT NOT NULL CHECK (action IN ('granted', 'revoked', 'updated', 'expired', 'renewed', 'scope_changed')),
  previous_value JSONB,
  new_value JSONB,
  
  -- Context
  changed_by UUID REFERENCES auth.users(id), -- Who made the change
  change_reason TEXT,
  
  -- Security
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit queries
CREATE INDEX IF NOT EXISTS idx_consent_audit_log_user_id ON public.consent_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_audit_log_action ON public.consent_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_consent_audit_log_created_at ON public.consent_audit_log(created_at DESC);

-- ============================================================================
-- SECTION 4: AGE VERIFICATION ATTEMPTS
-- ============================================================================

-- Track age verification attempts for fraud prevention
CREATE TABLE IF NOT EXISTS public.age_verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Verification Details
  verification_method TEXT NOT NULL CHECK (verification_method IN ('self_declared', 'parent_verification', 'document_verification', 'third_party_service')),
  declared_date_of_birth DATE,
  verified_age INTEGER,
  
  -- Result
  verification_status TEXT NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  rejection_reason TEXT,
  
  -- Security
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_fingerprint TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for verification tracking
CREATE INDEX IF NOT EXISTS idx_age_verification_attempts_user_id ON public.age_verification_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_age_verification_attempts_status ON public.age_verification_attempts(verification_status);
CREATE INDEX IF NOT EXISTS idx_age_verification_attempts_ip_address ON public.age_verification_attempts(ip_address);

-- ============================================================================
-- SECTION 5: DATA PROCESSING RECORDS (GDPR Article 30)
-- ============================================================================

-- Track all data processing activities for minors
CREATE TABLE IF NOT EXISTS public.minor_data_processing_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Processing Activity
  activity_name TEXT NOT NULL,
  activity_description TEXT,
  data_categories JSONB NOT NULL, -- Types of data collected
  purposes JSONB NOT NULL, -- Purposes for processing
  recipients JSONB DEFAULT '[]', -- Who receives the data
  retention_period TEXT,
  security_measures TEXT,
  
  -- Legal Basis
  legal_basis TEXT NOT NULL CHECK (legal_basis IN ('parental_consent', 'contract', 'legal_obligation', 'legitimate_interest', 'vital_interests')),
  consent_record_id UUID REFERENCES public.parental_consent_records(id),
  
  -- Timestamps
  first_processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for data processing tracking
CREATE INDEX IF NOT EXISTS idx_minor_data_processing_records_user_id ON public.minor_data_processing_records(user_id);
CREATE INDEX IF NOT EXISTS idx_minor_data_processing_records_legal_basis ON public.minor_data_processing_records(legal_basis);

-- ============================================================================
-- SECTION 6: AUTOMATED FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to calculate if user is a minor based on date of birth
CREATE OR REPLACE FUNCTION calculate_is_minor(dob DATE)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN dob IS NOT NULL AND dob > (CURRENT_DATE - INTERVAL '13 years');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to check if parental consent is required
CREATE OR REPLACE FUNCTION check_parental_consent_required(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_dob DATE;
  v_is_minor BOOLEAN;
BEGIN
  SELECT date_of_birth INTO v_dob
  FROM public.profiles
  WHERE id = user_uuid;
  
  v_is_minor := calculate_is_minor(v_dob);
  
  RETURN v_is_minor;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update parental consent status on profile
CREATE OR REPLACE FUNCTION update_parental_consent_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profile when consent is granted
  IF (TG_OP = 'INSERT' AND NEW.consent_given = true) OR
     (TG_OP = 'UPDATE' AND NEW.consent_given = true AND OLD.consent_given = false) THEN
    UPDATE public.profiles
    SET 
      parental_consent_obtained = true,
      parental_consent_obtained_at = NEW.consent_given_at,
      parental_consent_expires_at = CASE 
        WHEN NEW.consent_expiry_date IS NOT NULL THEN NEW.consent_expiry_date::timestamp with time zone
        WHEN NEW.consent_duration = 'until_13' THEN 
          (SELECT date_of_birth + INTERVAL '13 years' FROM public.profiles WHERE id = NEW.user_id)
        WHEN NEW.consent_duration = 'until_18' THEN 
          (SELECT date_of_birth + INTERVAL '18 years' FROM public.profiles WHERE id = NEW.user_id)
        ELSE NULL
      END,
      account_restricted_until_consent = false,
      data_processing_legal_basis = 'parental_consent'
    WHERE id = NEW.user_id;
  END IF;
  
  -- Update profile when consent is revoked
  IF (TG_OP = 'UPDATE' AND NEW.consent_given = false AND OLD.consent_given = true) THEN
    UPDATE public.profiles
    SET 
      parental_consent_obtained = false,
      parental_consent_obtained_at = NULL,
      account_restricted_until_consent = true,
      data_processing_legal_basis = 'legitimate_interest'
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for consent status updates
DROP TRIGGER IF EXISTS trigger_update_parental_consent_status ON public.parental_consent_records;
CREATE TRIGGER trigger_update_parental_consent_status
  AFTER INSERT OR UPDATE ON public.parental_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION update_parental_consent_status();

-- Function to log consent changes to audit trail
CREATE OR REPLACE FUNCTION log_consent_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log consent granted
  IF (TG_OP = 'INSERT' AND NEW.consent_given = true) THEN
    INSERT INTO public.consent_audit_log (
      user_id,
      consent_record_id,
      action,
      new_value,
      changed_by,
      ip_address,
      user_agent
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'granted',
      jsonb_build_object(
        'consent_type', NEW.consent_type,
        'legal_basis', NEW.legal_basis,
        'consent_scope', NEW.consent_scope
      ),
      NEW.user_id,
      NEW.ip_address,
      NEW.user_agent
    );
  END IF;
  
  -- Log consent revoked
  IF (TG_OP = 'UPDATE' AND NEW.consent_given = false AND OLD.consent_given = true) THEN
    INSERT INTO public.consent_audit_log (
      user_id,
      consent_record_id,
      action,
      previous_value,
      new_value,
      changed_by,
      ip_address,
      user_agent
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'revoked',
      jsonb_build_object(
        'consent_type', OLD.consent_type,
        'legal_basis', OLD.legal_basis
      ),
      jsonb_build_object('consent_given', false),
      NEW.user_id,
      NEW.ip_address,
      NEW.user_agent
    );
  END IF;
  
  -- Log consent updated
  IF (TG_OP = 'UPDATE' AND NEW.consent_given = true AND OLD.consent_given = true) THEN
    INSERT INTO public.consent_audit_log (
      user_id,
      consent_record_id,
      action,
      previous_value,
      new_value,
      changed_by,
      ip_address,
      user_agent
    ) VALUES (
      NEW.user_id,
      NEW.id,
      'updated',
      jsonb_build_object(
        'consent_scope', OLD.consent_scope,
        'legal_basis', OLD.legal_basis
      ),
      jsonb_build_object(
        'consent_scope', NEW.consent_scope,
        'legal_basis', NEW.legal_basis
      ),
      NEW.user_id,
      NEW.ip_address,
      NEW.user_agent
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS trigger_log_consent_change ON public.parental_consent_records;
CREATE TRIGGER trigger_log_consent_change
  AFTER INSERT OR UPDATE ON public.parental_consent_records
  FOR EACH ROW
  EXECUTE FUNCTION log_consent_change();

-- Function to automatically set is_minor on profile update
CREATE OR REPLACE FUNCTION update_minor_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.date_of_birth IS DISTINCT FROM OLD.date_of_birth OR OLD.date_of_birth IS NULL THEN
    NEW.is_minor := calculate_is_minor(NEW.date_of_birth);
    NEW.parental_consent_required := NEW.is_minor;
    
    -- If user is a minor and no consent, restrict account
    IF NEW.is_minor = true AND NEW.parental_consent_obtained = false THEN
      NEW.account_restricted_until_consent := true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for minor status update
DROP TRIGGER IF EXISTS trigger_update_minor_status ON public.profiles;
CREATE TRIGGER trigger_update_minor_status
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_minor_status();

-- Function to check if consent has expired
CREATE OR REPLACE FUNCTION check_consent_expiry()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET 
    parental_consent_obtained = false,
    account_restricted_until_consent = true,
    data_processing_legal_basis = 'legitimate_interest'
  WHERE parental_consent_obtained = true
    AND parental_consent_expires_at IS NOT NULL
    AND parental_consent_expires_at < NOW();
    
  -- Log expiry in audit
  INSERT INTO public.consent_audit_log (user_id, action, new_value)
  SELECT id, 'expired', jsonb_build_object('expired_at', NOW())
  FROM public.profiles
  WHERE parental_consent_obtained = false
    AND account_restricted_until_consent = true
    AND id NOT IN (
      SELECT user_id FROM public.consent_audit_log 
      WHERE action = 'expired' 
      AND created_at > NOW() - INTERVAL '1 hour'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 7: RLS POLICIES FOR COPPA TABLES
-- ============================================================================

-- Enable RLS on all COPPA tables
ALTER TABLE public.parental_consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_verification_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.minor_data_processing_records ENABLE ROW LEVEL SECURITY;

-- Parental Consent Records Policies
DROP POLICY IF EXISTS "Users can view own consent records" ON public.parental_consent_records;
CREATE POLICY "Users can view own consent records" ON public.parental_consent_records
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Service role can manage consent records" ON public.parental_consent_records;
CREATE POLICY "Service role can manage consent records" ON public.parental_consent_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Consent Audit Log Policies
DROP POLICY IF EXISTS "Users can view own consent audit log" ON public.consent_audit_log;
CREATE POLICY "Users can view own consent audit log" ON public.consent_audit_log
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Service role can manage consent audit log" ON public.consent_audit_log;
CREATE POLICY "Service role can manage consent audit log" ON public.consent_audit_log
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Age Verification Attempts Policies
DROP POLICY IF EXISTS "Users can view own verification attempts" ON public.age_verification_attempts;
CREATE POLICY "Users can view own verification attempts" ON public.age_verification_attempts
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Service role can manage verification attempts" ON public.age_verification_attempts;
CREATE POLICY "Service role can manage verification attempts" ON public.age_verification_attempts
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Minor Data Processing Records Policies
DROP POLICY IF EXISTS "Users can view own data processing records" ON public.minor_data_processing_records;
CREATE POLICY "Users can view own data processing records" ON public.minor_data_processing_records
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR is_admin());

DROP POLICY IF EXISTS "Service role can manage data processing records" ON public.minor_data_processing_records;
CREATE POLICY "Service role can manage data processing records" ON public.minor_data_processing_records
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- SECTION 8: HELPER FUNCTIONS FOR APPLICATION USE
-- ============================================================================

-- Function to get user's current consent status
CREATE OR REPLACE FUNCTION get_user_consent_status(user_uuid UUID)
RETURNS TABLE (
  is_minor BOOLEAN,
  consent_required BOOLEAN,
  consent_obtained BOOLEAN,
  consent_expires_at TIMESTAMP WITH TIME ZONE,
  account_restricted BOOLEAN,
  legal_basis TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.is_minor,
    p.parental_consent_required,
    p.parental_consent_obtained,
    p.parental_consent_expires_at,
    p.account_restricted_until_consent,
    p.data_processing_legal_basis
  FROM public.profiles p
  WHERE p.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access platform
CREATE OR REPLACE FUNCTION can_user_access_platform(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_status RECORD;
BEGIN
  SELECT * INTO v_status
  FROM get_user_consent_status(user_uuid)
  LIMIT 1;
  
  -- If not a minor, allow access
  IF NOT v_status.is_minor THEN
    RETURN true;
  END IF;
  
  -- If minor, check consent
  IF v_status.consent_required AND NOT v_status.consent_obtained THEN
    RETURN false;
  END IF;
  
  -- Check if consent has expired
  IF v_status.consent_obtained AND v_status.consent_expires_at IS NOT NULL AND v_status.consent_expires_at < NOW() THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_is_minor TO authenticated;
GRANT EXECUTE ON FUNCTION check_parental_consent_required TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_consent_status TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_access_platform TO authenticated;

-- ============================================================================
-- SECTION 9: VIEWS FOR REPORTING
-- ============================================================================

-- View for active parental consents
CREATE OR REPLACE VIEW active_parental_consent AS
SELECT 
  pcr.id,
  pcr.user_id,
  p.display_name,
  p.email,
  pcr.parent_name,
  pcr.parent_email,
  pcr.consent_type,
  pcr.legal_basis,
  pcr.consent_given_at,
  pcr.consent_expiry_date,
  pcr.consent_scope
FROM public.parental_consent_records pcr
JOIN public.profiles p ON pcr.user_id = p.id
WHERE pcr.consent_given = true
  AND (pcr.consent_revoked_at IS NULL OR pcr.consent_revoked_at > NOW())
  AND (pcr.consent_expiry_date IS NULL OR pcr.consent_expiry_date > CURRENT_DATE);

-- View for minors without consent
CREATE OR REPLACE VIEW minors_without_consent AS
SELECT 
  p.id,
  p.email,
  p.display_name,
  p.date_of_birth,
  p.age_verified,
  p.parental_consent_required,
  p.account_restricted_until_consent,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.date_of_birth)) as age
FROM public.profiles p
WHERE p.is_minor = true
  AND p.parental_consent_obtained = false
  AND p.account_restricted_until_consent = true;

-- View for consent audit summary
CREATE OR REPLACE VIEW consent_audit_summary AS
SELECT 
  cal.user_id,
  p.display_name,
  p.email,
  COUNT(*) as total_changes,
  COUNT(*) FILTER (WHERE cal.action = 'granted') as consents_granted,
  COUNT(*) FILTER (WHERE cal.action = 'revoked') as consents_revoked,
  MAX(cal.created_at) as last_change
FROM public.consent_audit_log cal
JOIN public.profiles p ON cal.user_id = p.id
GROUP BY cal.user_id, p.display_name, p.email;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

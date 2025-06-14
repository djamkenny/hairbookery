
-- Create function to get stylist withdrawals
CREATE OR REPLACE FUNCTION public.get_stylist_withdrawals(stylist_uuid UUID)
RETURNS TABLE(
  id UUID,
  stylist_id UUID,
  amount INTEGER,
  status TEXT,
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  notes TEXT,
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wr.id,
    wr.stylist_id,
    wr.amount,
    wr.status,
    wr.bank_name,
    wr.account_number,
    wr.account_name,
    wr.notes,
    wr.processed_at,
    wr.processed_by,
    wr.created_at,
    wr.updated_at
  FROM public.withdrawal_requests wr
  WHERE wr.stylist_id = stylist_uuid
  ORDER BY wr.created_at DESC;
END;
$$;

-- Create function to create withdrawal requests
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(
  p_stylist_id UUID,
  p_amount INTEGER,
  p_bank_name TEXT,
  p_account_number TEXT,
  p_account_name TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  withdrawal_id UUID;
  available_balance INTEGER;
BEGIN
  -- Check available balance
  SELECT public.get_stylist_available_balance(p_stylist_id) INTO available_balance;
  
  IF p_amount > available_balance THEN
    RAISE EXCEPTION 'Insufficient balance. Available: %, Requested: %', available_balance, p_amount;
  END IF;
  
  -- Insert withdrawal request
  INSERT INTO public.withdrawal_requests (
    stylist_id,
    amount,
    bank_name,
    account_number,
    account_name,
    notes,
    status
  ) VALUES (
    p_stylist_id,
    p_amount,
    p_bank_name,
    p_account_number,
    p_account_name,
    p_notes,
    'pending'
  ) RETURNING id INTO withdrawal_id;
  
  RETURN withdrawal_id;
END;
$$;

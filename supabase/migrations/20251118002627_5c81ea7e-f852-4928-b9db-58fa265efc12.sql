-- Fix search_path for security functions

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_commission(order_total DECIMAL)
RETURNS TABLE(commission_amount DECIMAL, seller_amount DECIMAL)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(order_total * 0.02, 2) as commission_amount,
    ROUND(order_total * 0.98, 2) as seller_amount;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_commission_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item RECORD;
  calc RECORD;
BEGIN
  FOR item IN 
    SELECT DISTINCT store_id, SUM(total_price) as store_total
    FROM public.order_items
    WHERE order_id = NEW.id
    GROUP BY store_id
  LOOP
    SELECT * INTO calc FROM public.calculate_commission(item.store_total);
    
    INSERT INTO public.commissions (
      order_id,
      store_id,
      order_total,
      commission_rate,
      commission_amount,
      seller_amount
    ) VALUES (
      NEW.id,
      item.store_id,
      item.store_total,
      2.00,
      calc.commission_amount,
      calc.seller_amount
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'seller', 'customer');

-- Create enum for order status
CREATE TYPE public.order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Create enum for payout status
CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'rejected');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Stores table
CREATE TABLE public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  banner_url TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(store_id, slug)
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product variants table
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT,
  price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  attributes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'pending',
  shipping_address JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.product_variants(id),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Commissions table (2% per sale)
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id),
  order_total DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 2.00,
  commission_amount DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- Payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id),
  amount DECIMAL(10,2) NOT NULL,
  status payout_status DEFAULT 'pending',
  bank_details JSONB,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Categories policies
CREATE POLICY "Categories viewable by everyone"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Stores policies
CREATE POLICY "Stores viewable by everyone"
  ON public.stores FOR SELECT
  USING (is_active = true OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sellers can create stores"
  ON public.stores FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'seller') AND seller_id = auth.uid());

CREATE POLICY "Sellers can update own stores"
  ON public.stores FOR UPDATE
  USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Products policies
CREATE POLICY "Active products viewable by everyone"
  ON public.products FOR SELECT
  USING (
    is_active = true OR 
    EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.seller_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Sellers can manage own products"
  ON public.products FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.seller_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Product variants policies
CREATE POLICY "Variants viewable with products"
  ON public.product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      WHERE products.id = product_variants.product_id AND products.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM public.products 
      JOIN public.stores ON stores.id = products.store_id 
      WHERE products.id = product_variants.product_id AND stores.seller_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Sellers can manage own variants"
  ON public.product_variants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.products 
      JOIN public.stores ON stores.id = products.store_id 
      WHERE products.id = product_variants.product_id AND stores.seller_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Orders policies
CREATE POLICY "Customers can view own orders"
  ON public.orders FOR SELECT
  USING (customer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Customers can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Order items policies
CREATE POLICY "Order items viewable by customers and sellers"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM public.stores WHERE stores.id = order_items.store_id AND stores.seller_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Order items created with orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.customer_id = auth.uid())
  );

-- Commissions policies
CREATE POLICY "Sellers can view own commissions"
  ON public.commissions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.stores WHERE stores.id = commissions.store_id AND stores.seller_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

-- Payouts policies
CREATE POLICY "Sellers can view own payouts"
  ON public.payouts FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.stores WHERE stores.id = payouts.store_id AND stores.seller_id = auth.uid()) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Sellers can request payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.stores WHERE stores.id = payouts.store_id AND stores.seller_id = auth.uid())
  );

-- Reviews policies
CREATE POLICY "Reviews viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Customers can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Functions and triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stores_updated_at
  BEFORE UPDATE ON public.stores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  
  -- Add customer role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate commission (2%)
CREATE OR REPLACE FUNCTION public.calculate_commission(order_total DECIMAL)
RETURNS TABLE(commission_amount DECIMAL, seller_amount DECIMAL) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(order_total * 0.02, 2) as commission_amount,
    ROUND(order_total * 0.98, 2) as seller_amount;
END;
$$ LANGUAGE plpgsql;

-- Function to create commission record after order
CREATE OR REPLACE FUNCTION public.create_commission_on_order()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
  calc RECORD;
BEGIN
  -- For each store in the order, create a commission record
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_commission_after_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.create_commission_on_order();
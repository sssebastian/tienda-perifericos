-- =====================================================================
-- E-COMMERCE DE PERIFÉRICOS TECNOLÓGICOS
-- Base de datos PostgreSQL para Supabase
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- Incluye: tipos, tablas, índices, funciones, triggers, RLS,
--          bucket de imágenes y datos de ejemplo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. EXTENSIONES
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "unaccent";   -- búsqueda sin tildes

-- ---------------------------------------------------------------------
-- 1. TIPOS ENUMERADOS
-- ---------------------------------------------------------------------
create type public.user_role       as enum ('customer', 'admin');
create type public.order_status    as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.payment_status  as enum ('pending', 'approved', 'rejected', 'refunded');
create type public.discount_type   as enum ('percentage', 'fixed');
create type public.attr_data_type  as enum ('text', 'number', 'boolean');
create type public.movement_reason as enum ('purchase', 'sale', 'adjustment', 'return', 'cancellation');

-- ---------------------------------------------------------------------
-- 2. USUARIOS Y DIRECCIONES
-- ---------------------------------------------------------------------
-- Perfil público ligado 1:1 a auth.users (lo crea un trigger al registrarse)
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  full_name       text,
  phone           text,
  document_number text,                                   -- DNI / RUC opcional
  role            public.user_role not null default 'customer',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.addresses (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  label         text not null default 'Casa',             -- Casa, Oficina...
  recipient     text not null,
  phone         text not null,
  department    text not null,                            -- Lima
  province      text not null,                            -- Lima
  district      text not null,                            -- Miraflores
  address_line  text not null,
  reference     text,
  is_default    boolean not null default false,
  created_at    timestamptz not null default now()
);
-- Solo una dirección por defecto por usuario
create unique index addresses_one_default_per_user
  on public.addresses (user_id) where is_default;

-- ---------------------------------------------------------------------
-- 3. CATÁLOGO
-- ---------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  parent_id   uuid references public.categories (id) on delete set null,  -- subcategorías
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  position    int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.brands (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  slug       text not null unique,
  logo_url   text,
  created_at timestamptz not null default now()
);

create table public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete restrict,
  brand_id     uuid references public.brands (id) on delete set null,
  name         text not null,
  slug         text not null unique,
  model        text,                                       -- ej. "27GP850-B"
  short_desc   text,
  description  text,
  warranty_months int not null default 12 check (warranty_months >= 0),
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  search       tsvector,                                   -- lo llena un trigger
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Cada producto tiene al menos una variante: es la unidad que se vende (precio + stock + SKU)
create table public.product_variants (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products (id) on delete cascade,
  sku              text not null unique,
  name             text not null default 'Estándar',       -- "Negro / Red switch"
  options          jsonb not null default '{}'::jsonb,     -- {"color":"Negro","switch":"Red"}
  price            numeric(10,2) not null check (price >= 0),
  compare_at_price numeric(10,2) check (compare_at_price is null or compare_at_price >= price), -- precio tachado
  stock            int not null default 0 check (stock >= 0),
  low_stock_threshold int not null default 5,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  variant_id  uuid references public.product_variants (id) on delete cascade,  -- opcional: imagen de un color
  url         text not null,
  alt_text    text,
  position    int  not null default 0
);

-- Especificaciones filtrables definidas por categoría (Hz, resolución, DPI, switch...)
create table public.attributes (
  id            uuid primary key default gen_random_uuid(),
  category_id   uuid not null references public.categories (id) on delete cascade,
  name          text not null,                            -- "Tasa de refresco"
  slug          text not null,                            -- "refresh-rate"
  unit          text,                                     -- "Hz"
  data_type     public.attr_data_type not null default 'text',
  is_filterable boolean not null default true,
  position      int not null default 0,
  unique (category_id, slug)
);

create table public.product_attributes (
  product_id    uuid not null references public.products (id) on delete cascade,
  attribute_id  uuid not null references public.attributes (id) on delete cascade,
  value_text    text,
  value_number  numeric,
  value_bool    boolean,
  primary key (product_id, attribute_id),
  check (num_nonnulls(value_text, value_number, value_bool) = 1)
);

-- ---------------------------------------------------------------------
-- 4. CARRITO Y LISTA DE DESEOS
-- ---------------------------------------------------------------------
create table public.carts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null unique references public.profiles (id) on delete cascade,
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  cart_id    uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity   int  not null check (quantity between 1 and 20),
  added_at   timestamptz not null default now(),
  primary key (cart_id, variant_id)
);

create table public.wishlist_items (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 5. CUPONES Y ENVÍOS
-- ---------------------------------------------------------------------
create table public.coupons (
  id             uuid primary key default gen_random_uuid(),
  code           text not null unique,
  description    text,
  discount_type  public.discount_type not null,
  value          numeric(10,2) not null check (value > 0),
  min_order      numeric(10,2) not null default 0,
  max_uses       int,                                      -- null = ilimitado
  used_count     int not null default 0,
  starts_at      timestamptz not null default now(),
  ends_at        timestamptz,
  is_active      boolean not null default true,
  check (discount_type <> 'percentage' or value <= 100)
);

create table public.shipping_methods (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,                            -- "Delivery Lima Metropolitana"
  description    text,
  price          numeric(10,2) not null check (price >= 0),
  estimated_days text,                                     -- "1-2 días hábiles"
  is_active      boolean not null default true
);

-- ---------------------------------------------------------------------
-- 6. PEDIDOS Y PAGOS
-- ---------------------------------------------------------------------
create sequence public.order_number_seq start 1000;

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique default ('PED-' || nextval('public.order_number_seq')),
  user_id            uuid not null references public.profiles (id) on delete restrict,
  status             public.order_status not null default 'pending',
  subtotal           numeric(10,2) not null check (subtotal >= 0),
  discount           numeric(10,2) not null default 0 check (discount >= 0),
  shipping_cost      numeric(10,2) not null default 0 check (shipping_cost >= 0),
  total              numeric(10,2) not null check (total >= 0),
  currency           char(3) not null default 'PEN',
  coupon_id          uuid references public.coupons (id) on delete set null,
  shipping_method_id uuid references public.shipping_methods (id) on delete set null,
  shipping_address   jsonb not null,                       -- copia de la dirección al comprar
  tracking_code      text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Copia del producto al momento de la compra (si luego cambia el precio, el pedido no cambia)
create table public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders (id) on delete cascade,
  variant_id    uuid references public.product_variants (id) on delete set null,
  product_name  text not null,
  variant_name  text not null,
  sku           text not null,
  unit_price    numeric(10,2) not null check (unit_price >= 0),
  quantity      int not null check (quantity > 0),
  line_total    numeric(10,2) generated always as (unit_price * quantity) stored
);

create table public.payments (
  id                  uuid primary key default gen_random_uuid(),
  order_id            uuid not null references public.orders (id) on delete cascade,
  provider            text not null,                       -- 'mercadopago' | 'culqi' | 'stripe'
  provider_payment_id text unique,
  amount              numeric(10,2) not null,
  status              public.payment_status not null default 'pending',
  raw_response        jsonb,                               -- respuesta del webhook
  created_at          timestamptz not null default now()
);

-- Historial de movimientos de stock (auditoría)
create table public.inventory_movements (
  id          uuid primary key default gen_random_uuid(),
  variant_id  uuid not null references public.product_variants (id) on delete cascade,
  change      int  not null,                               -- +10 entrada, -1 venta
  reason      public.movement_reason not null,
  order_id    uuid references public.orders (id) on delete set null,
  note        text,
  created_by  uuid references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 7. RESEÑAS
-- ---------------------------------------------------------------------
create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  rating      smallint not null check (rating between 1 and 5),
  title       text,
  comment     text,
  is_approved boolean not null default true,
  created_at  timestamptz not null default now(),
  unique (product_id, user_id)                             -- una reseña por producto y usuario
);

-- ---------------------------------------------------------------------
-- 8. ÍNDICES
-- ---------------------------------------------------------------------
create index on public.addresses (user_id);
create index on public.categories (parent_id);
create index on public.products (category_id) where is_active;
create index on public.products (brand_id);
create index on public.products using gin (search);
create index on public.product_variants (product_id);
create index on public.product_variants (price);
create index on public.product_images (product_id, position);
create index on public.product_attributes (attribute_id, value_number);
create index on public.product_attributes (attribute_id, value_text);
create index on public.orders (user_id, created_at desc);
create index on public.orders (status);
create index on public.order_items (order_id);
create index on public.payments (order_id);
create index on public.reviews (product_id) where is_approved;
create index on public.inventory_movements (variant_id, created_at desc);

-- ---------------------------------------------------------------------
-- 9. FUNCIONES Y TRIGGERS
-- ---------------------------------------------------------------------

-- ¿El usuario actual es administrador? (security definer evita recursión en RLS)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Crea perfil y carrito al registrarse un usuario en Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'));
  insert into public.carts (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Actualiza updated_at automáticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_profiles_updated  before update on public.profiles         for each row execute function public.set_updated_at();
create trigger trg_products_updated  before update on public.products         for each row execute function public.set_updated_at();
create trigger trg_variants_updated  before update on public.product_variants for each row execute function public.set_updated_at();
create trigger trg_orders_updated    before update on public.orders           for each row execute function public.set_updated_at();

-- Impide que un cliente se cambie el rol a admin desde el navegador
create or replace function public.protect_profile_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'No autorizado para cambiar el rol';
  end if;
  return new;
end;
$$;

create trigger trg_profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Índice de búsqueda: nombre (peso A), modelo y marca (B), descripción (C)
create or replace function public.products_search_update()
returns trigger language plpgsql as $$
declare
  v_brand text;
begin
  select name into v_brand from public.brands where id = new.brand_id;
  new.search :=
      setweight(to_tsvector('spanish', unaccent(coalesce(new.name, ''))), 'A')
   || setweight(to_tsvector('spanish', unaccent(coalesce(new.model, '') || ' ' || coalesce(v_brand, ''))), 'B')
   || setweight(to_tsvector('spanish', unaccent(coalesce(new.short_desc, '') || ' ' || coalesce(new.description, ''))), 'C');
  return new;
end;
$$;

create trigger trg_products_search
  before insert or update of name, model, brand_id, short_desc, description on public.products
  for each row execute function public.products_search_update();

-- Búsqueda de texto para el front: supabase.rpc('search_products', { q: 'teclado mecanico' })
create or replace function public.search_products(q text)
returns setof public.products
language sql stable
as $$
  select p.*
  from public.products p
  where p.is_active
    and p.search @@ websearch_to_tsquery('spanish', unaccent(q))
  order by ts_rank(p.search, websearch_to_tsquery('spanish', unaccent(q))) desc;
$$;

-- Crea un pedido de forma segura desde el carrito del usuario.
-- Precios, descuento, envío y stock se calculan aquí, no en el navegador.
-- Uso: supabase.rpc('create_order', { p_address_id, p_shipping_method_id, p_coupon_code })
create or replace function public.create_order(
  p_address_id         uuid,
  p_shipping_method_id uuid,
  p_coupon_code        text default null
)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  v_user     uuid := auth.uid();
  v_cart     uuid;
  v_address  public.addresses;
  v_ship     public.shipping_methods;
  v_coupon   public.coupons;
  v_subtotal numeric(10,2);
  v_discount numeric(10,2) := 0;
  v_order    uuid;
begin
  if v_user is null then
    raise exception 'Debes iniciar sesión';
  end if;

  select * into v_address from public.addresses where id = p_address_id and user_id = v_user;
  if not found then raise exception 'Dirección no válida'; end if;

  select * into v_ship from public.shipping_methods where id = p_shipping_method_id and is_active;
  if not found then raise exception 'Método de envío no válido'; end if;

  select id into v_cart from public.carts where user_id = v_user;
  if not exists (select 1 from public.cart_items where cart_id = v_cart) then
    raise exception 'El carrito está vacío';
  end if;

  -- Verifica stock (bloquea las filas para evitar sobreventa)
  perform 1 from public.product_variants v
    join public.cart_items ci on ci.variant_id = v.id
   where ci.cart_id = v_cart
   for update of v;

  if exists (
    select 1 from public.cart_items ci
    join public.product_variants v on v.id = ci.variant_id
    join public.products p on p.id = v.product_id
    where ci.cart_id = v_cart
      and (v.stock < ci.quantity or not v.is_active or not p.is_active)
  ) then
    raise exception 'Uno o más productos no tienen stock suficiente';
  end if;

  select sum(v.price * ci.quantity) into v_subtotal
  from public.cart_items ci join public.product_variants v on v.id = ci.variant_id
  where ci.cart_id = v_cart;

  -- Cupón
  if p_coupon_code is not null and length(trim(p_coupon_code)) > 0 then
    select * into v_coupon from public.coupons
     where upper(code) = upper(trim(p_coupon_code))
       and is_active
       and now() >= starts_at
       and (ends_at is null or now() <= ends_at)
       and (max_uses is null or used_count < max_uses)
     for update;
    if not found then raise exception 'Cupón no válido o vencido'; end if;
    if v_subtotal < v_coupon.min_order then
      raise exception 'El pedido no alcanza el monto mínimo del cupón (S/ %)', v_coupon.min_order;
    end if;
    v_discount := case v_coupon.discount_type
                    when 'percentage' then round(v_subtotal * v_coupon.value / 100, 2)
                    else least(v_coupon.value, v_subtotal)
                  end;
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  insert into public.orders (user_id, subtotal, discount, shipping_cost, total,
                             coupon_id, shipping_method_id, shipping_address)
  values (v_user, v_subtotal, v_discount, v_ship.price,
          v_subtotal - v_discount + v_ship.price,
          v_coupon.id, v_ship.id,
          jsonb_build_object(
            'recipient', v_address.recipient, 'phone', v_address.phone,
            'department', v_address.department, 'province', v_address.province,
            'district', v_address.district, 'address_line', v_address.address_line,
            'reference', v_address.reference))
  returning id into v_order;

  insert into public.order_items (order_id, variant_id, product_name, variant_name, sku, unit_price, quantity)
  select v_order, v.id, p.name, v.name, v.sku, v.price, ci.quantity
  from public.cart_items ci
  join public.product_variants v on v.id = ci.variant_id
  join public.products p on p.id = v.product_id
  where ci.cart_id = v_cart;

  -- Reserva el stock
  update public.product_variants v
     set stock = v.stock - ci.quantity
    from public.cart_items ci
   where ci.cart_id = v_cart and ci.variant_id = v.id;

  insert into public.inventory_movements (variant_id, change, reason, order_id, created_by)
  select ci.variant_id, -ci.quantity, 'sale', v_order, v_user
  from public.cart_items ci where ci.cart_id = v_cart;

  delete from public.cart_items where cart_id = v_cart;

  return v_order;
end;
$$;

-- Cancela un pedido pendiente y devuelve el stock (cliente dueño o admin)
create or replace function public.cancel_order(p_order_id uuid)
returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_order public.orders;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Pedido no encontrado'; end if;
  if v_order.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'No autorizado';
  end if;
  if v_order.status not in ('pending', 'paid') then
    raise exception 'El pedido ya no se puede cancelar';
  end if;

  update public.product_variants v
     set stock = v.stock + oi.quantity
    from public.order_items oi
   where oi.order_id = p_order_id and oi.variant_id = v.id;

  insert into public.inventory_movements (variant_id, change, reason, order_id, created_by)
  select variant_id, quantity, 'cancellation', p_order_id, auth.uid()
  from public.order_items where order_id = p_order_id and variant_id is not null;

  update public.orders set status = 'cancelled' where id = p_order_id;
end;
$$;

-- Solo se puede reseñar un producto comprado y entregado o pagado
create or replace function public.check_review_purchase()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (
    select 1 from public.orders o
    join public.order_items oi on oi.order_id = o.id
    join public.product_variants v on v.id = oi.variant_id
    where o.user_id = new.user_id
      and v.product_id = new.product_id
      and o.status in ('paid', 'processing', 'shipped', 'delivered')
  ) then
    raise exception 'Solo puedes reseñar productos que compraste';
  end if;
  return new;
end;
$$;

create trigger trg_reviews_check_purchase
  before insert on public.reviews
  for each row execute function public.check_review_purchase();

-- ---------------------------------------------------------------------
-- 10. VISTAS PARA EL FRONT
-- ---------------------------------------------------------------------
-- Tarjeta de producto: precio mínimo, stock total, imagen principal y valoración
create or replace view public.product_cards
with (security_invoker = true) as
select
  p.id, p.name, p.slug, p.model, p.short_desc, p.is_featured, p.created_at,
  c.name  as category_name, c.slug as category_slug,
  b.name  as brand_name,    b.slug as brand_slug,
  min(v.price)                 as min_price,
  min(v.compare_at_price)      as compare_at_price,
  coalesce(sum(v.stock), 0)    as total_stock,
  (select url from public.product_images i
    where i.product_id = p.id order by i.position limit 1) as image_url,
  (select round(avg(r.rating)::numeric, 1) from public.reviews r
    where r.product_id = p.id and r.is_approved)            as avg_rating,
  (select count(*) from public.reviews r
    where r.product_id = p.id and r.is_approved)            as review_count
from public.products p
join public.categories c on c.id = p.category_id
left join public.brands b on b.id = p.brand_id
left join public.product_variants v on v.product_id = p.id and v.is_active
where p.is_active
group by p.id, c.id, b.id;

-- Variantes con stock bajo (panel admin)
create or replace view public.low_stock_variants
with (security_invoker = true) as
select v.id, v.sku, v.name as variant_name, p.name as product_name, v.stock, v.low_stock_threshold
from public.product_variants v
join public.products p on p.id = v.product_id
where v.is_active and v.stock <= v.low_stock_threshold
order by v.stock;

-- ---------------------------------------------------------------------
-- 11. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.addresses           enable row level security;
alter table public.categories          enable row level security;
alter table public.brands              enable row level security;
alter table public.products            enable row level security;
alter table public.product_variants    enable row level security;
alter table public.product_images      enable row level security;
alter table public.attributes          enable row level security;
alter table public.product_attributes  enable row level security;
alter table public.carts               enable row level security;
alter table public.cart_items          enable row level security;
alter table public.wishlist_items      enable row level security;
alter table public.coupons             enable row level security;
alter table public.shipping_methods    enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.payments            enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.reviews             enable row level security;

-- Perfiles: cada uno ve y edita el suyo; el admin ve todos
create policy "profiles: ver propio o admin"   on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles: editar propio"        on public.profiles for update using (id = auth.uid() or public.is_admin());

-- Direcciones: solo el dueño
create policy "addresses: dueño" on public.addresses for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "addresses: admin lee" on public.addresses for select using (public.is_admin());

-- Catálogo: lectura pública de lo activo; escritura solo admin
create policy "categories: lectura pública" on public.categories for select using (is_active or public.is_admin());
create policy "categories: admin escribe"   on public.categories for all using (public.is_admin()) with check (public.is_admin());

create policy "brands: lectura pública" on public.brands for select using (true);
create policy "brands: admin escribe"   on public.brands for all using (public.is_admin()) with check (public.is_admin());

create policy "products: lectura pública" on public.products for select using (is_active or public.is_admin());
create policy "products: admin escribe"   on public.products for all using (public.is_admin()) with check (public.is_admin());

create policy "variants: lectura pública" on public.product_variants for select using (is_active or public.is_admin());
create policy "variants: admin escribe"   on public.product_variants for all using (public.is_admin()) with check (public.is_admin());

create policy "images: lectura pública" on public.product_images for select using (true);
create policy "images: admin escribe"   on public.product_images for all using (public.is_admin()) with check (public.is_admin());

create policy "attributes: lectura pública" on public.attributes for select using (true);
create policy "attributes: admin escribe"   on public.attributes for all using (public.is_admin()) with check (public.is_admin());

create policy "product_attributes: lectura pública" on public.product_attributes for select using (true);
create policy "product_attributes: admin escribe"   on public.product_attributes for all using (public.is_admin()) with check (public.is_admin());

create policy "shipping: lectura pública" on public.shipping_methods for select using (is_active or public.is_admin());
create policy "shipping: admin escribe"   on public.shipping_methods for all using (public.is_admin()) with check (public.is_admin());

-- Cupones: solo admin (los clientes los validan vía create_order)
create policy "coupons: admin" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

-- Carrito: solo el dueño
create policy "carts: dueño" on public.carts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cart_items: dueño" on public.cart_items for all
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create policy "wishlist: dueño" on public.wishlist_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Pedidos: el cliente solo LEE los suyos (se crean con create_order); el admin gestiona
create policy "orders: ver propios o admin" on public.orders for select using (user_id = auth.uid() or public.is_admin());
create policy "orders: admin actualiza"     on public.orders for update using (public.is_admin()) with check (public.is_admin());

create policy "order_items: ver propios o admin" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- Pagos: los escribe la Edge Function con service_role (que salta RLS)
create policy "payments: ver propios o admin" on public.payments for select
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

create policy "inventory: admin" on public.inventory_movements for all using (public.is_admin()) with check (public.is_admin());

-- Reseñas: lectura pública de las aprobadas; el autor crea/edita/borra la suya
create policy "reviews: lectura pública" on public.reviews for select using (is_approved or user_id = auth.uid() or public.is_admin());
create policy "reviews: crear propia"    on public.reviews for insert with check (user_id = auth.uid());
create policy "reviews: editar propia"   on public.reviews for update using (user_id = auth.uid() or public.is_admin());
create policy "reviews: borrar propia"   on public.reviews for delete using (user_id = auth.uid() or public.is_admin());

-- Permisos de ejecución de funciones
revoke execute on function public.create_order(uuid, uuid, text) from public, anon;
grant  execute on function public.create_order(uuid, uuid, text) to authenticated;
revoke execute on function public.cancel_order(uuid) from public, anon;
grant  execute on function public.cancel_order(uuid) to authenticated;

-- ---------------------------------------------------------------------
-- 12. STORAGE: bucket público para imágenes de productos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product-images: lectura pública" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product-images: admin sube" on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin edita" on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin());
create policy "product-images: admin borra" on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());

-- ---------------------------------------------------------------------
-- 13. DATOS DE EJEMPLO
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, description, position) values
  ('Monitores',  'monitores',  'Monitores gamer, de oficina y profesionales', 1),
  ('Teclados',   'teclados',   'Teclados mecánicos, de membrana e inalámbricos', 2),
  ('Mouse',      'mouse',      'Mouse gamer, ergonómicos e inalámbricos', 3),
  ('Audífonos',  'audifonos',  'Audífonos y headsets con micrófono', 4),
  ('Webcams',    'webcams',    'Cámaras web para streaming y videollamadas', 5),
  ('Accesorios', 'accesorios', 'Mousepads, soportes, hubs USB y cables', 6);

insert into public.brands (name, slug) values
  ('LG', 'lg'), ('Samsung', 'samsung'), ('Logitech', 'logitech'),
  ('Redragon', 'redragon'), ('HyperX', 'hyperx'), ('Razer', 'razer');

-- Especificaciones por categoría
insert into public.attributes (category_id, name, slug, unit, data_type, position)
select c.id, a.name, a.slug, a.unit, a.dtype::public.attr_data_type, a.pos
from (values
  ('monitores', 'Tamaño',            'size',         'pulgadas', 'number', 1),
  ('monitores', 'Resolución',        'resolution',   null,       'text',   2),
  ('monitores', 'Tasa de refresco',  'refresh-rate', 'Hz',       'number', 3),
  ('monitores', 'Tipo de panel',     'panel',        null,       'text',   4),
  ('monitores', 'Tiempo de respuesta','response-time','ms',      'number', 5),
  ('teclados',  'Tipo',              'type',         null,       'text',   1),
  ('teclados',  'Switch',            'switch',       null,       'text',   2),
  ('teclados',  'Formato',           'layout',       null,       'text',   3),
  ('teclados',  'Conexión',          'connection',   null,       'text',   4),
  ('teclados',  'Retroiluminación RGB','rgb',        null,       'boolean',5),
  ('mouse',     'DPI máximo',        'dpi',          'DPI',      'number', 1),
  ('mouse',     'Conexión',          'connection',   null,       'text',   2),
  ('mouse',     'Peso',              'weight',       'g',        'number', 3),
  ('mouse',     'Botones',           'buttons',      null,       'number', 4),
  ('audifonos', 'Conexión',          'connection',   null,       'text',   1),
  ('audifonos', 'Sonido envolvente', 'surround',     null,       'text',   2),
  ('audifonos', 'Micrófono',         'microphone',   null,       'boolean',3)
) as a(cat, name, slug, unit, dtype, pos)
join public.categories c on c.slug = a.cat;

insert into public.shipping_methods (name, description, price, estimated_days) values
  ('Recojo en tienda',            'Sin costo, previa confirmación',  0.00, '1 día hábil'),
  ('Delivery Lima Metropolitana', 'Entrega a domicilio',            12.00, '1-2 días hábiles'),
  ('Envío a provincias',          'Por agencia de transporte',      25.00, '3-5 días hábiles');

insert into public.coupons (code, description, discount_type, value, min_order, max_uses) values
  ('BIENVENIDO10', '10% en tu primera compra', 'percentage', 10, 100, 500),
  ('GAMER50',      'S/ 50 de descuento',        'fixed',      50, 600, 100);

-- Productos
insert into public.products (category_id, brand_id, name, slug, model, short_desc, description, is_featured, warranty_months)
select c.id, b.id, p.name, p.slug, p.model, p.short_desc, p.description, p.featured, p.warranty
from (values
  ('monitores', 'lg',       'Monitor LG UltraGear 27" QHD 165Hz', 'monitor-lg-ultragear-27-qhd-165hz', '27GP850-B',
   'Panel Nano IPS, 1 ms, HDR10', 'Monitor gamer de 27 pulgadas con resolución QHD, 165 Hz y compatibilidad G-Sync.', true, 24),
  ('monitores', 'samsung',  'Monitor Samsung 24" Full HD IPS 75Hz', 'monitor-samsung-24-fhd-ips-75hz', 'LF24T350FHL',
   'Ideal para oficina y estudio', 'Monitor de 24 pulgadas con panel IPS, bordes delgados y modo de protección visual.', false, 12),
  ('teclados',  'redragon', 'Teclado mecánico Redragon Kumara K552 RGB', 'teclado-redragon-kumara-k552-rgb', 'K552-RGB',
   'Tenkeyless, switches Outemu', 'Teclado mecánico compacto TKL con retroiluminación RGB y estructura metálica.', true, 12),
  ('teclados',  'logitech', 'Teclado inalámbrico Logitech MX Keys S', 'teclado-logitech-mx-keys-s', 'MX Keys S',
   'Bluetooth, multi-dispositivo', 'Teclado de perfil bajo con teclas cóncavas, retroiluminación inteligente y hasta 3 dispositivos.', false, 12),
  ('mouse',     'logitech', 'Mouse gamer Logitech G502 HERO', 'mouse-logitech-g502-hero', 'G502 HERO',
   '25 600 DPI, 11 botones', 'Mouse gamer con sensor HERO 25K, pesos ajustables y 11 botones programables.', true, 24),
  ('mouse',     'razer',    'Mouse inalámbrico Razer DeathAdder V3 Pro', 'mouse-razer-deathadder-v3-pro', 'DeathAdder V3 Pro',
   'Ultraligero 63 g, 30 000 DPI', 'Mouse ergonómico inalámbrico ultraligero con sensor óptico Focus Pro 30K.', false, 24),
  ('audifonos', 'hyperx',   'Headset HyperX Cloud II 7.1', 'headset-hyperx-cloud-ii-71', 'Cloud II',
   'Sonido envolvente 7.1 virtual', 'Headset gamer con almohadillas de espuma viscoelástica y micrófono desmontable.', true, 24)
) as p(cat, brand, name, slug, model, short_desc, description, featured, warranty)
join public.categories c on c.slug = p.cat
join public.brands b on b.slug = p.brand;

-- Variantes (precio en soles y stock)
insert into public.product_variants (product_id, sku, name, options, price, compare_at_price, stock)
select p.id, v.sku, v.name, v.options::jsonb, v.price, v.compare_at, v.stock
from (values
  ('monitor-lg-ultragear-27-qhd-165hz', 'LG-27GP850-B',        'Estándar',          '{}',                                      1499.00, 1799.00, 12),
  ('monitor-samsung-24-fhd-ips-75hz',   'SAM-LF24T350',        'Estándar',          '{}',                                       499.00,  null,   30),
  ('teclado-redragon-kumara-k552-rgb',  'RD-K552-RED-ES',      'Switch Red / Español', '{"switch":"Red","idioma":"Español"}',   169.00,  199.00, 25),
  ('teclado-redragon-kumara-k552-rgb',  'RD-K552-BLUE-ES',     'Switch Blue / Español','{"switch":"Blue","idioma":"Español"}',  169.00,  199.00, 18),
  ('teclado-redragon-kumara-k552-rgb',  'RD-K552-BROWN-US',    'Switch Brown / Inglés','{"switch":"Brown","idioma":"Inglés"}',  175.00,  null,    4),
  ('teclado-logitech-mx-keys-s',        'LOG-MXKEYS-S-GRAF',   'Grafito',           '{"color":"Grafito"}',                      549.00,  null,   10),
  ('teclado-logitech-mx-keys-s',        'LOG-MXKEYS-S-GRIS',   'Gris pálido',       '{"color":"Gris pálido"}',                  549.00,  null,    6),
  ('mouse-logitech-g502-hero',          'LOG-G502-HERO',       'Negro',             '{"color":"Negro"}',                        229.00,  259.00, 40),
  ('mouse-razer-deathadder-v3-pro',     'RZ-DAV3PRO-BLK',      'Negro',             '{"color":"Negro"}',                        699.00,  null,    8),
  ('mouse-razer-deathadder-v3-pro',     'RZ-DAV3PRO-WHT',      'Blanco',            '{"color":"Blanco"}',                       699.00,  null,    3),
  ('headset-hyperx-cloud-ii-71',        'HX-CLOUDII-RED',      'Rojo',              '{"color":"Rojo"}',                         349.00,  399.00, 20),
  ('headset-hyperx-cloud-ii-71',        'HX-CLOUDII-GUN',      'Gunmetal',          '{"color":"Gunmetal"}',                     349.00,  399.00, 15)
) as v(slug, sku, name, options, price, compare_at, stock)
join public.products p on p.slug = v.slug;

-- Especificaciones de cada producto
insert into public.product_attributes (product_id, attribute_id, value_text, value_number, value_bool)
select p.id, a.id, s.vtext, s.vnum, s.vbool
from (values
  ('monitor-lg-ultragear-27-qhd-165hz', 'size',          null,               27::numeric, null::boolean),
  ('monitor-lg-ultragear-27-qhd-165hz', 'resolution',    '2560 x 1440 (QHD)', null, null),
  ('monitor-lg-ultragear-27-qhd-165hz', 'refresh-rate',  null,               165, null),
  ('monitor-lg-ultragear-27-qhd-165hz', 'panel',         'Nano IPS',         null, null),
  ('monitor-lg-ultragear-27-qhd-165hz', 'response-time', null,               1, null),
  ('monitor-samsung-24-fhd-ips-75hz',   'size',          null,               24, null),
  ('monitor-samsung-24-fhd-ips-75hz',   'resolution',    '1920 x 1080 (Full HD)', null, null),
  ('monitor-samsung-24-fhd-ips-75hz',   'refresh-rate',  null,               75, null),
  ('monitor-samsung-24-fhd-ips-75hz',   'panel',         'IPS',              null, null),
  ('monitor-samsung-24-fhd-ips-75hz',   'response-time', null,               5, null),
  ('teclado-redragon-kumara-k552-rgb',  'type',          'Mecánico',         null, null),
  ('teclado-redragon-kumara-k552-rgb',  'switch',        'Outemu',           null, null),
  ('teclado-redragon-kumara-k552-rgb',  'layout',        'TKL (87 teclas)',  null, null),
  ('teclado-redragon-kumara-k552-rgb',  'connection',    'USB cableado',     null, null),
  ('teclado-redragon-kumara-k552-rgb',  'rgb',           null,               null, true),
  ('teclado-logitech-mx-keys-s',        'type',          'Membrana (tijera)', null, null),
  ('teclado-logitech-mx-keys-s',        'layout',        'Completo',         null, null),
  ('teclado-logitech-mx-keys-s',        'connection',    'Bluetooth / Logi Bolt', null, null),
  ('teclado-logitech-mx-keys-s',        'rgb',           null,               null, false),
  ('mouse-logitech-g502-hero',          'dpi',           null,               25600, null),
  ('mouse-logitech-g502-hero',          'connection',    'USB cableado',     null, null),
  ('mouse-logitech-g502-hero',          'weight',        null,               121, null),
  ('mouse-logitech-g502-hero',          'buttons',       null,               11, null),
  ('mouse-razer-deathadder-v3-pro',     'dpi',           null,               30000, null),
  ('mouse-razer-deathadder-v3-pro',     'connection',    'Inalámbrico 2.4 GHz', null, null),
  ('mouse-razer-deathadder-v3-pro',     'weight',        null,               63, null),
  ('mouse-razer-deathadder-v3-pro',     'buttons',       null,               5, null),
  ('headset-hyperx-cloud-ii-71',        'connection',    'USB / Jack 3.5 mm', null, null),
  ('headset-hyperx-cloud-ii-71',        'surround',      '7.1 virtual',      null, null),
  ('headset-hyperx-cloud-ii-71',        'microphone',    null,               null, true)
) as s(slug, attr, vtext, vnum, vbool)
join public.products p   on p.slug = s.slug
join public.attributes a on a.slug = s.attr and a.category_id = p.category_id;

-- Inventario inicial como movimiento de entrada
insert into public.inventory_movements (variant_id, change, reason, note)
select id, stock, 'purchase', 'Stock inicial' from public.product_variants;

-- ---------------------------------------------------------------------
-- 14. CREAR TU PRIMER ADMINISTRADOR
-- Regístrate en la web y luego ejecuta (cambiando el email):
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where email = 'tu-correo@ejemplo.com');
-- ---------------------------------------------------------------------

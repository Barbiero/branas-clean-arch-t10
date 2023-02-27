drop table if exists cccat10.product CASCADE;
drop table if exists cccat10.order_items CASCADE;
drop table if exists cccat10.order CASCADE;
drop table if exists cccat10.coupon CASCADE;
drop schema if exists cccat10;
create schema cccat10;
create table cccat10.product (
  id_product integer,
  description text,
  price numeric,
  weight numeric,
  height numeric,
  width numeric,
  depth numeric,
  currency text,
  PRIMARY KEY(id_product)
);
insert into cccat10.product (
    id_product,
    description,
    price,
    weight,
    height,
    width,
    depth,
    currency
  )
values (1, 'camera', 1250, 1, 0.15, 0.2, 0.1, 'BRL'),
  (2, 'guitarra', 5000, 3, 1, 0.3, 0.1, 'BRL'),
  (3, 'geladeira', 15000, 40, 2, 1, 0.5, 'BRL'),
  (4, 'D', 30, -10, 10, 10, 0.9, 'BRL'),
  (5, 'A', 1000, 100, 30, 10, 3, 'USD');
create table cccat10.coupon (
  code text PRIMARY KEY,
  percentage numeric,
  expiresAt date
);
insert into cccat10.coupon (code, percentage, expiresAt)
values ('VALE20', 20, '2999-12-01'::date),
  ('VALE10', 10, '2999-12-01'::date);
create table cccat10.order (
  id_order SERIAL PRIMARY KEY,
  buyer text NOT NULL,
  coupon_code text NULL REFERENCES cccat10.coupon(code),
  total numeric,
  freight numeric,
  created_at timestamp with time zone not null default now()
);
create table cccat10.order_items (
  id_order integer REFERENCES cccat10.order(id_order),
  id_product integer REFERENCES cccat10.product(id_product),
  price numeric,
  quantity numeric
);
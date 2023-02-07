drop table if exists cccat10.coupon;
drop table if exists cccat10.product;
drop schema if exists cccat10;
create schema cccat10;
create table cccat10.product (
  id_product integer,
  description text,
  price numeric,
  weight numeric,
  height numeric,
  width numeric,
  depth numeric
);
insert into cccat10.product (
    id_product,
    description,
    price,
    weight,
    height,
    width,
    depth
  )
values (1, 'camera', 1250, 1, 0.15, 0.2, 0.1),
  (2, 'guitarra', 5000, 3, 1, 0.3, 0.1),
  (3, 'geladeira', 15000, 40, 2, 1, 0.5);
create table cccat10.coupon (code text, percentage numeric);
insert into cccat10.coupon (code, percentage)
values ('VALE20', 20);
--
-- PostgreSQL database dump
--


-- Dumped from database version 15.4
-- Dumped by pg_dump version 18.0

-- Started on 2026-04-15 16:13:15 IST

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;

--
-- TOC entry 3689 (class 1262 OID 16432)
-- Name: warehouse_db; Type: DATABASE; Schema: -; Owner: postgres

--
-- TOC entry 6 (class 2615 OID 16554)
-- Name: parth_schema; Type: SCHEMA; Schema: -; Owner: parth
--

CREATE SCHEMA parth_schema;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 238 (class 1259 OID 16687)
-- Name: inventory; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.inventory (
    id integer NOT NULL,
    product_name text NOT NULL,
    warehouse_id integer NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT inventory_quantity_check CHECK ((quantity >= 0))
);

--
-- TOC entry 237 (class 1259 OID 16686)
-- Name: inventory_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.inventory_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 237
-- Name: inventory_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.inventory_id_seq OWNED BY parth_schema.inventory.id;


--
-- TOC entry 229 (class 1259 OID 16556)
-- Name: locations; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.locations (
    id integer NOT NULL,
    name text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL
);

--
-- TOC entry 228 (class 1259 OID 16555)
-- Name: locations_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 228
-- Name: locations_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.locations_id_seq OWNED BY parth_schema.locations.id;


--
-- TOC entry 240 (class 1259 OID 16709)
-- Name: order_items; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_name text NOT NULL,
    quantity integer NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);

--
-- TOC entry 239 (class 1259 OID 16708)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3693 (class 0 OID 0)
-- Dependencies: 239
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.order_items_id_seq OWNED BY parth_schema.order_items.id;


--
-- TOC entry 236 (class 1259 OID 16621)
-- Name: orders; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.orders (
    id integer NOT NULL,
    warehouse_id integer,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status text NOT NULL,
    delivery_city text NOT NULL,
    user_id integer
);

--
-- TOC entry 235 (class 1259 OID 16620)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3694 (class 0 OID 0)
-- Dependencies: 235
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.orders_id_seq OWNED BY parth_schema.orders.id;


--
-- TOC entry 232 (class 1259 OID 16578)
-- Name: products; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.products (
    product_name text NOT NULL
);

--
-- TOC entry 234 (class 1259 OID 16586)
-- Name: sales_records; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.sales_records (
    id integer NOT NULL,
    product_name text,
    date date NOT NULL,
    quantity_sold integer NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 16585)
-- Name: sales_records_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.sales_records_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3695 (class 0 OID 0)
-- Dependencies: 233
-- Name: sales_records_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.sales_records_id_seq OWNED BY parth_schema.sales_records.id;


--
-- TOC entry 242 (class 1259 OID 16730)
-- Name: users; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['ORDER_CREATOR'::text, 'WAREHOUSE_MANAGER'::text, 'ADMIN'::text])))
);

--
-- TOC entry 241 (class 1259 OID 16729)
-- Name: users_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3696 (class 0 OID 0)
-- Dependencies: 241
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.users_id_seq OWNED BY parth_schema.users.id;


--
-- TOC entry 231 (class 1259 OID 16565)
-- Name: warehouses; Type: TABLE; Schema: parth_schema; Owner: parth
--

CREATE TABLE parth_schema.warehouses (
    id integer NOT NULL,
    name text NOT NULL,
    location_id integer
);

--
-- TOC entry 230 (class 1259 OID 16564)
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: parth_schema; Owner: parth
--

CREATE SEQUENCE parth_schema.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

--
-- TOC entry 3697 (class 0 OID 0)
-- Dependencies: 230
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: parth_schema; Owner: parth
--

ALTER SEQUENCE parth_schema.warehouses_id_seq OWNED BY parth_schema.warehouses.id;


--
-- TOC entry 3506 (class 2604 OID 16690)
-- Name: inventory id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.inventory ALTER COLUMN id SET DEFAULT nextval('parth_schema.inventory_id_seq'::regclass);


--
-- TOC entry 3501 (class 2604 OID 16559)
-- Name: locations id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.locations ALTER COLUMN id SET DEFAULT nextval('parth_schema.locations_id_seq'::regclass);


--
-- TOC entry 3507 (class 2604 OID 16712)
-- Name: order_items id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.order_items ALTER COLUMN id SET DEFAULT nextval('parth_schema.order_items_id_seq'::regclass);


--
-- TOC entry 3504 (class 2604 OID 16624)
-- Name: orders id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.orders ALTER COLUMN id SET DEFAULT nextval('parth_schema.orders_id_seq'::regclass);


--
-- TOC entry 3503 (class 2604 OID 16589)
-- Name: sales_records id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.sales_records ALTER COLUMN id SET DEFAULT nextval('parth_schema.sales_records_id_seq'::regclass);


--
-- TOC entry 3508 (class 2604 OID 16733)
-- Name: users id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.users ALTER COLUMN id SET DEFAULT nextval('parth_schema.users_id_seq'::regclass);


--
-- TOC entry 3502 (class 2604 OID 16568)
-- Name: warehouses id; Type: DEFAULT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.warehouses ALTER COLUMN id SET DEFAULT nextval('parth_schema.warehouses_id_seq'::regclass);


--
-- TOC entry 3526 (class 2606 OID 16695)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 3515 (class 2606 OID 16563)
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- TOC entry 3530 (class 2606 OID 16717)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3524 (class 2606 OID 16629)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3519 (class 2606 OID 16685)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_name);


--
-- TOC entry 3521 (class 2606 OID 16593)
-- Name: sales_records sales_records_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.sales_records
    ADD CONSTRAINT sales_records_pkey PRIMARY KEY (id);


--
-- TOC entry 3528 (class 2606 OID 16697)
-- Name: inventory unique_product_warehouse; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.inventory
    ADD CONSTRAINT unique_product_warehouse UNIQUE (product_name, warehouse_id);


--
-- TOC entry 3532 (class 2606 OID 16742)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3534 (class 2606 OID 16740)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3517 (class 2606 OID 16572)
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- TOC entry 3522 (class 1259 OID 16728)
-- Name: idx_orders_delivery_city; Type: INDEX; Schema: parth_schema; Owner: parth
--

CREATE INDEX idx_orders_delivery_city ON parth_schema.orders USING btree (delivery_city);


--
-- TOC entry 3538 (class 2606 OID 16698)
-- Name: inventory inventory_product_fk; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.inventory
    ADD CONSTRAINT inventory_product_fk FOREIGN KEY (product_name) REFERENCES parth_schema.products(product_name);


--
-- TOC entry 3539 (class 2606 OID 16703)
-- Name: inventory inventory_warehouse_fk; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.inventory
    ADD CONSTRAINT inventory_warehouse_fk FOREIGN KEY (warehouse_id) REFERENCES parth_schema.warehouses(id);


--
-- TOC entry 3540 (class 2606 OID 16718)
-- Name: order_items order_items_order_fk; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.order_items
    ADD CONSTRAINT order_items_order_fk FOREIGN KEY (order_id) REFERENCES parth_schema.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3541 (class 2606 OID 16723)
-- Name: order_items order_items_product_fk; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.order_items
    ADD CONSTRAINT order_items_product_fk FOREIGN KEY (product_name) REFERENCES parth_schema.products(product_name);


--
-- TOC entry 3536 (class 2606 OID 16743)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES parth_schema.users(id);


--
-- TOC entry 3537 (class 2606 OID 16630)
-- Name: orders orders_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.orders
    ADD CONSTRAINT orders_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES parth_schema.warehouses(id);


--
-- TOC entry 3535 (class 2606 OID 16573)
-- Name: warehouses warehouses_location_id_fkey; Type: FK CONSTRAINT; Schema: parth_schema; Owner: parth
--

ALTER TABLE ONLY parth_schema.warehouses
    ADD CONSTRAINT warehouses_location_id_fkey FOREIGN KEY (location_id) REFERENCES parth_schema.locations(id);


--
-- TOC entry 3690 (class 0 OID 0)
-- Dependencies: 3689
-- Name: DATABASE warehouse_db; Type: ACL; Schema: -; Owner: postgres
--


-- Completed on 2026-04-15 16:13:15 IST

--
-- PostgreSQL database dump complete
--


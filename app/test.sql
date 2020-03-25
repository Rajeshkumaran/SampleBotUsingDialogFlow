
CREATE TABLE users(id VARCHAR PRIMARY KEY,first_name VARCHAR,last_name VARCHAR,gender VARCHAR,session_id VARCHAR);

/* --------------------------------categories-------------------- */
CREATE TABLE categories(id int PRIMARY key,name varchar,image_url varchar);
INSERT INTO categories VALUES(3, 'Nuts & Seeds', 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQjqbVnQfqqdxfFTXyP8DUmVQzrBKWxX8MpdR9Mj0M2duMg8ifh');
/* ---------------categories ends here------------------------ */

/* --------------------------------sub_categories-------------------- */
CREATE TABLE sub_categories(id VARCHAR PRIMARY key,name varchar,image_url varchar,category_name VARCHAR ,category_id int REFERENCES categories(id));
INSERT INTO sub_categories (id,name,category_name,category_id,image_url) values ('SC10','Eggs','Meat,Fish & Poultry',5,'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQ_xMNMvqC3wj38BNQi2ZgksbHjiYYQHXsBotays9uSauhYTeEe');
/* --------------------------------sub_categories ends here-------------------- */

/* --------------------------------products-------------------- */
CREATE TABLE products(id VARCHAR PRIMARY key,name varchar,image_url varchar,category_name VARCHAR ,category_id int REFERENCES categories(id),sub_category_name VARCHAR,sub_category_id VARCHAR REFERENCES sub_categories(id));
INSERT INTO products (id,name,category_name,category_id,sub_category_name,sub_category_id,image_url) values ('P2','Bananas','Fruits & Vegetables',1,'Fresh Fruits','SC1','https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRsrCtkzTX68NfA-na9HXPZ21GQYom8YFFvVRgfnpIEaU-bdrGE');
/* --------------------------------products ends here-------------------- */


/* ----------------- transaction_info table -------------- */
create TABLE transaction_info(id VARCHAR PRIMARY key,session_id VARCHAR,is_active BOOLEAN,total_price VARCHAR,cart_info jsonb,created_at DATE NOT NULL DEFAULT CURRENT_DATE,updated_at DATE NOT NULL DEFAULT CURRENT_DATE);
INSERT INTO transaction_info (id,session_id,total_price,cart_info,is_active) values('12345','2798396676905089','4234','{"cart_info":{"products":["dark chocolate","badam"]}}',true)

/* -------------transaction_info ends here--------------------------- */

/* -------------REORDER QUERY------------------------*/
select * from transaction_info where id=(select previous_order_id from transaction_info where is_active=true and session_id='2691069327688536');

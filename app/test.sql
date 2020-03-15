INSERT INTO categories VALUES(3, 'Nuts & Seeds', 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQjqbVnQfqqdxfFTXyP8DUmVQzrBKWxX8MpdR9Mj0M2duMg8ifh');

CREATE TABLE users(id VARCHAR PRIMARY KEY,first_name VARCHAR,last_name VARCHAR,gender VARCHAR,session_id VARCHAR);


/* ----------------- transaction_info table -------------- */
create table transaction_info(transaction_id serial primary key,session_id VARCHAR(25),total_price VARCHAR(7),created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,cart_info jsonb);d

INSERT INTO transaction_info (transaction_id,session_id,total_price,cart_info) values('12345','2798396676905089','4234','{"cart_info":{"products":["dark chocolate","badam"]}}')


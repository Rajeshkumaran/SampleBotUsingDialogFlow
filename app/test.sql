INSERT INTO categories VALUES(3, 'Nuts & Seeds', 'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQjqbVnQfqqdxfFTXyP8DUmVQzrBKWxX8MpdR9Mj0M2duMg8ifh');

CREATE TABLE users(id VARCHAR PRIMARY KEY,first_name VARCHAR,last_name VARCHAR,gender VARCHAR,session_id VARCHAR);


/* ----------------- transaction_info table -------------- */
create TABLE transaction_info(id VARCHAR PRIMARY key,session_id VARCHAR,is_active BOOLEAN,total_price VARCHAR,cart_info jsonb,created_at DATE NOT NULL DEFAULT CURRENT_DATE,updated_at DATE NOT NULL DEFAULT CURRENT_DATE
                             );

INSERT INTO transaction_info (id,session_id,total_price,cart_info,is_active) values('12345','2798396676905089','4234','{"cart_info":{"products":["dark chocolate","badam"]}}',true)


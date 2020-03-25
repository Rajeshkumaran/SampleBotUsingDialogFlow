import { postgreSqlConnection } from '../connectors/config';
export const selectCartInfoUsingSessionId = sessionId =>
  postgreSqlConnection.query(
    `select cart_info,id from transaction_info where session_id='${sessionId}' and is_active=true`,
  );
export const insertIntoTransactionInfo = ({
  id,
  sessionId,
  totalPrice,
  cartInfo,
  previousOrderId = null,
}) =>
  postgreSqlConnection.query(
    `INSERT INTO transaction_info (id,session_id,total_price,cart_info,is_active,is_order_placed,previous_order_id) values('${id}','${sessionId}','${totalPrice}','${JSON.stringify(
      cartInfo,
    )}',true,false,'${previousOrderId}')`,
  );
export const updateCartInfoBySessionId = ({
  sessionId,
  cartInfo,
  totalPrice,
}) =>
  postgreSqlConnection.query(
    `UPDATE transaction_info set total_price='${totalPrice}' ,cart_info='${JSON.stringify(
      cartInfo,
    )}'where session_id='${sessionId}'`,
  );
export const getCategories = () =>
  postgreSqlConnection.query('select * from categories');
export const getSubCategoriesByCategories = ({ categoryName = '' }) =>
  postgreSqlConnection.query(
    `select * from sub_categories where category_name='${categoryName}'`,
  );
export const getProductsByCategories = ({ categoryName = '' }) =>
  postgreSqlConnection.query(
    `select * from products where category_name='${categoryName}'`,
  );
export const getProductsBySubCategories = ({ subCategoryName = '' }) =>
  postgreSqlConnection.query(
    `select * from products where sub_category_name='${subCategoryName}'`,
  );
export const getProductsByProductName = ({ productName }) =>
  postgreSqlConnection.query(
    `select * from products where name='${productName}'`,
  );
export const placeOrder = id =>
  postgreSqlConnection.query(
    `update transaction_info set is_order_placed=true,is_active=false where id='${id}'`,
  );
export const getPreviousOrderInfo = userId =>
  postgreSqlConnection.query(
    `select * from transaction_info where id=(select previous_order_id from transaction_info where is_active=true and session_id='${userId}');`,
  );
export const reorderQuery = ({ userId, cartInfo }) =>
  postgreSqlConnection.query(
    `update transaction_info set is_active=false,is_order_placed=true,cart_info='${JSON.stringify(
      cartInfo,
    )}' where id=(select id from transaction_info where is_active=true and session_id='${userId}');`,
  );
export const getHotDealsProducts = () =>
  postgreSqlConnection.query(`select * from products where is_hot_deal='true'`);

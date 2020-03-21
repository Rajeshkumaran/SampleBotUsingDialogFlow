import { postgreSqlConnection } from '../connectors/config';
export const selectCartInfoUsingSessionId = sessionId =>
  postgreSqlConnection.query(
    `select cart_info from transaction_info where session_id='${sessionId}' and is_active=true`,
  );
export const insertIntoTransactionInfo = ({
  id,
  sessionId,
  totalPrice,
  cartInfo,
}) =>
  postgreSqlConnection.query(
    `INSERT INTO transaction_info (id,session_id,total_price,cart_info,is_active) values('${id}','${sessionId}','${totalPrice}','${JSON.stringify(
      cartInfo,
    )}',true)`,
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

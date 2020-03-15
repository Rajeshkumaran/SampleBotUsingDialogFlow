import { pg } from '../connectors/config';
export const selectTransactionUsingSessionId = session_id =>
  `select * from transaction_info where session_id=${session_id}`;
export const insertIntoTransactionInfo = ({
  transactionId,
  sessionId,
  totalPrice,
  cartInfo,
}) =>
  pg.query(
    `INSERT INTO transaction_info (transaction_id,session_id,total_price,cart_info) values('${transactionId}','${sessionId}','${totalPrice}','${JSON.stringify(
      cartInfo,
    )}')`,
  );

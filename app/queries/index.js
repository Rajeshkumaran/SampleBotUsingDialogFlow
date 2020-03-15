const selectTransactionUsingSessionId = session_id =>
  `select * from transaction_info where session_id=${session_id}`;
export default {
  selectTransactionUsingSessionId,
};

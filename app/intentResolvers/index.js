import {
  constructProductCatalog,
  productsBasedOnCategory,
  constructTextResponse,
} from '../utils/helpers';
import { SHOW_PRODUCT_CATALOG_INTENT, VIEW_PRODUCT } from '../utils/constants';

const resolveIntent = async ({ intentName = '', parameters = {} }) => {
  let responseObject = {};

  switch (intentName) {
    case SHOW_PRODUCT_CATALOG_INTENT: {
      responseObject = await constructProductCatalog();
      break;
    }
    case VIEW_PRODUCT: {
      const { category_types = 'Nuts' } = parameters;
      responseObject = productsBasedOnCategory(category_types);
      break;
    }
    default:
      responseObject = constructTextResponse('Pardon come again');
  }
  return responseObject;
};
export default resolveIntent;

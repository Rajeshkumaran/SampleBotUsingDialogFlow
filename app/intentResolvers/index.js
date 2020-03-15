import {
  constructProductCatalog,
  productsBasedOnCategory,
  constructTextResponse,
  getUserDetails,
  addOrUpdateUser,
} from '../utils/helpers';
import { SHOW_PRODUCT_CATALOG_INTENT, VIEW_PRODUCT, WELCOME_MESSAGE } from '../utils/constants';

const resolveIntent = async ({ intentName = '', parameters = {} , request}) => {
  let responseObject = {};

  switch (intentName) {
    case WELCOME_MESSAGE: {
      console.log('inside welcome message');
      const userContext = getUserDetails(request)
      console.log('userContext -=> ' + userContext);
      addOrUpdateUser(userContext);
      responseObject = constructTextResponse('Hello ' + userContext.first_name);
      break;
    }
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

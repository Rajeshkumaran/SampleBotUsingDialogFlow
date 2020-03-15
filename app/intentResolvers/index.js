import {
  constructProductCatalog,
  productsBasedOnCategory,
  constructTextResponse,
  getUserDetails,
  addOrUpdateUser,
  constructCardResponse,
} from '../utils/helpers';
import {
  SHOW_PRODUCT_CATALOG_INTENT,
  ADD_TO_CART_INTENT,
  VIEW_PRODUCT_INTENT,
  WELCOME_MESSAGE_INTENT,
} from '../utils/constants';

const resolveIntent = async ({ intentName = '', parameters = {}, request }) => {
  let responseObject = {};

  switch (intentName) {
    case WELCOME_MESSAGE_INTENT: {
      console.log('inside welcome message');
      const userContext = await getUserDetails(request);
      console.log('userContext -=> ' + userContext);
      addOrUpdateUser(userContext);
      let salutation = userContext.gender === 'male' ? 'Mr. ' : 'Ms. ';
      const greetingMessage = `Hello ${salutation}${userContext.first_name}`;
      responseObject = constructCardResponse([
        {
          showCustomButtons: true,
          name: 'Welcome to ABC supermarket',
          image_url:
            'https://lh3.googleusercontent.com/_0EOeOXx2WC-vkEwzhKHzhxeQjhgHIeHJKWljeUzAjos3QLfca8eWDCadZiBJ1mSY2hdx3lCaY8g6iUMDMQiz1b7T2ttpOkJSg=s750',
          buttons: [
            {
              type: 'postback',
              payload: 'View Products',
              title: 'View Products',
            },
            // {
            //   type: 'postback',
            //   payload: 'Select Quantity for Dark Chocolate',
            //   title: 'Select Quantity',
            // },
          ],
        },
      ]);
      responseObject = {
        fulfillmentMessages: [
          {
            text: {
              text: [greetingMessage],
            },
            platform: 'FACEBOOK',
          },
          ...responseObject.fulfillmentMessages,
        ],
      };
      break;
    }
    case SHOW_PRODUCT_CATALOG_INTENT: {
      const products = await constructProductCatalog();
      responseObject = constructCardResponse(products);
      break;
    }
    case VIEW_PRODUCT_INTENT: {
      const { category_types = 'Nuts' } = parameters;
      responseObject = productsBasedOnCategory(category_types);
      break;
    }
    case ADD_TO_CART_INTENT: {
      console.log('add to cart -> log ', parameters);
      responseObject = constructTextResponse('Added to Cart');
      break;
    }
    default:
      responseObject = constructTextResponse('Pardon come again');
  }
  return responseObject;
};
export default resolveIntent;

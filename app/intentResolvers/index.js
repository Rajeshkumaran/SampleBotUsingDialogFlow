import {
  constructProductCatalog,
  productsBasedOnCategory,
  constructTextResponse,
  getUserDetails,
  addOrUpdateUser,
  constructCardResponse,
  addToCart,
  getUserIdFromRequest,
  get,
} from '../utils/helpers';
import {
  SHOW_PRODUCT_CATALOG_INTENT,
  ADD_TO_CART_INTENT,
  VIEW_PRODUCT_INTENT,
  WELCOME_MESSAGE_INTENT,
  VIEW_CART_INTENT,
} from '../utils/constants';
import { selectCartInfoUsingSessionId } from '../queries';

const resolveIntent = async ({ intentName = '', parameters = {}, request }) => {
  let responseObject = {};
  let userId = getUserIdFromRequest(request);

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
            {
              type: 'postback',
              payload: 'Old orders',
              title: 'Old orders',
            },
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
      const { item } = parameters;
      const items = [
        {
          item_name: item,
          price: '250',
          quantity: 1,
        },
      ];
      const isItemAdded = await addToCart({ userId, items });
      console.log('isItemAdded', isItemAdded);
      if (isItemAdded) {
        responseObject = constructCardResponse([
          {
            showCustomButtons: true,
            name: 'ABC Supermarket',
            image_url:
              'https://scontent.fmaa2-1.fna.fbcdn.net/v/t1.0-9/27867265_1784381608241200_4237446729118763549_n.jpg?_nc_cat=104&_nc_sid=85a577&_nc_ohc=7kERmMrFuhEAX-GGKyS&_nc_ht=scontent.fmaa2-1.fna&oh=ca7cf39165f3c687070a017ecee5c507&oe=5E953320',
            buttons: [
              {
                type: 'postback',
                payload: `View Cart`,
                title: 'View Cart',
              },
            ],
          },
        ]);
        responseObject = {
          fulfillmentMessages: [
            {
              text: {
                text: [`Added ${item} to cart`],
              },
              platform: 'FACEBOOK',
            },
            ...responseObject.fulfillmentMessages,
          ],
        };
        console.log('add to cart success', responseObject);
      } else
        responseObject = constructTextResponse(
          'Something went wrong ,please add again',
        );
      break;
    }
    case VIEW_CART_INTENT: {
      const cart = await selectCartInfoUsingSessionId(userId);
      const productDetails = get(cart[0], 'cart_info.product_details', []);
      console.log('cartInfo', userId, cart, productDetails);
      const items = productDetails.map((item, index) => {
        return {
          text: {
            text: [`${item.item_name} - Rs.${200 * (index + 1) * 3}`],
          },
        };
      });
      responseObject = {
        fulfillmentMessages: [
          ...items,
          {
            payload: {
              facebook: {
                attachment: {
                  type: 'template',
                  payload: {
                    template_type: 'button',
                    text: 'What do you want to do next?',
                    buttons: [
                      {
                        type: 'postback',
                        title: 'Place order',
                        payload: 'Place order',
                      },
                    ],
                  },
                },
              },
            },
          },
        ],
      };
      break;
    }
    default:
      responseObject = constructTextResponse('Pardon come again');
  }
  return responseObject;
};
export default resolveIntent;

import {
  getAllCategories,
  getAllSubCategories,
  constructTextResponse,
  getUserDetails,
  addOrUpdateUser,
  constructCardResponse,
  addToCart,
  getUserIdFromRequest,
  get,
  getAllProducts,
} from '../utils/helpers';
import {
  ADD_TO_CART_INTENT,
  VIEW_PRODUCT_INTENT,
  WELCOME_MESSAGE_INTENT,
  VIEW_CART_INTENT,
  SHOW_CATEGORIES_INTENT,
  SHOW_SUB_CATEGORIES_INTENT,
} from '../utils/constants';
import {
  selectCartInfoUsingSessionId,
  getProductsByProductName,
} from '../queries';

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
          title: 'Welcome to ABC supermarket',
          image_url:
            'https://lh3.googleusercontent.com/_0EOeOXx2WC-vkEwzhKHzhxeQjhgHIeHJKWljeUzAjos3QLfca8eWDCadZiBJ1mSY2hdx3lCaY8g6iUMDMQiz1b7T2ttpOkJSg=s750',
          buttons: [
            {
              type: 'postback',
              payload: 'View Categories',
              title: 'Show Categories',
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
    case SHOW_CATEGORIES_INTENT: {
      const categories = await getAllCategories();
      responseObject = constructCardResponse(categories);
      break;
    }
    case SHOW_SUB_CATEGORIES_INTENT: {
      const { categoryName } = parameters;
      const subCategories = await getAllSubCategories({
        categoryName,
      });
      responseObject = constructCardResponse(subCategories);
      break;
    }

    case VIEW_PRODUCT_INTENT: {
      const { categoryName = null, subCategoryName = null } = parameters;
      const products = await getAllProducts({
        categoryName,
        subCategoryName,
      });
      responseObject = constructCardResponse(products);
      break;
    }
    case ADD_TO_CART_INTENT: {
      const { productName } = parameters;
      if (!productName) {
        // if particular product is available on search
        responseObject = constructTextResponse(
          `Sorry,currently we don't have that product`,
        );
        return;
      }
      let productDetails = await getProductsByProductName({ productName });
      productDetails = productDetails.map(({ name, price, measure_unit }) => ({
        product_name: name,
        price,
        quantity: 1,
        measure_unit,
      }));

      console.log('inside ADD_TO_CART_INTENT ', productDetails);
      const isItemAdded = await addToCart({
        userId,
        productsToBeAdded: productDetails,
      });
      console.log('isItemAdded', isItemAdded);
      if (isItemAdded) {
        responseObject = {
          fulfillmentMessages: [
            {
              payload: {
                facebook: {
                  text: `Added to cart`,
                  quick_replies: [
                    {
                      content_type: 'text',
                      title: 'View Cart',
                      payload: 'View Cart',
                    },
                    {
                      content_type: 'text',
                      title: 'Place order',
                      payload: 'Place order',
                    },
                  ],
                },
                platform: 'FACEBOOK',
              },
            },
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
      let productDetails = get(cart[0], 'cart_info.product_details', []);
      console.log('cartInfo', userId, cart, productDetails);
      productDetails = productDetails.map(item => {
        const { product_name, price, quantity, measure_unit } = item;
        return {
          title: product_name,
          subtitle: `Price - ${price}\nQuantity - ${quantity} ${measure_unit}`,
          showCustomButtons: true,
          buttons: [
            {
              type: 'postback',
              payload: 'Add more',
              title: 'Add More',
            },
          ],
        };
      });
      responseObject = constructCardResponse(productDetails);
      responseObject = {
        fulfillmentMessages: [
          {
            payload: {
              facebook: {
                attachment: get(
                  responseObject,
                  'fulfillmentMessages[0].payload.facebook.attachment',
                  {},
                ),
                quick_replies: [
                  {
                    content_type: 'text',
                    title: 'Place order',
                    payload: 'Place order',
                  },
                  {
                    content_type: 'text',
                    title: 'Add more products',
                    payload: 'Show categories',
                  },
                ],
              },
              platform: 'FACEBOOK',
            },
          },
        ],
      };
      break;
    }
    default: {
      responseObject = constructTextResponse('Pardon come again');
    }
  }
  return responseObject;
};
export default resolveIntent;

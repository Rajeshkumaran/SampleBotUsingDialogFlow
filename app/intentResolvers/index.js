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
  calculateTotalPrice,
  // sendEmail,
  createEmptyCart,
  createTransactionId,
  emptyCartFallbackResponse,
  removeFromCart,
  sendEmail,
} from '../utils/helpers';
import {
  ADD_TO_CART_INTENT,
  VIEW_PRODUCT_INTENT,
  WELCOME_MESSAGE_INTENT,
  VIEW_CART_INTENT,
  SHOW_CATEGORIES_INTENT,
  SHOW_SUB_CATEGORIES_INTENT,
  SEARCH_PRODUCT_INTENT,
  PLACE_ORDER_INTENT,
  REPEAT_PREVIOUS_ORDER_INTENT,
  SHOW_OLD_ORDER_INTENT,
  SHOW_HOT_DEALS_INTENT,
} from '../utils/constants';
import {
  selectCartInfoUsingSessionId,
  getProductsByProductName,
  placeOrder,
  getPreviousOrderInfo,
  reorderQuery,
  getHotDealsProducts,
  getStockWithProductName,
} from '../queries';

// const accountSid = 'AC7d29e187688e346f6c97295e1de38739';
// const authToken = '35870cd3d8cdcf375c9ab8e9e5cc6f15';
// const client = require('twilio')(accountSid, authToken);

const resolveIntent = async ({
  intentName = '',
  parameters = {},
  request,
  queryText,
  platform = 'FACEBOOK',
}) => {
  let responseObject = {};
  try {
    let userId = getUserIdFromRequest(request);
    switch (intentName) {
      case WELCOME_MESSAGE_INTENT: {
        const userContext = await getUserDetails(request);
        console.log('userContext -=> ' + userContext);
        addOrUpdateUser(userContext);
        let salutation = userContext.gender === 'male' ? 'Mr. ' : 'Ms. ';
        const greetingMessage = `Hello ${salutation}${userContext.first_name}`;
        const cart = await selectCartInfoUsingSessionId(userId);
        if (platform === 'WEB') {
          responseObject = {
            fulfillmentMessages: [],
            payload: {
              text: {
                text: ['Hello'],
              },
              cards: [
                {
                  title: 'card item1',
                  image_url: '',
                  buttons: [
                    {
                      type: 'postback',
                      payload: 'View Categories',
                      title: 'Show Categories',
                    },
                    {
                      type: 'postback',
                      payload: 'Show hot deals',
                      title: 'Hot Deals',
                    },
                  ],
                },
                {
                  title: 'card item2',
                  image_url: '',
                  buttons: [
                    {
                      type: 'postback',
                      payload: 'View Categories',
                      title: 'Show Categories',
                    },
                    {
                      type: 'postback',
                      payload: 'Show hot deals',
                      title: 'Hot Deals',
                    },
                  ],
                },
              ],
            },
          };
        } else {
          if (cart.length === 0) {
            // new user don't have cart no need to previous order button
            responseObject = constructCardResponse(
              [
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
                      payload: 'Show hot deals',
                      title: 'Hot Deals',
                    },
                  ],
                },
              ],
              platform,
            );
          } else {
            responseObject = constructCardResponse(
              [
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
                      payload: 'Show hot deals',
                      title: 'HOT Deals',
                    },
                    {
                      type: 'postback',
                      payload: 'Show previous order',
                      title: 'Show previous order',
                    },
                  ],
                },
              ],
              platform,
            );
          }

          responseObject = {
            fulfillmentMessages: [
              {
                text: {
                  text: [greetingMessage],
                },
                platform,
              },
              ...responseObject.fulfillmentMessages,
            ],
          };
        }
        break;
      }
      case SHOW_CATEGORIES_INTENT: {
        const categories = await getAllCategories();
        responseObject = constructCardResponse(categories, platform);
        responseObject = {
          fulfillmentMessages: [
            ...responseObject.fulfillmentMessages,
            // {
            //   text: {
            //     text: ['You can also type what do you want'],
            //   },
            //   platform: 'FACEBOOK',
            // },
          ],
        };
        break;
      }
      case SHOW_SUB_CATEGORIES_INTENT: {
        const { categoryName } = parameters;
        const subCategories = await getAllSubCategories({
          categoryName,
        });
        responseObject = constructCardResponse(subCategories, platform);
        break;
      }
      case SHOW_HOT_DEALS_INTENT: {
        let productDetails = await getHotDealsProducts();
        productDetails = productDetails.map(({ name, image_url, price }) => ({
          title: name,
          image_url,
          subtitle: `Rs. ${price}`,
          showCustomButtons: true,
          buttons: [
            {
              title: 'Add to cart',
              type: 'postback',
              payload: `Add ${name} to cart`,
            },
          ],
        }));
        responseObject = constructCardResponse(productDetails, platform);
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
                },
                platform: 'FACEBOOK',
              },
            },
          ],
        };
        break;
      }
      case VIEW_PRODUCT_INTENT: {
        const { categoryName = null, subCategoryName = null } = parameters;
        const products = await getAllProducts({
          categoryName,
          subCategoryName,
        });
        responseObject = constructCardResponse(products, platform);
        break;
      }
      case SEARCH_PRODUCT_INTENT: {
        const { productName } = parameters;
        console.log('SEARCH_PRODUCT_INTENT', parameters, productName);
        let productDetails = await getProductsByProductName({ productName });
        productDetails = productDetails.map(({ name, image_url, price }) => ({
          title: name,
          image_url,
          subtitle: `Rs. ${price}`,
        }));
        responseObject = constructCardResponse(productDetails, platform);
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
                      title: 'Add this to cart',
                      payload: `Add ${productName} to cart`,
                    },
                    {
                      content_type: 'text',
                      title: 'Not this ?',
                      payload: 'Not this product',
                    },
                  ],
                },
                platform: 'FACEBOOK',
              },
            },
          ],
        };
        // responseObject = constructTextResponse('Yes ,product is available');
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
        const {
          category_name: categoryName,
          sub_category_name: subCategoryName,
        } = productDetails[0];
        const productsToBeAdded = productDetails.map(
          ({ name, price, measure_unit, image_url }) => ({
            product_name: name,
            price,
            quantity: 1,
            measure_unit,
            image_url,
          }),
        );

        console.log('inside ADD_TO_CART_INTENT ', productsToBeAdded);
        const isItemAdded = await addToCart({
          userId,
          productsToBeAdded,
        });
        console.log('isItemAdded', isItemAdded);
        if (isItemAdded) {
          responseObject = {
            fulfillmentMessages: [
              {
                payload: {
                  facebook: {
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'button',
                        text: 'Added to cart',
                        buttons: [
                          {
                            type: 'postback',
                            payload: 'View Cart',
                            title: 'View Cart',
                          },
                          {
                            type: 'postback',
                            payload: `show categories`,
                            title: `See all categories`,
                          },
                        ],
                      },
                    },
                    quick_replies: [
                      {
                        content_type: 'text',
                        title: 'Place order',
                        payload: 'Place order',
                      },
                      {
                        content_type: 'text',
                        payload: `View products by ${subCategoryName}`,
                        title: `See ${categoryName}`,
                      },
                      {
                        content_type: 'text',
                        payload: `View products by ${subCategoryName}`,
                        title: `See ${subCategoryName}`,
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
        const transactionId = get(cart[0], 'id', 11111);
        let productDetails = get(cart[0], 'cart_info.product_details', []);
        console.log('inside view cart', cart);
        if (productDetails.length === 0) {
          // no cart for user
          responseObject = emptyCartFallbackResponse();
          break;
        }
        productDetails = productDetails.map((item) => {
          const {
            product_name,
            image_url,
            price,
            quantity,
            measure_unit,
          } = item;
          return {
            title: product_name,
            subtitle: `${quantity} ${measure_unit}`,
            image_url,
            price: price.toFixed(2),
            currency: 'INR',
          };
        });
        const totalPrice = calculateTotalPrice(productDetails);
        const userContext = await getUserDetails(request);
        console.log('userContext ', userContext);
        const { first_name: firstName, last_name: lastName } = userContext;
        // responseObject = constructCardResponse(productDetails);
        const receiptTemplate = {
          type: 'template',
          payload: {
            template_type: 'receipt',
            recipient_name: `${firstName} ${lastName}`,
            order_number: `${transactionId}`,
            currency: 'INR',
            payment_method: 'Not Paid yet',
            summary: {
              total_cost: totalPrice.toFixed(2),
            },
            elements: productDetails,
          },
        };

        responseObject = {
          fulfillmentMessages: [
            {
              payload: {
                facebook: {
                  attachment: receiptTemplate,
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
      case SHOW_OLD_ORDER_INTENT: {
        const cart = await getPreviousOrderInfo(userId);
        if (cart.length === 0) {
          const customText = "Sorry,you don't have any history of order";
          responseObject = emptyCartFallbackResponse(customText);
          break;
        }
        const transactionId = get(cart[0], 'id', '11111');
        let productDetails = get(cart[0], 'cart_info.product_details', []);
        productDetails = productDetails.map((item) => {
          const {
            product_name,
            image_url,
            price,
            quantity,
            measure_unit,
          } = item;
          return {
            title: product_name,
            subtitle: `${quantity} ${measure_unit}`,
            image_url,
            price: price.toFixed(2),
            currency: 'INR',
          };
        });
        const totalPrice = calculateTotalPrice(productDetails);
        let orderPlacedOn = get(cart[0], 'updated_at', null);
        orderPlacedOn = orderPlacedOn
          ? new Date(orderPlacedOn).getTime() / 1000
          : null;

        const userContext = await getUserDetails(request);
        const { first_name: firstName, last_name: lastName } = userContext;
        responseObject = constructCardResponse(productDetails, platform);
        const receiptTemplate = {
          type: 'template',
          payload: {
            template_type: 'receipt',
            recipient_name: `${firstName} ${lastName}`,
            order_number: `${transactionId}`,
            currency: 'INR',
            payment_method: 'Not Paid yet',
            ...(orderPlacedOn && { timestamp: orderPlacedOn }),
            summary: {
              total_cost: totalPrice.toFixed(2),
            },
            elements: productDetails,
          },
        };

        responseObject = {
          fulfillmentMessages: [
            {
              payload: {
                facebook: {
                  attachment: receiptTemplate,
                  quick_replies: [
                    {
                      content_type: 'text',
                      title: 'Repeat this order',
                      payload: `Repeat previous order`,
                    },
                    {
                      content_type: 'text',
                      title: 'Show categories',
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
      case REPEAT_PREVIOUS_ORDER_INTENT: {
        const previousCartDetails = await getPreviousOrderInfo(userId);
        if (previousCartDetails.length === 0) {
          responseObject = emptyCartFallbackResponse(
            `Sorry,you don't have any history of order`,
          );
          break;
        }
        const currentCart = await selectCartInfoUsingSessionId(userId);
        const currentTransactionId = get(currentCart[0], 'id', '11111');
        console.log(
          'currentTransactionId',
          currentTransactionId,
          currentCart,
          previousCartDetails,
        );

        const previousCartInfo = {
          product_details: get(
            previousCartDetails[0],
            'cart_info.product_details',
            [],
          ),
        };
        await reorderQuery({
          userId,
          cartInfo: previousCartInfo,
        });

        const id = createTransactionId();
        await createEmptyCart({
          userId,
          previousTransactionId: currentTransactionId,
          newTransactionId: id,
        });
        responseObject = constructTextResponse(
          'Thank you for shopping with us. Your order has been placed successfully.' +
            '\n\nIt will be delivered at your doorstep by the end of the day. Hoping to see you again.',
        );

        break;
      }
      case PLACE_ORDER_INTENT: {
        const cart = await selectCartInfoUsingSessionId(userId);
        const currentTransactionId = get(cart[0], 'id', 11111);
        // check for products availability

        const cartProducts = get(cart[0], 'cart_info.product_details', []);
        console.log('cartInfo', cartProducts);
        const stockProducts = await getStockWithProductName(cartProducts);
        console.log('stockData', stockProducts);
        let availableProducts = [];
        let notAvailableProducts = [];
        for (let item = 0, len = cartProducts.length; item < len; item += 1) {
          for (let j = 0; j < stockProducts.length; j += 1) {
            if (cartProducts[item].product_name === stockProducts[j].name) {
              console.log(
                'cartProducts[item]',
                cartProducts[item],
                '---stockProducts[j]',
                stockProducts[j],
                item,
                j,
              );
              if (cartProducts[item].quantity <= stockProducts[j].quantity) {
                availableProducts.push(cartProducts[item]);
              } else {
                notAvailableProducts.push(cartProducts[item]);
              }
            }
          }
        }
        console.log('availableProducts', availableProducts);
        console.log('notAvailableProducts', notAvailableProducts);
        console.log('queryText', queryText === 'Yes , Place order');
        let isPlaceOrder = false;
        if (queryText === 'Yes , Place order') {
          isPlaceOrder = true;
        } else if (queryText === 'No , remove and place order') {
          await removeFromCart({
            userId,
            productsToBeRemoved: notAvailableProducts,
          });
          isPlaceOrder = true;
        }
        if (notAvailableProducts.length > 0 && !isPlaceOrder) {
          const formattedProducts = notAvailableProducts.map((product) => ({
            title: product.product_name,
            image_url: product.image_url,
            subtitle: 'Out of stock',
          }));
          responseObject = constructCardResponse(formattedProducts, platform);
          responseObject = {
            fulfillmentMessages: [
              {
                text: {
                  text: [
                    'Sry,below products are out of stock',
                    'Placing order with out of stock products may take longer time to deliver',
                  ],
                },
              },
              {
                payload: {
                  facebook: {
                    attachment: get(
                      responseObject,
                      'fulfillmentMessages[0].payload.facebook.attachment',
                      {},
                    ),
                    // text: {
                    //   text: ['Some products are not available'],
                    // },
                    quick_replies: [
                      {
                        content_type: 'text',
                        title: 'Its ok,place order',
                        payload: `Yes , Place order`,
                      },
                      {
                        content_type: 'text',
                        title: 'No,place order without those products',
                        payload: 'No , remove and place order',
                      },
                    ],
                  },
                  platform: 'FACEBOOK',
                },
              },
            ],
          };
        } else {
          console.log('availableProducts', availableProducts);
          console.log('notAvailableProducts', notAvailableProducts);
          await placeOrder(currentTransactionId);
          const id = createTransactionId();
          await createEmptyCart({
            userId,
            previousTransactionId: currentTransactionId,
            newTransactionId: id,
          });

          // reduce the stock count
          responseObject = constructTextResponse(
            'Thank you for shopping with us. Your order has been placed successfully.' +
              '\nIt will be delivered at your doorstep by the end of the day. Hoping to see you again.',
          );
          // await sendEmail();

          // responseObject = constructTextResponse(
          //   'Thank you for shopping with us. Your order has been placed successfully.' +
          //     '\nIt will be delivered at your doorstep by the end of the day. Hoping to see you again.',
          // );
        }
        // client.messages
        //   .create({
        //     body:
        //       'New order received. Order No: 1, Customer name: Mr. Ganesh, Order amount: Rs.360, Delivery date: 24-03-2020',
        //     from: '+17818053520',
        //     to: '+91 80956 11119',
        //   })
        //   .then(message => console.log('sent!'));

        // const message = await sendEmail();
        // console.log('message', message);
        break;
      }
      default: {
        responseObject = constructTextResponse('Pardon come again');
      }
    }
  } catch (err) {
    console.log('Caught error :', err);
    responseObject = constructTextResponse('Oops,something went wrong');
  }
  return responseObject;
};
export default resolveIntent;

import requestWrapper from './requestWrapper';
import responseParser from './responseParser';
import { USER_PROFILE_GRAPH_API_FB_ENDPOINT } from './urls';
import { PAGE_ACCESS_TOKEN } from './credentials';
import { postgreSqlConnection } from '../connectors/config';
import {
  insertIntoTransactionInfo,
  selectCartInfoUsingSessionId,
  updateCartInfoBySessionId,
  getCategories,
  getSubCategoriesByCategories,
  getProductsByCategories,
  getProductsBySubCategories,
} from '../queries';

export const addOrUpdateUser = async userContext => {
  try {
    console.log('userId => ' + userContext.id);
    let result = await postgreSqlConnection.getById('users', userContext.id);

    let firstName = get(userContext, 'first_name');
    let lastName = get(userContext, 'last_name');
    let gender = get(userContext, 'gender');
    let userId = get(userContext, 'id');
    let sessionId = get(userContext, 'id');
    let userObject = {
      id: userId,
      first_name: firstName,
      last_name: lastName,
      gender: gender,
      session_id: sessionId,
    };

    if (result) {
      result = await postgreSqlConnection.updateById(
        'users',
        userContext.id,
        userObject,
      );
      console.log('inside user if==>', result);
    } else {
      result = await postgreSqlConnection.insert('users', userObject);
      console.log('inside user else==>', result);
    }
    return true; //JSON.parse(result);
  } catch (e) {
    console.log(e);
  }
};
const calculateTotalPrice = products => {
  let totalPrice = 0;
  products.map(product => (totalPrice += parseInt(product.price, 10)));
  return totalPrice;
};
const updateProductDetails = ({
  productsInCart,
  oldProductDetails,
  productsToBeAdded,
}) => {
  let updatedProductDetails = [...oldProductDetails];
  for (let i = 0, len = productsToBeAdded.length; i < len; i += 1) {
    const { product_name } = productsToBeAdded[i];
    let isExist = productsInCart.includes(product_name);
    if (isExist) {
      // item is available in cart =>>>>> need to update item details like quantity, price ,etc ...
      const index = productsInCart.findIndex(item => item === product_name);
      updatedProductDetails[index] = {
        ...oldProductDetails[index],
        quantity:
          oldProductDetails[index].quantity + productsToBeAdded[i].quantity,
        price:
          parseInt(oldProductDetails[index].price, 10) +
          parseInt(productsToBeAdded[i].price, 10),
      };
    } else {
      // item is not already available =>>>>> push it to the existing cart
      updatedProductDetails.push(productsToBeAdded[i]);
    }
    console.log('updatedProductDetails ----->', updatedProductDetails);
    return updatedProductDetails;
  }
};
export const addToCart = async ({ userId = null, productsToBeAdded }) => {
  try {
    console.log('started -> add to cart helper', userId);
    if (!userId) {
      console.log('add to cart helper -> userId is null');
      return false;
    }

    // before adding to cart need to check already exiting cart or not
    const userCartInfo = await selectCartInfoUsingSessionId(userId);
    if (userCartInfo.length === 1) {
      // if active cart already existing then update the existing cart with new Items
      console.log('add to cart helper -> active cart existed', userCartInfo);

      const oldProductDetails = get(
        userCartInfo[0],
        'cart_info.product_details',
        [],
      );

      const productsInCart = oldProductDetails.map(
        product => product.product_name,
      );
      const updatedCartInfo = updateProductDetails({
        productsInCart,
        oldProductDetails,
        productsToBeAdded,
      });
      console.log(
        'inside View cart -> active cart logic',
        userCartInfo,
        productsInCart,
        updatedCartInfo,
      );
      const totalPrice = calculateTotalPrice(updatedCartInfo);
      const response = await updateCartInfoBySessionId({
        sessionId: userId,
        totalPrice,
        cartInfo: {
          product_details: updatedCartInfo,
        },
      });
      console.log('response from add to cart updation', response);
    } else {
      // else create a new cart and make it as active
      console.log('add to cart helper -> new cart creation');

      var min = 100000;
      const id = (Math.random() * min + min).toFixed(0);
      const totalPrice = calculateTotalPrice(productsToBeAdded);

      const transactionObject = {
        sessionId: userId,
        id,
        totalPrice,
        cartInfo: {
          product_details: productsToBeAdded,
        },
      };
      const response = await insertIntoTransactionInfo(transactionObject);
      console.log('response from add to cart insertion', response);
    }
    return true;
  } catch (err) {
    console.log('error inside add to cart helper', err);
  }
};
export const constructTextResponse = textResponse => {
  const response = {
    fulfillmentText: 'displayed&spoken response',
    fulfillmentMessages: [
      {
        text: {
          text: [`${textResponse}`],
        },
      },
    ],
    source: 'example.com',
    payload: {
      google: {
        expectUserResponse: true,
        richResponse: {
          items: [
            {
              simpleResponse: {
                textToSpeech: `${textResponse}`,
              },
            },
          ],
        },
      },
      facebook: {
        text: `${textResponse}`,
      },
      slack: {
        text: 'This is a text response for Slack.',
      },
    },
  };
  return response;
};
export function constructCardResponse(cards) {
  let newCards = [];
  cards.map(eachCard => {
    return newCards.push({
      ...(eachCard.image_url && { image_url: eachCard.image_url }),
      ...(eachCard.title && { title: eachCard.title }),
      ...(eachCard.subtitle && { subtitle: eachCard.subtitle }),
      ...(eachCard.showCustomButtons && {
        buttons: eachCard.buttons,
      }),
    });
  });
  const response = {
    fulfillmentMessages: [
      {
        payload: {
          facebook: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: newCards,
              },
            },
          },
        },
        platform: 'FACEBOOK',
      },
    ],

    // outputContexts: [
    //   {
    //     name: `${sessionId}/contexts/awaiting_category_selection`,
    //     lifespanCount: 1,
    //     parameters: {
    //       selected_category: 'nuts',
    //     },
    //   },
    // ],
  };
  return response;
}
export const getAllCategories = async () => {
  console.log('session ---> ', sessionId);

  let categories = await getCategories();
  console.log('categories ----> ', JSON.stringify(categories));
  const formattedCategories = categories.map(category => {
    return {
      title: category.name,
      image_url: category.image_url,
      showCustomButtons: true,
      buttons: [
        {
          type: 'postback',
          payload: `View Subcategories by ${category.name}`,
          title: 'View Subcategories',
        },
        {
          type: 'postback',
          payload: `View Products by ${category.name}`,
          title: 'View Products',
        },
      ],
    };
  });
  return formattedCategories;
};
export const getAllSubCategories = async ({ categoryName = '' }) => {
  console.log('session ---> ', sessionId);

  let subCategories = await getSubCategoriesByCategories({ categoryName });
  console.log('categories ----> ', JSON.stringify(subCategories));
  const formattedSubCategories = subCategories.map(subCategory => {
    return {
      title: subCategory.name,
      image_url: subCategory.image_url,
      showCustomButtons: true,
      buttons: [
        {
          type: 'postback',
          payload: `View Products by ${subCategory.name}`,
          title: 'View Products',
        },
      ],
    };
  });
  return formattedSubCategories;
};
export const getAllProducts = async ({
  categoryName = '',
  subCategoryName = '',
}) => {
  let products = [];
  console.log('inside getAllProducts', categoryName, subCategoryName);
  if (categoryName) {
    console.log('inside getAllProducts -----> if', categoryName);

    products = await getProductsByCategories({ categoryName });
  } else if (subCategoryName) {
    console.log('inside getAllProducts -----> else', subCategoryName);

    products = await getProductsBySubCategories({ subCategoryName });
  }
  console.log('inside getAllProducts -----> products', products);
  const formattedProducts = products.map(product => {
    return {
      title: product.name,
      image_url: product.image_url,
      showCustomButtons: true,
      buttons: [
        {
          type: 'postback',
          payload: `Add ${product.name} to cart`,
          title: 'Add to cart',
        },
      ],
    };
  });
  console.log(
    'inside getAllProducts -----> formattedProducts',
    formattedProducts,
  );

  return formattedProducts;
};

// export const productsBasedOnCategory = category => {
//   const products = {
//     Chocolate: [
//       {
//         showCustomButtons: true,
//         name: 'Dark chocolate',
//         subtitle: 'Rs.200/kg',
//         image_url:
//           'https://www.lakechamplainchocolates.com/media/catalog/product/cache/05ca0152a64ac00c4063b513bbd4a7c7/d/a/dark-chocolate-caramels_7.jpg',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add Dark Chocolate to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for Dark Chocolate',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//       {
//         showCustomButtons: true,
//         name: 'White chocolate',
//         subtitle: 'Rs.150/kg',
//         image_url:
//           'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTWHeUTG-v_iKg9xrC3tBem4x0V0BfIh69kxSxJFFyFV0pwmobO',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add White Chocolate to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for White Chocolate',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//     ],

//     Nuts: [
//       {
//         showCustomButtons: true,
//         name: 'Badam',
//         subtitle: 'Rs.700/kg',
//         image_url:
//           'https://statics.sportskeeda.com/editor/2018/07/15e03-1531709674-800.jpg',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add Badam to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for Badam',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//       {
//         showCustomButtons: true,
//         name: 'Pista',
//         subtitle: 'Rs.350/kg',
//         image_url:
//           'https://images-na.ssl-images-amazon.com/images/I/91h8Y4yEYOL._SL1500_.jpg',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add Pista to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for Pista',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//     ],

//     Cooking: [
//       {
//         showCustomButtons: true,
//         name: 'Aachi sambar powder',
//         subtitle: 'Rs.20/piece',
//         image_url:
//           'https://5.imimg.com/data5/MK/WB/MY-13576389/aachi-sambar-powder-500x500.png',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add Aachi Sambar powder to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for Aachi Sambar powder',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//       {
//         showCustomButtons: true,
//         name: 'Maggie',
//         subtitle: 'Rs.10/piece',
//         image_url:
//           'https://www.nestle.in/sites/g/files/pydnoa451/files/styles/brand_image/public/1_newmaggipackshot_inner2017_0.jpg?itok=sBN9ehVa',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add Maggie to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for Maggie',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//       {
//         showCustomButtons: true,
//         name: 'Tata Sala',
//         subtitle: 'Rs.10/piece',
//         image_url: 'https://mynewsfit.com/wp-content/uploads/2019/08/Salt.png',
//         buttons: [
//           {
//             type: 'postback',
//             payload: 'Add Tata salt to cart',
//             title: 'Add to cart',
//           },
//           {
//             type: 'postback',
//             payload: 'Select Quantity for Tata salt',
//             title: 'Select Quantity',
//           },
//         ],
//       },
//     ],
//   };

//   return constructCardResponse(products[category]);
// };
export const get = (from, selector, defaultVal) => {
  const value = selector
    .replace(/\[([^[\]]*)\]/g, '.$1.')
    .split('.')
    .filter(t => t !== '')
    .reduce((prev, cur) => prev && prev[cur], from);
  return value === undefined || value === null ? defaultVal : value;
};

export const getUserDetails = async req => {
  let userContext = {};
  let senderInfo = get(req, 'body.originalDetectIntentRequest', '');
  console.log('senderinfo ==> ' + senderInfo);
  if (senderInfo) {
    const senderId = get(senderInfo, 'payload.data.sender.id');
    // TODO fetch user data from db before inserting into it
    if (senderId) {
      // if senderId is available fetch user data from fb graph api
      const url = USER_PROFILE_GRAPH_API_FB_ENDPOINT.replace(
        'SENDER_ID',
        senderId,
      ).replace('PAGE_ACCESS_TOKEN', PAGE_ACCESS_TOKEN);
      const response = await requestWrapper({
        method: 'get',
        url,
      });
      userContext = responseParser(response);
      console.log('user data', userContext);
      // TODO : need to insert user data into db
    }
    return userContext;
  }
};
export const getUserIdFromRequest = req => {
  let senderInfo = get(req, 'body.originalDetectIntentRequest', '');
  let senderId = null;
  if (senderInfo) {
    senderId = get(senderInfo, 'payload.data.sender.id');
  }
  return senderId;
};

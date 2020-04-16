import nodeMailer from 'nodemailer';
import requestWrapper from './requestWrapper';
import responseParser from './responseParser';
import { USER_PROFILE_GRAPH_API_FB_ENDPOINT } from './urls';
import {
  PAGE_ACCESS_TOKEN,
  GMAIL_SENDER_CREDENTIALS,
  GMAIL_RECIEVERS_LIST,
} from './credentials';
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
export const calculateTotalPrice = products => {
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

      const id = createTransactionId();
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
export const getAllCategories = async () => {
  console.log('session ---> ', sessionId);

  let categories = await getCategories();
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
  if (categoryName) {
    products = await getProductsByCategories({ categoryName });
  } else if (subCategoryName) {
    products = await getProductsBySubCategories({ subCategoryName });
  }
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
  return formattedProducts;
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
export function constructCardResponse(cards, platform = 'FACEBOOK') {
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
        platform: platform,
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
export const sendEmail = async () => {
  const { username = null, password = null } = GMAIL_SENDER_CREDENTIALS;
  const receivers = GMAIL_RECIEVERS_LIST.join(',');
  if (username && password) {
    let transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: username,
        pass: password,
      },
    });
    // please turn on allow less secure apps in your gmail setting
    let info = await transporter.sendMail({
      from: 'SupermarketBot', // sender address
      to: `${receivers}`, // list of receivers
      subject: 'Hello', // Subject line
      text: 'Hello from supermarket bot', // plain text body
    });

    console.log('Email sent successfully');
    return new Promise(resolve => {
      resolve(info.messageId);
    });
  }
};
export const createEmptyCart = async ({
  userId,
  previousTransactionId,
  newTransactionId,
}) => {
  const transactionObject = {
    sessionId: userId,
    id: newTransactionId,
    totalPrice: 0,
    cartInfo: {
      product_details: [],
    },
    previousOrderId: previousTransactionId,
  };
  await insertIntoTransactionInfo(transactionObject); // creating a new cart with previous order id
  return true;
};
export const createTransactionId = () => {
  const min = 100000;
  const transactionId = (Math.random() * min + min).toFixed(0);
  return transactionId;
};
export const emptyCartFallbackResponse = (customText = null) => {
  return {
    fulfillmentMessages: [
      {
        payload: {
          facebook: {
            text: customText ? customText : `Sorry,you don't have any cart`,
            quick_replies: [
              {
                content_type: 'text',
                title: 'See categories',
                payload: 'Show categories',
              },
            ],
          },
          platform: 'FACEBOOK',
        },
      },
    ],
  };
};

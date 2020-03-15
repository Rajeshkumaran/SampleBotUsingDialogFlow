import requestWrapper from './requestWrapper';
import responseParser from './responseParser';
import { USER_PROFILE_GRAPH_API_FB_ENDPOINT } from './urls';
import { PAGE_ACCESS_TOKEN } from './credentials';
import PgConnection from 'postgresql-easy';
export const pg = new PgConnection({
  user: 'ggpmgzoswemare',
  host: 'ec2-34-206-252-187.compute-1.amazonaws.com',
  database: 'd94f7otd3e40nn',
  password: 'c08b7cd425e121261d35a05471cd71a0664b5e8fc45596a9b12d0814d7b12bb2',
  port: 5432,
});

async function getAllProducts() {
  // const mockProducts = [
  //   {
  //     buttonText: 'View more on chocolate',
  //     name: 'Chocolate Products',
  //     image_url:
  //       'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQZfUFpW1oTHXalXj7cks0VGsyWVonX9pIeldn5G7ygQUVNNwxp',
  //     description:
  //       'A chocolate bar or candy bar is a confection in an oblong or rectangular form containing chocolate, which may also contain layerings or mixtures that include nuts, fruit, caramel, nougat, and wafers.',
  //   },
  //   {
  //     buttonText: 'View more on cooking',
  //     name: 'Cooking Products',
  //     image_url:
  //       'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTxDv2g8U3W0H6om3lODWn40v7xxdp7BXaflartzlMjTAh5cTGd',
  //     description:
  //       'Dried Fruits, Nuts & Seeds. Nuts & Seeds. Dried Fruits. Coffee, Tea & Beverages. Tea. Coffee & Espresso. Rice, Flour & Pulses. Flours. Cooking & Baking Supplies. Spices & Masalas. Ready To Eat & Cook. Instant Snacks & Breakfast Mixes. Snack Foods. Biscuits & Cookies. Cereal & Muesli. Oats & Porridge. Sweets, Chocolate ..',
  //   },
  //   {
  //     buttonText: 'View more on nuts',
  //     name: 'Nut Products',
  //     image_url:
  //       'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQjqbVnQfqqdxfFTXyP8DUmVQzrBKWxX8MpdR9Mj0M2duMg8ifh',
  //     description:
  //       'Oats (Avena sativa) are a cereal commonly eaten in the form of oatmeal or rolled oats. According to some research, they may have a range of potential health benefits.',
  //   },
  // ];
  // return constructCardResponse(mockProducts);
  return new Promise((resolve, reject) =>
    pool.query('SELECT * FROM categories ORDER BY name', (error, results) => {
      if (error) {
        throw error;
      }
      console.log('DB Results ==> ' + JSON.stringify(results.rows));
      var jsonResult = JSON.stringify(results.rows);
      resolve(constructCardResponse(JSON.parse(jsonResult)));
    }),
  );
}

export const addOrUpdateUser = async userContext => {
  try {
    console.log('userId => ' + userContext.id);
    let result = await pg.getById('users', userContext.id);

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
      result = await pg.updateById('users', userContext.id, userObject);
      console.log('inside user if==>', result);
    } else {
      result = await pg.insert('users', userObject);
      console.log('inside user else==>', result);
    }
    return true; //JSON.parse(result);
  } catch (e) {
    console.log(e);
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
      title: eachCard.name,
      image_url: eachCard.image_url,
      ...(eachCard.subtitle && { subtitle: eachCard.subtitle }),
      ...(eachCard.showCustomButtons
        ? {
            buttons: eachCard.buttons,
          }
        : {
            buttons: [
              {
                type: 'postback',
                payload: `View more on ${eachCard.name}`,
                title: 'View More',
              },
            ],
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
export const constructProductCatalog = async () => {
  console.log('session ---> ', sessionId);

  let products = await getAllProducts();
  console.log('products ----> ', JSON.stringify(products));
  return products;
};
export const productsBasedOnCategory = category => {
  const products = {
    Chocolate: [
      {
        showCustomButtons: true,
        name: 'Dark chocolate',
        subtitle: 'Rs.200/kg',
        image_url:
          'https://www.lakechamplainchocolates.com/media/catalog/product/cache/05ca0152a64ac00c4063b513bbd4a7c7/d/a/dark-chocolate-caramels_7.jpg',
        buttons: [
          {
            type: 'postback',
            payload: 'Add Dark Chocolate to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for Dark Chocolate',
            title: 'Select Quantity',
          },
        ],
      },
      {
        showCustomButtons: true,
        name: 'White chocolate',
        subtitle: 'Rs.150/kg',
        image_url:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTWHeUTG-v_iKg9xrC3tBem4x0V0BfIh69kxSxJFFyFV0pwmobO',
        buttons: [
          {
            type: 'postback',
            payload: 'Add White Chocolate to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for White Chocolate',
            title: 'Select Quantity',
          },
        ],
      },
    ],

    Nuts: [
      {
        showCustomButtons: true,
        name: 'Badam',
        subtitle: 'Rs.700/kg',
        image_url:
          'https://statics.sportskeeda.com/editor/2018/07/15e03-1531709674-800.jpg',
        buttons: [
          {
            type: 'postback',
            payload: 'Add Badam to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for Badam',
            title: 'Select Quantity',
          },
        ],
      },
      {
        showCustomButtons: true,
        name: 'Pista',
        subtitle: 'Rs.350/kg',
        image_url:
          'https://images-na.ssl-images-amazon.com/images/I/91h8Y4yEYOL._SL1500_.jpg',
        buttons: [
          {
            type: 'postback',
            payload: 'Add Pista to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for Pista',
            title: 'Select Quantity',
          },
        ],
      },
    ],

    Cooking: [
      {
        showCustomButtons: true,
        name: 'Aachi sambar powder',
        subtitle: 'Rs.20/piece',
        image_url:
          'https://5.imimg.com/data5/MK/WB/MY-13576389/aachi-sambar-powder-500x500.png',
        buttons: [
          {
            type: 'postback',
            payload: 'Add Aachi Sambar powder to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for Aachi Sambar powder',
            title: 'Select Quantity',
          },
        ],
      },
      {
        showCustomButtons: true,
        name: 'Maggie',
        subtitle: 'Rs.10/piece',
        image_url:
          'https://www.nestle.in/sites/g/files/pydnoa451/files/styles/brand_image/public/1_newmaggipackshot_inner2017_0.jpg?itok=sBN9ehVa',
        buttons: [
          {
            type: 'postback',
            payload: 'Add Maggie to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for Maggie',
            title: 'Select Quantity',
          },
        ],
      },
      {
        showCustomButtons: true,
        name: 'Tata Sala',
        subtitle: 'Rs.10/piece',
        image_url: 'https://mynewsfit.com/wp-content/uploads/2019/08/Salt.png',
        buttons: [
          {
            type: 'postback',
            payload: 'Add Tata salt to cart',
            title: 'Add to cart',
          },
          {
            type: 'postback',
            payload: 'Select Quantity for Tata salt',
            title: 'Select Quantity',
          },
        ],
      },
    ],
  };

  return constructCardResponse(products[category]);
};
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

import { VIEW_PRODUCT, SHOW_PRODUCT_CATALOG_INTENT } from './constants';

export const Pool = require('pg').Pool;
export const pool = new Pool({
  user: 'ggpmgzoswemare',
  host: 'ec2-34-206-252-187.compute-1.amazonaws.com',
  database: 'd94f7otd3e40nn',
  password: 'c08b7cd425e121261d35a05471cd71a0664b5e8fc45596a9b12d0814d7b12bb2',
  port: 5432,
});

async function getAllProducts() {
  const mockProducts = [
    {
      buttonText: 'View more on chocolate',
      productCategory: 'Chocolate Products',
      categoryImage:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQZfUFpW1oTHXalXj7cks0VGsyWVonX9pIeldn5G7ygQUVNNwxp',
      description:
        'A chocolate bar or candy bar is a confection in an oblong or rectangular form containing chocolate, which may also contain layerings or mixtures that include nuts, fruit, caramel, nougat, and wafers.',
    },
    {
      buttonText: 'View more on cooking',
      productCategory: 'Cooking Products',
      categoryImage:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTxDv2g8U3W0H6om3lODWn40v7xxdp7BXaflartzlMjTAh5cTGd',
      description:
        'Dried Fruits, Nuts & Seeds. Nuts & Seeds. Dried Fruits. Coffee, Tea & Beverages. Tea. Coffee & Espresso. Rice, Flour & Pulses. Flours. Cooking & Baking Supplies. Spices & Masalas. Ready To Eat & Cook. Instant Snacks & Breakfast Mixes. Snack Foods. Biscuits & Cookies. Cereal & Muesli. Oats & Porridge. Sweets, Chocolate ..',
    },
    {
      buttonText: 'View more on nuts',
      productCategory: 'Nut Products',
      categoryImage:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQjqbVnQfqqdxfFTXyP8DUmVQzrBKWxX8MpdR9Mj0M2duMg8ifh',
      description:
        'Oats (Avena sativa) are a cereal commonly eaten in the form of oatmeal or rolled oats. According to some research, they may have a range of potential health benefits.',
    },
  ];
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
function constructCardResponse(cards) {
  console.log('cards ==> ', JSON.stringify(cards));
  let newCards = [];
  cards.map(eachCard => {
    console.log('name==>' + eachCard.name);
    return newCards.push({
      card: {
        title: eachCard.name,
        imageUri: eachCard.image_url,
        buttons: [
          {
            text: 'View More',
          },
        ],
      },
    });
  });
  const response = {
    fulfillmentMessages: newCards,
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
        productCategory: 'Dark chocolate',
        description: 'Rs.200/kg',
        categoryImage:
          'https://www.lakechamplainchocolates.com/media/catalog/product/cache/05ca0152a64ac00c4063b513bbd4a7c7/d/a/dark-chocolate-caramels_7.jpg',
      },
      {
        productCategory: 'White chocolate',
        description: 'Rs.150/kg',
        categoryImage:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcTWHeUTG-v_iKg9xrC3tBem4x0V0BfIh69kxSxJFFyFV0pwmobO',
      },
    ],

    Nut: [
      {
        productCategory: 'Badam',
        description: 'Rs.700/kg',
        categoryImage:
          'https://statics.sportskeeda.com/editor/2018/07/15e03-1531709674-800.jpg',
      },
      {
        productCategory: 'Pista',
        description: 'Rs.350/kg',
        categoryImage:
          'https://images-na.ssl-images-amazon.com/images/I/91h8Y4yEYOL._SL1500_.jpg',
      },
    ],

    Cooking: [
      {
        productCategory: 'Aachi sambar powder',
        description: 'Rs.20/piece',
        categoryImage:
          'https://5.imimg.com/data5/MK/WB/MY-13576389/aachi-sambar-powder-500x500.png',
      },
      {
        productCategory: 'Maggie',
        description: 'Rs.10/piece',
        categoryImage:
          'https://www.nestle.in/sites/g/files/pydnoa451/files/styles/brand_image/public/1_newmaggipackshot_inner2017_0.jpg?itok=sBN9ehVa',
      },
      {
        productCategory: 'Tata Sala',
        description: 'Rs.10/piece',
        categoryImage:
          'https://mynewsfit.com/wp-content/uploads/2019/08/Salt.png',
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
export const resolveIntent = async ({ intentName = '', parameters = {} }) => {
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

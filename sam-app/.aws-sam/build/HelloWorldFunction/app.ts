import { APIGatewayEvent, Callback, Context } from "aws-lambda";
const AWS = require("aws-sdk");

type Card = {
  name: string;
  feePercentage: number;
  feeAmount: number;
  interestRate: number;
  promoPeriod: number;
  promoInterest: number;
  anchorLink: string;
  title: string;
  image: string;
};

// Creates a new instance of DynamoDB
let dynamodb = new AWS.DynamoDB.DocumentClient();

// Checks if the database is local and passes different options through to the constructor.
if (process.env.AWS_SAM_LOCAL) {
  const awsRegion = process.env.AWS_REGION || "eu-west-1";
  const localEndpoint = "http://docker.for.mac.localhost:8000";
  const options = {
    apiVersion: "2012-08-10",
    endpoint: localEndpoint,
    region: awsRegion,
  };
  const documentClientOptions = {
    service: new AWS.DynamoDB(options),
  };
  dynamodb = new AWS.DynamoDB.DocumentClient(documentClientOptions);
}

// Function to get data
const getAll = async () => {
  /**
   * To get data from the database, we need to use the 'dynamodb' instance we created above
   * All the dynamodb functions follow the same pattern.
   * E.g. await dynamodb.scan(params).promise();
   * This returns a promise, then fulfils it .promise()
   *
   * Using https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#scan-property as a guide retrieve the data
   * And https://techsparx.com/software-development/aws/aws-sdk-promises.html is helpful too.
   *
   * 👀 Remember to use the pattern I showed above
   * 👀 response.Items contains the items we need
   *
   * I have started it for you below.
   * */

  let cards = [];
  // Retrieves the table name set in the template yaml
  const tableName = process.env.Cards_Table;
  const params = {
    TableName: tableName,
  };

  cards = await dynamodb.scan(params).promise();

  return cards;
};

// Helper function to return the cards in a specific order.
const restrictReturn = (cards: { Items: Array<Card> }) => {
  console.log("cards", cards);
  return cards?.Items.map((card) => {
    return {
      name: card.name,
      feePercentage: card.feePercentage,
      feeAmount: card.feeAmount,
      interestRate: card.interestRate,
      promoPeriod: card.promoPeriod,
      promoInterest: card.promoInterest,
      anchorLink: card.anchorLink,
      title: card.title,
      image: card.image,
    };
  });
};

exports.lambdaHandler = async (
  event: APIGatewayEvent,
  context: Context,
  cb: Callback
) => {
  const cards = await getAll();
  const restrictedcards = restrictReturn(cards);
  // Return cards as a JSON
  try {
    return {
      statusCode: 200,
      body: JSON.stringify(restrictedcards),
    };
  } catch (err) {
    console.log(err);
    return err;
  }
};

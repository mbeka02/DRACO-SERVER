import twilio from "twilio";
const twilioSID = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(twilioSID, twilioAuthToken);

const generateTokens = async () => {
  try {
    const tokens = await client.tokens.create();
    console.log(tokens);
    //return tokens;
  } catch (error) {
    console.log(error);
  }
};

export { generateTokens };

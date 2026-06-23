import { connectMongoDB } from "../database/initMongoDb.js";
import { parseKavaItems } from "../parsers/kava.js";
import { parseKontramarkaItems } from "../parsers/kontramarka.js";

export const parseHandler = async () => {
  await connectMongoDB();
  await Promise.all([parseKontramarkaItems(), parseKavaItems()]);

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true }),
  };
};

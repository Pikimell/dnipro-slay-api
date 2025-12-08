import { ctrlWrapper } from '../utils/ctrlWrapper.js';

export const parseHandler = async (event, context) => {
  const ctrl = ctrlWrapper(authControllers.loginController);
  return await ctrl(event, context);
};

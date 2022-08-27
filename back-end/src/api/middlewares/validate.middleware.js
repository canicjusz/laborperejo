import logger from "../../../logger.js";

const validate = (key) => (resourceSchema) => async (req, res, next) => {
  const isJSON = req[key].json;
  let values = req[key].json ?? req[key];
  const resource = isJSON ? JSON.parse(values) : values;
  try {
    if (isJSON) {
      req[key].json = await resourceSchema.validate(resource, {
        stripUnknown: true,
      });
    } else {
      req[key] = await resourceSchema.validate(resource, {
        stripUnknown: true,
      });
    }
    next();
  } catch (e) {
    logger.error("validate", e, values);
    res.status(400).json({ content: e.errors.join(", ") });
  }
};

const validateBody = validate("body");
const validateQuery = validate("query");
const validateParams = validate("params");

export { validateBody, validateQuery, validateParams };

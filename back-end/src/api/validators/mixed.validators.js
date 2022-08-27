import { userID, companyID } from "./shared.js";
import * as yup from "yup";

const userIDAndcompanyIDSchema = yup.object({
  userID: userID,
  companyID: companyID,
});

export { userIDAndcompanyIDSchema };

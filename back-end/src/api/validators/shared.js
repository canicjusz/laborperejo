import * as yup from "yup";
const userID = yup
  .number()
  .typeError("Identigilo de la uzanto estu numero.")
  .positive("Identigilo estu pozitiva.")
  .integer("Identigilo estu entjero.")
  .required("Mankas identigilo de la uzanto en la ligilo");

const companyID = yup
  .number()
  .typeError("Identigilo de la firmao estu numero.")
  .positive("Identigilo estu pozitiva.")
  .integer("Identigilo estu entjero.")
  .required("Mankas identigilo de la uzanto en la ligilo.");

export { userID, companyID };

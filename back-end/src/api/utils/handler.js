export default async (promise, thisArg, ...args) => {
  try {
    const data = await promise.apply(thisArg, args);
    return [data, null];
  } catch (e) {
    return [null, e];
  }
};

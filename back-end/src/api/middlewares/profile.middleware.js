const ownerOnly = (req, res, next) => {
  const { ID: paramsID } = req.params;
  const { ID: sessionID } = req.session;
  const paramEqualsToSession = sessionID === paramsID;
  if (paramEqualsToSession) {
    next();
  } else {
    res.status(401).json({ content: "Vi ne rajtas redakti ĉi tiun profilon." });
  }
};

export { ownerOnly };

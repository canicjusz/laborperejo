import { getAdministratorsByID } from "../services/offer.service.js";
import handler from "../utils/handler.js";

const ownerOnly = async (req, res, next) => {
  const offerID = req.params.offerID;
  const ID = req.session.ID;
  const [offer, error] = await handler(getAdministratorsByID, null, offerID);
  if (error) {
    console.error({ name: "ownerOnlyOffer", error, offerID, ID });
    return res.status(500).json({
      content:
        "Nedefinita servila eraro. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
  if (!offer) {
    return res.status(404).json({ content: "Ĉi tiu paĝo ne ekzistas." });
  }
  const isOwner = offer.company.administrators.some(
    (administrator) => administrator.ID === ID
  );
  if (isOwner) {
    next();
  } else {
    res.status(401).json({ content: "Vi ne rajtas redakti ĉi tiun oferton." });
  }
};

export { ownerOnly };

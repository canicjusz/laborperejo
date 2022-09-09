import "../../env.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  getPasswordByID,
  updatePassword,
  makeVerifiedByEmail,
  getCredentialsByEmail,
  createPasswordToken,
  deletePasswordTokenByID,
  getPasswordTokenByID,
} from "../services/user.service.js";
import { getUserAndProfileByID } from "../services/profile.service.js";
import { createTemplate } from "../services/user.service.js";
import { destroySessions } from "../services/session.service.js";
import handler from "../utils/handler.js";
import prismaPkg from "@prisma/client";
import logger from "../../../logger.js";
const { Prisma } = prismaPkg;
import transporter from "../../nodemailer.js";
const ourEmail = '"Jan Michalak" <oficejo@laborperejo.com>';
const host = process.env.BASE;

const sendConfirmationEmail = async (email) => {
  const token = jwt.sign(
    {
      email,
    },
    process.env.EMAIL_TOKEN_SECRET,
    {
      expiresIn: "2h",
    }
  );
  const url = `${host}/konfirmi-registrigxon/${token}`;
  await transporter.sendMail({
    from: ourEmail,
    to: email,
    subject: "Bonvenon al Laborperejo!",
    html: `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style type="text/css">
      .ExternalClass {
        width: 100%;
      }
    </style>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; margin: 0">
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="width: 600px; background: #f1f1f1"
    >
      <tbody>
        <tr>
          <td
            style="
              text-align: center;
              border-bottom: 1px solid #d7d7d7;
              background: white;
            "
          >
            <img src="https://laborperejo.com/logo.png" />
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="text-align: center; margin: 30px">
              Bonvenon al Laborperejo!
            </h1>
            <p style="margin: 10px">
              Vi povas konfirmi vian registriĝon per la suba butono.
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 10px 0">
            <a
              href="${url}"
              style="
                height: 50px;
                width: 200px;
                background: #1b75bc;
                color: #fff;
                padding: 15px 60px;
                line-height: 50px;
                text-decoration: none;
                border: none;
                border-radius: 30px;
              "
              >Finregistriĝi</a
            >
          </td>
        </tr>
        <tr>
          <td>
            <table
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                width: 100%;
                padding: 10px;
                border-top: 1px solid #d7d7d7;
                background: #ffffff;
                color: #363736;
              "
            >
              <tr>
                <td style="text-align: center; padding-top: 10px">
                  <small>
                    <a style="color: #1b75bc" href="${host}">Laborperejo</a> - farite de Jan
                    Michalak
                  </small>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`,
  });
  return "Farite";
};

const editPassword = async (req, res) => {
  try {
    const { ID: paramsID } = req.params;
    const { curr: currPassword, new: newPassword } = req.body;
    const [user, error] = await handler(getPasswordByID, null, paramsID);
    if (error) {
      throw error;
    }
    if (!user) {
      return res
        .status(400)
        .json({ content: "Uzanto kun ĉi tiu identigilo ne ekzistas." });
    }
    const isPasswordCorrect = await bcrypt.compare(currPassword, user.password);
    if (isPasswordCorrect) {
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await updatePassword(paramsID, hashedNewPassword);
      const sessionID = req.session.id;
      const [, sessionError] = await handler(
        destroySessions,
        null,
        paramsID,
        sessionID
      );
      if (sessionError) {
        logger.error({
          name: "editPassword sessionError",
          error: sessionError,
          ID: paramsID,
        });
        return res
          .status(500)
          .json({ content: "Ni ne povis elsaluti vin el aliaj aparatoj." });
      }
      logger.info(`User ${paramsID} changed their password.`);
      return res.json({ content: "Via pasvorto ĝisdatiĝis" });
    } else {
      return res.status(400).json({ content: "Malĝusta pasvorto." });
    }
  } catch (e) {
    logger.error({
      name: "editPassword misc error",
      error: sessionError,
      ID: req.params.ID,
    });
    res.status(500).json({
      content:
        "Ni ial ne povis ŝanĝi vian pasvorton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const resendConfirmationEmail = async (req, res) => {
  try {
    const email = req.body.email;
    const [credentials, searchError] = await handler(
      getCredentialsByEmail,
      null,
      email
    );
    if (searchError) {
      throw searchError;
    }
    if (!credentials) {
      return res
        .status(400)
        .json({ content: "Uzanto kun ĉi tiu retpoŝtadreso ne ekzistas." });
    }
    if (credentials.confirmed) {
      return res
        .status(400)
        .json({ content: "Uzanto kun ĉi tiu retpoŝtadreso jam registriĝis." });
    }
    const [, sendingError] = await handler(sendConfirmationEmail, null, email);
    if (sendingError) {
      throw sendingError;
    }
    logger.info(`Resent verification email to ${email}.`);
    res.json({
      content: "Ni sendis al vi mesaĝon kun ligilo por fini vian registriĝon.",
    });
  } catch (e) {
    logger.error({
      name: "resendConfirmationEmail misc error",
      error: e,
      email: req.body.email,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis sendi la repoŝtmesaĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const confirmEmail = async (req, res) => {
  try {
    const token = req.body.token;
    jwt.verify(token, process.env.EMAIL_TOKEN_SECRET, async (err, decoded) => {
      try {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res
              .status(400)
              .json({ content: "La konfirmiĝĵetono senvalidiĝis." });
          } else if (err.name === "JsonWebTokenError") {
            return res.status(400).json({
              content:
                "La konfirmiĝĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
            });
          }
          throw err;
        }
        const email = decoded.email;
        const [, verificationError] = await handler(
          makeVerifiedByEmail,
          null,
          email
        );
        if (verificationError) {
          logger.error({
            name: "confirmEmail verificationError",
            error: verificationError,
            email: email,
          });
          return res.status(500).json({
            content:
              "Ni ial ne povis konfirmi la registriĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
          });
        }
        logger.info(`Confirmed ${email}.`);
        res.json({ content: "Via registriĝo konfirmiĝis." });
      } catch (e) {
        logger.error({
          name: "confirmEmail misc error",
          error: e,
          token: req.body.token,
        });
        return res.status(500).json({
          content:
            "Ni ial ne povis konfirmi la registriĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
        });
      }
    });
  } catch (e) {
    logger.error({
      name: "confirmEmail misc error",
      error: e,
      token: req.body.token,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis konfirmi la registriĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const email = req.body.email;
    req.body.password = hashedPassword;
    const [, creationError] = await handler(createTemplate, null, req.body);
    if (creationError) {
      if (
        creationError instanceof Prisma.PrismaClientKnownRequestError &&
        creationError.code === "P2002"
      ) {
        return res
          .status(400)
          .json({ content: "Uzanto kun ĉi tiu retpoŝtadreso jam ekzistas." });
      }
      throw creationError;
    }
    const [, emailError] = await handler(sendConfirmationEmail, null, email);
    if (emailError) {
      logger.error({
        name: "register emailError",
        error: emailError,
        email: email,
      });
      return res.status(500).json({
        content:
          "Ni ial ne povis sendi la repoŝtmesaĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
    logger.info(`Registered ${email}.`);
    res.json({ content: "Vi registriĝis" });
  } catch (e) {
    console.log(e);
    logger.error({
      name: "register misc error",
      error: e,
      email: req.body.email,
    });
    res.status(500).json({
      content:
        "Ni ial ne povis krei la profilon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, saveSession } = req.body;
    const [credentials, error] = await handler(
      getCredentialsByEmail,
      null,
      email
    );
    if (error) throw error;
    if (!credentials) {
      return res
        .status(400)
        .json({ content: "Uzanto kun ĉi tiu retpoŝtadreso ne ekzistas." });
    }
    req.session.cookie.maxAge = saveSession ? 1000 * 60 * 60 * 24 * 90 : null;
    if (credentials.confirmed) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        credentials.password
      );
      if (isPasswordCorrect) {
        const ID = credentials.ID;
        req.session.ID = ID;
        const user = await getUserAndProfileByID(ID);
        res.json(user);
      } else {
        return res.status(400).json({ content: "Malĝusta pasvorto." });
      }
    } else {
      return res.status(403).json({
        content:
          "Unue finu registriĝon per la ligilo sendita al via retpoŝtadreso.",
      });
    }
    logger.info(`Registered ${email}.`);
  } catch (e) {
    logger.error({ name: "login misc error", error: e, email: req.body.email });
    return res.status(500).json({
      content:
        "Ni ial ne povis vin ensalutigi. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const sendPasswordReset = async (req, res) => {
  try {
    const email = req.body.email;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const [token, error] = await handler(
      createPasswordToken,
      null,
      resetTokenHash,
      email
    );
    if (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P2025" || error.code === "P2011")
      ) {
        if (error.code === "P2025") {
          return res
            .status(400)
            .json({ content: "Uzanto kun ĉi tiu retpoŝtadreso ne ekzistas." });
        }
        if (error.code === "P2011") {
          return res.status(422).json({
            content: "La retpoŝtmesaĝo jam estis al vi sendita antaŭe.",
          });
        }
      }
      throw error;
    }
    const user = token.user;
    const urlToken = jwt.sign(
      { token: resetToken },
      process.env.PASSWORD_TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );
    const url = `${host}/restarigi-pasvorton/${user.ID}/${urlToken}`;
    await transporter.sendMail({
      from: ourEmail,
      to: email,
      subject: "Restarigi pasvorton",
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <style type="text/css">
      .ExternalClass {
        width: 100%;
      }
    </style>
  </head>
  <body style="font-family: Arial, Helvetica, sans-serif; margin: 0">
    <table
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="width: 600px; background: #f1f1f1"
    >
      <tbody>
        <tr>
          <td
            style="
              text-align: center;
              border-bottom: 1px solid #d7d7d7;
              background: white;
            "
          >
            <img src="https://laborperejo.com/logo.png" />
          </td>
        </tr>
        <tr>
          <td>
            <h1 style="text-align: center; margin: 30px">
              Peto de pasvortrestarigo
            </h1>
            <p style="margin: 10px">
              Vi petis restarigi la pasvorton de via konto. Vi povas fari ĉi
              tion per la suba butono.
            </p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding: 10px 0">
            <a
              href="${url}"
              style="
                height: 50px;
                width: 200px;
                background: #1b75bc;
                color: #fff;
                padding: 15px 60px;
                line-height: 50px;
                text-decoration: none;
                border: none;
                border-radius: 30px;
              "
              >Restarigi</a
            >
          </td>
        </tr>
        <tr>
          <td>
            <p style="margin: 10px">
              Se vi ne volas restarigi la pasvorton, simple ignoru la mesaĝon
              kaj ne alklaku la butonon. Ĝi senvalidiĝos post 2 horoj.
            </p>
          </td>
        </tr>
        <tr>
          <td>
            <table
              cellpadding="0"
              cellspacing="0"
              border="0"
              style="
                padding: 10px;
                border-top: 1px solid #d7d7d7;
                background: #ffffff;
                color: #363736;
                width: 100%;
              "
            >
              <tr>
                <td style="text-align: center; padding-top: 10px">
                  <small>
                    <a style="color: #1b75bc" href="${host}">Laborperejo</a> - farite de Jan
                    Michalak
                  </small>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`,
    });
    logger.info(`Sent password reset email to ${email}.`);
    res.json({ content: "Ni sendis la mesaĝon kun restarig-ligilon al vi." });
  } catch (e) {
    logger.error({
      name: "sendPasswordReset misc error",
      error: e,
      email: req.body.email,
    });
    return res.status(500).json({
      content:
        "Ni ial ne povis sendi al vi retpoŝtmesaĝon. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

const deleteSession = (req, res) => {
  const ID = req.session.ID;
  req.session.destroy((err) => {
    if (err) {
      logger.error({
        name: "deleteSession misc error",
        error: err,
        ID,
      });
      return res.status(500).json({
        content:
          "Ni ial ne povis vin elsalutigi. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
      });
    }
    logger.info(`Removed session of ${ID}`);
    res.json({ content: "Vi elsalutis." });
  });
};

const passwordReset = async (req, res) => {
  try {
    const { id, token, password } = req.body;

    jwt.verify(
      token,
      process.env.PASSWORD_TOKEN_SECRET,
      async (err, decoded) => {
        try {
          if (err) {
            if (err.name === "TokenExpiredError") {
              return res
                .status(403)
                .json({ content: "La ĵetono senvalidiĝis." });
            } else if (err.name === "JsonWebTokenError") {
              return res.status(400).json({
                content:
                  "La ĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
              });
            }
            throw err;
          }
          const [tokenDB, gettingError] = await handler(
            getPasswordTokenByID,
            null,
            id
          );
          if (gettingError) {
            if (
              gettingError instanceof Prisma.PrismaClientKnownRequestError &&
              gettingError.code === "P2025"
            ) {
              return res
                .status(404)
                .json({ content: "Ĉi tiu ĵetono ne ekzistas." });
            }
            throw deletingError;
          }

          const isValid = await bcrypt.compare(decoded.token, tokenDB.token);
          if (isValid) {
            await deletePasswordTokenByID(id);
            const hashedPassword = await bcrypt.hash(password, 10);
            await updatePassword(id, hashedPassword);
            destroySessions(id);
            logger.info(`Reseted password of ${id}`);
            res.json({ content: "Via pasvorto sukcese ŝanĝiĝis." });
          } else {
            return res.status(400).json({
              content:
                "La ĵetono estas nevalida. Bonvolu kontroli, ĉu vi uzas la ĝustan ligilon.",
            });
          }
        } catch (e) {
          logger.error({
            name: "passwordReset misc error",
            error: e,
            id: req.body.id,
          });
          res.status(500).json({
            content:
              "Ni ial ne povis restarigi vian pasvorton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
          });
        }
      }
    );
  } catch (e) {
    logger.error({
      name: "passwordReset misc error",
      error: e,
      id: req.body.id,
    });
    res.status(500).json({
      content:
        "Ni ial ne povis restarigi vian pasvorton. Bonvolu reprovi poste, aŭ kontaktu nin retpoŝte.",
    });
  }
};

export {
  confirmEmail,
  passwordReset,
  deleteSession,
  sendPasswordReset,
  login,
  register,
  editPassword,
  resendConfirmationEmail,
};

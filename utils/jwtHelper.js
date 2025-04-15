const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { SesiUser } = require("../models");

const generateToken = (user, sessionId) => {
  return jwt.sign(
    {
      userId: user.id_user,
      email: user.email,
      role: user.role,
      sessionId: sessionId,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const createSession = async (user, ipAddress, userAgent) => {
  const sessionId = require("crypto").randomBytes(64).toString("hex");
  const expiredAt = new Date();
  expiredAt.setDate(expiredAt.getDate() + 1); // 1 hari

  await SesiUser.create({
    id_sesi: sessionId,
    id_user: user.id_user,
    token: generateToken(user, sessionId),
    ip_address: ipAddress,
    user_agent: userAgent,
    waktu_expired: expiredAt,
  });

  return sessionId;
};

const invalidateSession = async (sessionId) => {
  await SesiUser.update(
    { is_active: false },
    { where: { id_sesi: sessionId } }
  );
};

module.exports = {
  generateToken,
  createSession,
  invalidateSession,
};

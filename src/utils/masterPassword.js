const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "1234";

function verifyMasterPassword(masterPassword) {
  return typeof masterPassword === "string" && masterPassword.trim() === MASTER_PASSWORD;
}

module.exports = {
  verifyMasterPassword
};

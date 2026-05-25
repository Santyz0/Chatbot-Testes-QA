// dbUtils.js

function criarSessao(db, sessionId) {
  try {
    const stmt = db.prepare('INSERT INTO sessions (id) VALUES (?)');
    stmt.run(sessionId);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = { criarSessao };
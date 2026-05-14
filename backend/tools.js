const tools = {
  getTime: () => new Date().toLocaleString(),
  calculate: (expression) => {
    try { return eval(expression).toString(); }
    catch { return "Erro ao calcular"; }
  }
};

module.exports = tools;
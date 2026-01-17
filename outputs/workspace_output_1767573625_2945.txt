const { JsonDatabase } = require('wio.db');

const General = new JsonDatabase({ databasePath: "./DataBaseJson/config.json" });
const perms = new JsonDatabase({ databasePath: "./DataBaseJson/perms.json" });
const emoji = new JsonDatabase({ databasePath: "./DataBaseJson/emoji.json" });
const produto = new JsonDatabase({ databasePath: "./DataBaseJson/produto.json" });
const tema = new JsonDatabase({ databasePath: "./DataBaseJson/tema.json" });
const saldo = new JsonDatabase({ databasePath: "./DataBaseJson/saldo.json" });
const rankproduto = new JsonDatabase({ databasePath: "./DataBaseJson/rankproduto.json" });
const carrinhos = new JsonDatabase({ databasePath: "./DataBaseJson/carrinhos.json" });
const rank = new JsonDatabase({ databasePath: "./DataBaseJson/rank.json" });
const cupons = new JsonDatabase({ databasePath: "./DataBaseJson/cupons.json" });
const rendimentos = new JsonDatabase({ databasePath: "./DataBaseJson/rendimentos.json" });
const outros = new JsonDatabase({ databasePath: "./DataBaseJson/outros.json" });
const painel = new JsonDatabase({ databasePath: "./DataBaseJson/painel.json" });
const moder = new JsonDatabase({ databasePath: "./DataBaseJson/moder.json" });
const historico = new JsonDatabase({ databasePath: "./DataBaseJson/historico.json" });

module.exports = {
    General,
    perms,
    emoji,
    produto,
    tema,
    saldo,
    rankproduto,
    carrinhos,
    rank,
    cupons,
    rendimentos,
    outros,
    painel,
    moder,
    historico
};

// Sistema de Botões Intercambiáveis
// Quando um botão é selecionado, os outros são removidos
// Sistema de botão "Voltar" global

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { emoji } = require('../Handler/emojis');

/**
 * Cria botões de serviços SMS24H com paginação
 * @param {Array} servicos - Lista de serviços disponíveis
 * @param {Object} precos - Objeto com preços (id: preco)
 * @param {number} margem - Margem de lucro em % (padrão: 15)
 * @param {number} pagina - Página atual (padrão: 0)
 * @param {number} porPagina - Quantos botões por página (padrão: 10)
 */
function criarBotoesServicos(servicos, precos, margem = 15, pagina = 0, porPagina = 10) {
    const buttons = servicos.map(servico => {
        const precoReal = precos[servico.id] || 1.00;
        const precoVenda = (precoReal * (1 + margem / 100)).toFixed(2);
        
        return new ButtonBuilder()
            .setCustomId(`sms_${servico.id}`)
            .setLabel(`${servico.nome} - R$ ${precoVenda}`)
            .setEmoji('📱')
            .setStyle(ButtonStyle.Primary);
    });

    // Calcular total de páginas
    const totalPaginas = Math.ceil(buttons.length / porPagina);
    
    // Garantir que a página atual seja válida
    pagina = Math.max(0, Math.min(pagina, totalPaginas - 1));
    
    // Pegar botões da página atual
    const inicio = pagina * porPagina;
    const fim = inicio + porPagina;
    const botoesPagina = buttons.slice(inicio, fim);
    
    // Dividir em linhas de 5 botões (máximo permitido pelo Discord)
    const rows = [];
    for (let i = 0; i < botoesPagina.length; i += 5) {
        rows.push(new ActionRowBuilder().addComponents(botoesPagina.slice(i, i + 5)));
    }

    // Adicionar linha de navegação (voltar, anterior, próximo)
    const navegacaoRow = new ActionRowBuilder();
    
    // Botão Voltar (sempre presente)
    navegacaoRow.addComponents(
        new ButtonBuilder()
            .setCustomId('voltar')
            .setLabel('⬅️ Voltar')
            .setStyle(ButtonStyle.Secondary)
    );
    
    // Botão Anterior (se não for a primeira página)
    if (pagina > 0) {
        navegacaoRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`pagina_anterior_${pagina}`)
                .setLabel('◀️ Anterior')
                .setStyle(ButtonStyle.Primary)
        );
    } else {
        // Espaço vazio para manter layout
        navegacaoRow.addComponents(
            new ButtonBuilder()
                .setCustomId('placeholder_anterior')
                .setLabel('▫️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
    }
    
    // Indicador de página
    navegacaoRow.addComponents(
        new ButtonBuilder()
            .setCustomId('pagina_info')
            .setLabel(`${pagina + 1}/${totalPaginas}`)
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true)
    );
    
    // Botão Próximo (se não for a última página)
    if (pagina < totalPaginas - 1) {
        navegacaoRow.addComponents(
            new ButtonBuilder()
                .setCustomId(`pagina_proxima_${pagina}`)
                .setLabel('Próximo ▶️')
                .setStyle(ButtonStyle.Primary)
        );
    } else {
        // Espaço vazio para manter layout
        navegacaoRow.addComponents(
            new ButtonBuilder()
                .setCustomId('placeholder_proximo')
                .setLabel('▫️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
        );
    }

    return [...rows, navegacaoRow];
}

/**
 * Cria botões de pagamento
 */
function criarBotoesPagamento() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('pagar_pix')
                .setLabel('💳 Pagar via PIX')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('voltar')
                .setLabel(`${emoji.voltar} Voltar`)
                .setStyle(ButtonStyle.Secondary)
        );
}

/**
 * Cria botões de confirmação
 */
function criarBotoesConfirmacao() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('confirmar_compra')
                .setLabel(`${emoji.sucesso} Confirmar Compra`)
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancelar_compra')
                .setLabel(`${emoji.erro} Cancelar`)
                .setStyle(ButtonStyle.Danger)
        );
}

/**
 * Cria botões de administração no ticket
 */
function criarBotoesAdminTicket() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('admin_fechar_ticket')
                .setLabel('🔒 Fechar Ticket')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('admin_ver_info')
                .setLabel('ℹ️ Ver Informações')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('admin_limpar_ticket')
                .setLabel('🧹 Limpar Ticket')
                .setStyle(ButtonStyle.Secondary)
        );
}

/**
 * Cria botões do menu principal
 */
function criarBotoesMenuPrincipal() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('adquirir')
                .setLabel('🛒 Adquirir Número')
                .setEmoji('🛒')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('info')
                .setLabel('ℹ️ Informações')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('suporte')
                .setLabel('📞 Suporte')
                .setStyle(ButtonStyle.Secondary)
        );
}

/**
 * Atualiza mensagem removendo botões não selecionados
 */
async function atualizarBotoesExclusivos(interaction, customIdSelecionado) {
    const components = interaction.message.components;
    
    // Encontrar a row que contém o botão clicado
    for (const row of components) {
        const buttons = row.components;
        
        // Remover todos os botões exceto o clicado
        const novosBotoes = buttons.filter(btn => btn.data.custom_id === customIdSelecionado);
        
        if (novosBotoes.length > 0) {
            row.components = novosBotoes;
        }
    }
    
    await interaction.update({ components: components });
}

/**
 * Adiciona botão de voltar a qualquer row
 */
function adicionarBotaoVoltar(row) {
    const botaoVoltar = new ButtonBuilder()
        .setCustomId('voltar')
        .setLabel('⬅️ Voltar')
        .setStyle(ButtonStyle.Secondary);
    
    if (row.components.length < 5) {
        row.addComponents(botaoVoltar);
    }
    
    return row;
}

module.exports = {
    criarBotoesServicos,
    criarBotoesPagamento,
    criarBotoesConfirmacao,
    criarBotoesAdminTicket,
    criarBotoesMenuPrincipal,
    atualizarBotoesExclusivos,
    adicionarBotaoVoltar
};
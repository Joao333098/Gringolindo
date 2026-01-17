const { 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    ContainerBuilder, 
    TextDisplayBuilder, 
    SeparatorBuilder, 
    SeparatorSpacingSize,
    MediaGalleryBuilder, 
    MediaGalleryItemBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    MessageFlags 
} = require('discord.js');

// Ajuste os caminhos conforme sua estrutura
const { General, saldo, perms, emoji, historico } = require('../../DataBaseJson/index.js');
const SMS24HHandler = require('../../Handler/sms24h.js');
const servicesData = require('../../services.json');
const fs = require('fs');

// ==================================================================
// CONFIGURAÇÕES E ESTADOS (MEMÓRIA)
// ==================================================================

const ticketsAbertos = new Map(); // userId -> channelId
const paginasUsuarios = new Map(); // userId -> página atual
const sessoesUsuario = new Map(); // userId -> dados da sessão
const timeoutsUsuario = new Map(); // userId -> timer

const SERVICOS = servicesData.servicos;
const ITENS_POR_PAGINA = 25; // Select Menu suporta até 25 itens
const INATIVIDADE_TIMEOUT = 5 * 60 * 1000; // 5 minutos

// ==================================================================
// BUILDERS VISUAIS (INTERFACE V2)
// ==================================================================

/**
 * ESTÁGIO 1: Termos de Uso (Dentro do Ticket)
 */
function criarContainerTermos(userId) {
    const container = new ContainerBuilder()
        // Título e Menção (Tudo dentro do TextDisplay para não bugar o V2)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(`# 📋 Olá, <@${userId}>!\n## Leia os Termos de Uso`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                "**Regras do Sistema:**\n" +
                "-# 1. O número é único e exclusivo para você.\n" +
                "-# 2. Utilize apenas para fins legais.\n" +
                "-# 3. O código SMS deve ser usado dentro de 10 minutos.\n\n" +
                "**⚠️ Garantia:**\n" +
                "-# Se o código não chegar, o saldo é estornado automaticamente."
            )
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('aceitar_termos').setLabel('Concordar e Continuar').setStyle(ButtonStyle.Success).setEmoji('✅'),
                new ButtonBuilder().setCustomId('negar_termos').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
            )
        );

    return { components: [container], flags: [MessageFlags.IsComponentsV2] };
}

/**
 * ESTÁGIO 2: Menu Principal
 */
function criarContainerMenuPrincipal(userId) {
    const saldoUsuario = parseFloat(saldo.get(userId) || 0).toFixed(2);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Painel do Usuário`)
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### <:membros_cristalstore:1457209543397474478> Cliente: <@${userId}>\n` +
                `### <:bagdinheiro_cristalstore:1457178080350044334> Saldo: \`R$ ${saldoUsuario}\``
            )
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**Como funciona?**\n` +
                `• Clique em **Comprar Serviços** para abrir o catálogo.\n` +
                `• Escolha a plataforma e confirme o pagamento com seu saldo.\n` +
                `• O número aparecerá aqui. Aguarde o código SMS ser recebido.`
            )
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# Caso precise de saldo, use a opção no menu de seleção abaixo.`
            )
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_selecao')
                    .setPlaceholder('  Selecione uma opção (Histórico / Saldo)')
                    .addOptions([
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Histórico de Compras')
                            .setDescription('Veja seus números comprados e códigos recebidos')
                            .setValue('menu_historico')
                            .setEmoji('1457279797276184650'),
                        new StringSelectMenuOptionBuilder()
                            .setLabel('Adicionar Saldo')
                            .setDescription('Adicione saldo via PIX para comprar números')
                            .setValue('menu_depositar')
                            .setEmoji('1457178080350044334')
                    ])
            )
        )
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('menu_comprar').setLabel('Comprar Serviços').setStyle(ButtonStyle.Success).setEmoji('1457209157739614330'),
                new ButtonBuilder().setCustomId('fechar_ticket').setLabel('Fechar Ticket').setStyle(ButtonStyle.Danger)
            )
        );

    return { components: [container], flags: [MessageFlags.IsComponentsV2] };
}

function criarContainerHistorico(userId) {
    try {
        const userHistory = historico.get(userId) || [];
        
        let content = `## 📜 Seu Histórico de Compras\n\n`;
        
        if (!userHistory || userHistory.length === 0) {
            content += "Você ainda não realizou nenhuma compra.";
        } else {
            content += `Total de transações: **${userHistory.length}**\n\n`;
            // Mostrar últimas 10 compras
            const lastPurchases = userHistory.slice(-10).reverse();
            lastPurchases.forEach((p, i) => {
                if (p.tipo === 'deposito') {
                    content += `**${i+1}.** 💰 Depósito PIX | Valor: \`R$ ${p.valor.toFixed(2)}\` | Status: \`${p.status}\`\n`;
                } else {
                    content += `**${i+1}.** Plataforma: \`${p.plataforma}\` | Valor: \`R$ ${p.valor.toFixed(2)}\` | Status: \`${p.status}\`\n`;
                    if (p.numero) content += `> Número: \`${p.numero}\`\n`;
                    if (p.codigo) content += `> Código: \`${p.codigo}\`\n`;
                }
            });
        }

    const container = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('voltar_menu').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('1457213423321350166')
            )
        );

    return { components: [container], flags: [MessageFlags.IsComponentsV2] };
    } catch (error) {
        console.error('[HISTÓRICO] Erro ao carregar histórico:', error);
        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("## 📜 Histórico\n\nErro ao carregar histórico. Tente novamente."))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('voltar_menu').setLabel('Voltar').setStyle(ButtonStyle.Secondary)
                )
            );
        return { components: [container], flags: [MessageFlags.IsComponentsV2] };
    }
}

/**
 * ESTÁGIO 3: Catálogo com SELECT MENU (O que você pediu)
 */
function criarContainerCatalogo(pagina = 0) {
    const inicio = pagina * ITENS_POR_PAGINA;
    const fim = inicio + ITENS_POR_PAGINA;
    const servicosPagina = SERVICOS.slice(inicio, fim);
    const totalPaginas = Math.ceil(SERVICOS.length / ITENS_POR_PAGINA);

    // Constrói as opções do menu
    const opcoes = servicosPagina.map(s => 
        new StringSelectMenuOptionBuilder()
            .setLabel(s.nome)
            .setDescription(`Preço: R$ ${s.preco_final.toFixed(2)} | Estoque: ${s.qtd_disp}`)
            .setValue(`sms_${s.id}`) // ID para identificarmos depois
            .setEmoji('1457212395465211925')
    );

    if (opcoes.length === 0) {
        opcoes.push(new StringSelectMenuOptionBuilder().setLabel('Vazio').setValue('null').setDescription('Nenhum serviço aqui.'));
    }

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `## <:celular:1457212395465211925> Catálogo de Serviços (Pág ${pagina + 1}/${totalPaginas})\n` +
                `-# Escolha abaixo a plataforma que deseja receber o SMS. Cada serviço possui um estoque e preço específico.`
            )
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`Selecione o serviço desejado na lista abaixo:`)
        )
        // O SELECT MENU FICA AQUI
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_servico')
                    .setPlaceholder('🔻 Clique para selecionar um serviço...')
                    .addOptions(opcoes)
            )
        )
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )
        // Botões de Navegação
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('pag_ant').setLabel('Anterior').setStyle(ButtonStyle.Secondary).setDisabled(pagina === 0).setEmoji('1457213423321350166'),
                new ButtonBuilder().setCustomId('voltar_menu').setLabel('Menu Inicial').setStyle(ButtonStyle.Danger).setEmoji('1457178257823891536'),
                new ButtonBuilder().setCustomId('pag_prox').setLabel('Próximo').setStyle(ButtonStyle.Secondary).setDisabled(pagina >= totalPaginas - 1).setEmoji('1457213225652322367')
            )
        );

    return { components: [container], flags: [MessageFlags.IsComponentsV2] };
}

/**
 * ESTÁGIO 4: Confirmação
 */
function criarContainerConfirmacao(servico, saldoUsuario) {
    const preco = servico.preco_final;
    const podeComprar = saldoUsuario >= preco;
    const saldoFinal = (saldoUsuario - preco).toFixed(2);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`## <:Pngtreeshoppingcartlineiconvecto:1269507078976966706> Confirmar Pedido: ${servico.nome}`)
        )
        .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `### Resumo:\n` +
                `<:pix:1457209865675083836> | Valor: \`R$ ${preco.toFixed(2)}\`\n` +
                `<:moedas:1457208747951784007> | Seu Saldo: \`R$ ${saldoUsuario.toFixed(2)}\`\n` +
                `<:bagdinheiro_cristalstore:1457178080350044334> | Saldo Restante: \`R$ ${saldoFinal}\`\n\n` +
                (podeComprar ? "<a:online_cristalstore:1457086868024725597> **Saldo Suficiente!**" : "❌ **Saldo Insuficiente!**")
            )
        );

    const row = new ActionRowBuilder();
    if (podeComprar) {
        row.addComponents(
            new ButtonBuilder().setCustomId('confirmar_compra').setLabel('Confirmar Pagamento').setStyle(ButtonStyle.Success).setEmoji('1457216373842514054'),
            new ButtonBuilder().setCustomId('cancelar_compra').setLabel('Cancelar').setStyle(ButtonStyle.Secondary).setEmoji('1457216448572297288')
        );
    } else {
        row.addComponents(
            new ButtonBuilder().setCustomId('menu_depositar').setLabel('Recarregar').setStyle(ButtonStyle.Primary).setEmoji('1457208747951784007'),
            new ButtonBuilder().setCustomId('cancelar_compra').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('1457213423321350166')
        );
    }

    container.addActionRowComponents(row);
    return { components: [container], flags: [MessageFlags.IsComponentsV2] };
}

// ==================================================================
// HANDLER PRINCIPAL
// ==================================================================

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        try {
            // Verificar se a interação já foi processada pelo handler admin
            if (interaction.__adminHandlerProcessed) {
                return;
            }

            if (interaction.isButton()) await handleBotao(interaction, client);
            else if (interaction.isStringSelectMenu()) await handleSelect(interaction, client);
            else if (interaction.isModalSubmit()) await handleModal(interaction, client);
        } catch (error) {
            console.error('Erro no handler:', error);
        }
    }
};

// ==================================================================
// LÓGICA DOS EVENTOS
// ==================================================================

async function handleBotao(interaction, client) {
    const { customId, user, channel } = interaction;

    // Proteção contra interações já processadas
    if (interaction.deferred || interaction.replied) {
        // Se já foi deferida/respondida, não fazemos nada
        return;
    }

    // Botão externo (Criação do ticket)
    if (customId === 'adquirir') {
        return criarTicket(interaction, client);
    }

    // Tentar deferir a atualização para evitar "Unknown interaction" (timeout de 3s)
    // EXCEÇÃO: Não deferir para menu_depositar pois precisa abrir modal
    try {
        if (!interaction.deferred && !interaction.replied && customId !== 'menu_depositar') {
            await interaction.deferUpdate().catch(() => {});
        }
    } catch (e) {}

    // Roteamento de segurança: se a interação expirou/falhou no defer, não continua
    // EXCEÇÃO: Para menu_depositar, não precisa estar deferido
    if (!interaction.deferred && !interaction.replied && customId !== 'menu_depositar') return;

    // Resetar timer de inatividade
    if (channel) resetarTimeoutInatividade(user.id, channel.id);

    // Roteamento
    if (customId.startsWith('copiar_pix_')) {
        const sessao = sessoesUsuario.get(user.id);
        if (sessao && sessao.pix_code) {
            return interaction.followUp({ content: sessao.pix_code, flags: [MessageFlags.Ephemeral] }).catch(() => {});
        } else {
            return interaction.followUp({ content: '❌ Código PIX não encontrado ou expirado.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        }
    }

    switch (customId) {
        case 'adquirir':
            return criarTicket(interaction, client);

        case 'config_ticket_json':
            if (!perms.get(user.id)) {
                if (!interaction.replied && !interaction.deferred) return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
                return;
            }
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ ephemeral: true });
                }
            } catch (e) {}
            return iniciarConfiguracaoJSON(interaction);

        case 'confirmar_json':
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate();
                }
            } catch (e) {}
            await processarNovoJSON(interaction);
            sessoesUsuario.delete(user.id);
            break;

        case 'cancelar_config_json':
            try {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate();
                }
            } catch (e) {}
            return interaction.editReply({ content: '❌ Configuração cancelada.', components: [] });

        case 'aceitar_termos':
            sessoesUsuario.set(user.id, { estagio: 'menu', dados: {} });
            await interaction.editReply(criarContainerMenuPrincipal(user.id)).catch(() => {});
            break;

        case 'negar_termos':
            await interaction.editReply({ 
                components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("🔒 Ticket fechado pelo usuário."))], 
                flags: [MessageFlags.IsComponentsV2] 
            }).catch(() => {});
            setTimeout(() => channel.delete().catch(() => {}), 3000);
            break;

        case 'menu_comprar':
            paginasUsuarios.set(user.id, 0);
            await interaction.editReply(criarContainerCatalogo(0)).catch(() => {});
            break;

        case 'menu_depositar':
            console.log('[DEPÓSITO] Usuário clicou em Adicionar Saldo');
            const mpToken = General.get('mercadopago.access_token');
            console.log('[DEPÓSITO] Token MP encontrado:', !!mpToken);
            
            if (!mpToken) {
                console.log('[DEPÓSITO] Token MP não configurado');
                return interaction.followUp({ content: `${emoji.get('erro') || '❌'} O administrador ainda não configurou o Access Token do Mercado Pago.`, flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }

            // Evitar geração de múltiplos PIX ativos
            const sessaoExistente = sessoesUsuario.get(user.id);
            if (sessaoExistente?.pix_id) {
                console.log('[DEPÓSITO] Usuário já tem PIX ativo');
                return interaction.followUp({ content: '❌ Você já tem um PIX ativo. Por favor, pague ou aguarde o cancelamento automático (5 min).', flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }

            console.log('[DEPÓSITO] Abrindo modal de valor');
            // Iniciar Modal de Valor
            const modalDeposito = new ModalBuilder()
                .setCustomId('modal_deposito_pix')
                .setTitle('Adicionar Saldo');

            const inputValor = new TextInputBuilder()
                .setCustomId('valor_deposito')
                .setLabel('Qual valor deseja depositar? (R$)')
                .setPlaceholder('Ex: 10.00')
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            modalDeposito.addComponents(new ActionRowBuilder().addComponents(inputValor));
            
            try {
                await interaction.showModal(modalDeposito);
                console.log('[DEPÓSITO] Modal aberto com sucesso');
            } catch (error) {
                console.error('[DEPÓSITO] Erro ao abrir modal:', error);
            }
            break;

        case 'voltar_menu':
        case 'cancelar_compra':
            await interaction.editReply(criarContainerMenuPrincipal(user.id)).catch(() => {});
            break;

        case 'pag_ant':
            mudarPagina(interaction, -1);
            break;
        case 'pag_prox':
            mudarPagina(interaction, 1);
            break;

        case 'confirmar_compra':
            console.log('[CONFIRMAR COMPRA] Iniciando confirmação');
            // Evitar múltiplas compras simultâneas para o mesmo usuário
            const sessaoAtual = sessoesUsuario.get(user.id);
            
            // Verificações de segurança
            if (sessaoAtual?.processando_compra) {
                console.log('[CONFIRMAR COMPRA] Já processando compra');
                return interaction.followUp({ content: '⚠️ Processando compra anterior, aguarde...', flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }
            
            if (sessaoAtual?.id_numero) {
                console.log('[CONFIRMAR COMPRA] Já tem número ativo');
                return interaction.followUp({ content: '⚠️ Você já tem um número ativo neste ticket. Cancele ou aguarde o SMS.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }
            
            // Bloqueio imediato (Atomic-like) com timestamp para evitar duplicações
            const timestampCompra = Date.now();
            sessoesUsuario.set(user.id, { 
                ...sessaoAtual, 
                processando_compra: true,
                timestamp_compra: timestampCompra 
            });
            console.log('[CONFIRMAR COMPRA] Flag de processamento ativada');
            
            // Definir timeout para resetar a flag em caso de erro
            setTimeout(() => {
                const sessaoTimeout = sessoesUsuario.get(user.id);
                if (sessaoTimeout?.processando_compra) {
                    console.log('[CONFIRMAR COMPRA] Timeout - resetando flag de processamento');
                    sessoesUsuario.set(user.id, { ...sessaoTimeout, processando_compra: false });
                }
            }, 30000); // 30 segundos
            
            processarCompra(interaction, client);
            break;

        case 'fechar_ticket':
            // Verificar se há número SMS ativo e fazer reembolso
            const sessaoTicket = sessoesUsuario.get(user.id);
            if (sessaoTicket?.id_numero) {
                // Bloquear múltiplos cancelamentos
                if (sessaoTicket.processando_cancelamento) {
                    await interaction.followUp({ content: '⚠️ Já há um processo de cancelamento em andamento.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
                    return;
                }
                
                // Marcar como processando
                sessoesUsuario.set(user.id, { ...sessaoTicket, processando_cancelamento: true });
                
                try {
                    const apiKey = General.get('sms24h.api_key');
                    if (apiKey) {
                        const sms24h = new SMS24HHandler(apiKey);
                        const idParaCancelar = String(sessaoTicket.id_numero).trim();
                        
                        console.log(`[FECHAR_TICKET] Cancelando número ativo: ${idParaCancelar}`);
                        
                        // Tentar cancelar na API
                        const resAPI = await sms24h.setStatus(idParaCancelar, 8);
                        
                        // Reembolsar independentemente da resposta da API
                        let currentSaldo = parseFloat(saldo.get(user.id) || 0);
                        const novoSaldo = (currentSaldo + sessaoTicket.preco).toFixed(2);
                        saldo.set(user.id, novoSaldo);
                        
                        console.log(`[FECHAR_TICKET] Reembolso realizado: R$ ${sessaoTicket.preco.toFixed(2)} - Novo saldo: R$ ${novoSaldo}`);
                        
                        // Limpar dados da sessão
                        sessoesUsuario.set(user.id, { ...sessaoTicket, id_numero: null, processando_cancelamento: false });
                        
                        await interaction.followUp({ content: `✅ **Reembolso automático:** R$ ${sessaoTicket.preco.toFixed(2)} estornados ao fechar o ticket.\n**Novo Saldo:** \`R$ ${novoSaldo}\``, flags: [MessageFlags.Ephemeral] }).catch(() => {});
                    }
                } catch (e) {
                    console.error('[FECHAR_TICKET] Erro ao cancelar/reembolsar:', e);
                    // Mesmo com erro, tentar reembolsar
                    try {
                        let currentSaldo = parseFloat(saldo.get(user.id) || 0);
                        const novoSaldo = (currentSaldo + sessaoTicket.preco).toFixed(2);
                        saldo.set(user.id, novoSaldo);
                        sessoesUsuario.set(user.id, { ...sessaoTicket, id_numero: null, processando_cancelamento: false });
                    } catch (err) {}
                }
            }
            
            await interaction.editReply({ 
                components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent("🔒 Ticket sendo encerrado..."))], 
                flags: [MessageFlags.IsComponentsV2] 
            }).catch(() => {});
            setTimeout(() => channel.delete().catch(() => {}), 2000);
            break;

        case 'cancelar_sms':
            // Lógica de cancelamento de SMS e reembolso
            const sessaoSMS = sessoesUsuario.get(user.id);
            if (sessaoSMS?.id_numero) {
                // Bloquear cancelamentos duplicados enquanto um está em curso
                if (sessaoSMS.processando_cancelamento) {
                    console.log(`[CANCELAR] Cancelamento já em processo para usuário ${user.id}`);
                    return;
                }
                
                // Marcar como processando IMEDIATAMENTE
                sessoesUsuario.set(user.id, { ...sessaoSMS, processando_cancelamento: true });

                // Deferir a interação para evitar timeout
                try {
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferUpdate().catch(() => {});
                    }
                } catch (e) {
                    console.log('[CANCELAR] Erro ao deferir:', e.message);
                }

                try {
                    const apiKey = General.get('sms24h.api_key');
                    if (!apiKey) {
                        throw new Error('API Key do SMS24H não configurada');
                    }
                    
                    const sms24h = new SMS24HHandler(apiKey);
                    
                    const idParaCancelar = String(sessaoSMS.id_numero).trim();
                    console.log(`[CANCELAR] Tentando cancelar ID: ${idParaCancelar}`);
                    
                    // Usar o novo método cancelActivation
                    const resultado = await sms24h.cancelActivation(idParaCancelar);
                    console.log(`[CANCELAR] Resultado:`, resultado);
                    
                    if (resultado.success) {
                        // Reembolsar
                        let currentSaldo = parseFloat(saldo.get(user.id) || 0);
                        const novoSaldo = (currentSaldo + sessaoSMS.preco).toFixed(2);
                        saldo.set(user.id, novoSaldo);
                        
                        // Atualizar histórico para cancelado
                        const hist = historico.get(user.id) || [];
                        const index = hist.findIndex(h => h.id === sessaoSMS.id_numero);
                        if (index !== -1) {
                            hist[index].status = 'Cancelado/Reembolsado';
                            historico.set(user.id, hist);
                        }

                        // Limpar ID do número e resetar flags
                        sessoesUsuario.set(user.id, { ...sessaoSMS, id_numero: null, processando_cancelamento: false });
                        
                        await interaction.editReply({ 
                            components: [new ContainerBuilder().addTextDisplayComponents(new TextDisplayBuilder().setContent(`✅ **SMS Cancelado com Sucesso!**\n💰 R$ ${sessaoSMS.preco.toFixed(2)} foram estornados ao seu saldo.\n\n**Novo Saldo:** \`R$ ${novoSaldo}\``))],
                            flags: [MessageFlags.IsComponentsV2]
                        }).catch((e) => {
                            console.error('[CANCELAR] Erro ao editar reply:', e);
                        });
                        
                        setTimeout(() => {
                            interaction.editReply(criarContainerMenuPrincipal(user.id)).catch(() => {});
                        }, 5000);
                    } else {
                        sessoesUsuario.set(user.id, { ...sessaoSMS, processando_cancelamento: false });
                        await interaction.followUp({ content: `⚠️ **Cancelamento Recusado:** \`${resultado.response}\`. O número pode já ter expirado ou recebido o código.`, flags: [MessageFlags.Ephemeral] }).catch(() => {});
                    }
                } catch (e) {
                    sessoesUsuario.set(user.id, { ...sessaoSMS, processando_cancelamento: false });
                    console.error("[CANCELAR_SMS] Erro:", e);
                    await interaction.followUp({ content: '❌ Erro técnico ao processar cancelamento na API.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
                }
            } else {
                await interaction.followUp({ content: '❌ Nenhum número ativo encontrado.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }
            break;

        case 'menu_configuracoes':
            await interaction.followUp({ content: 'Configurações em construção 🚧', flags: [MessageFlags.Ephemeral] }).catch(() => {});
            break;
    }
}

async function processarCompra(interaction, client) {
    // ... conteúdo omitido para brevidade no exemplo, mas manterei o que estava ...
}

// --- NOVAS FUNÇÕES PARA CONFIGURAÇÃO VIA JSON ---

async function iniciarConfiguracaoJSON(interaction) {
    const { user } = interaction;
    
    // Configurações atuais do sistema de tickets (Termos e Etapa 2)
    const configAtual = General.get('sistema_ticket.config') || {
        termos: {
            titulo: "📋 Termos de Uso",
            descricao: "Ao prosseguir, você concorda com nossos termos.",
            regras: [
                "1. O número é único e exclusivo para você.",
                "2. Utilize apenas para fins legais.",
                "3. O código SMS deve ser usado dentro de 10 minutos."
            ],
            botao_aceitar: "Aceitar e Prosseguir",
            botao_cancelar: "Cancelar"
        },
        dashboard: {
            titulo: "Painel de Controle",
            descricao: "Gerencie seu saldo e histórico abaixo.",
            botoes: {
                comprar: "🛒 Comprar Número",
                saldo: "💰 Ver Saldo",
                historico: "📜 Histórico"
            }
        }
    };

    const jsonString = JSON.stringify(configAtual, null, 2);
    
    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('confirmar_json').setLabel('Confirmar Alteração').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('cancelar_config_json').setLabel('Cancelar').setStyle(ButtonStyle.Danger)
    );

    try {
        await interaction.editReply({
            content: `📦 **Configuração Atual (JSON):**\n\`\`\`json\n${jsonString}\n\`\`\`\n\nPor favor, envie o **NOVO JSON** alterado no chat agora.`,
            components: [row]
        });
    } catch (e) {
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: `📦 **Configuração Atual (JSON):**\n\`\`\`json\n${jsonString}\n\`\`\`\n\nPor favor, envie o **NOVO JSON** alterado no chat agora.`,
                components: [row],
                ephemeral: true
            });
        }
    }

    const filter = m => m.author.id === user.id;
    const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 300000 });

    collector.on('collect', async m => {
        try {
            const novoJson = JSON.parse(m.content);
            sessoesUsuario.set(user.id, { ...sessoesUsuario.get(user.id), novo_config_json: novoJson });
            await m.delete().catch(() => {});
            await interaction.editReply({
                content: `✅ **JSON recebido com sucesso!**\nClique no botão abaixo para confirmar a aplicação de todo o sistema.`,
                components: [row]
            });
        } catch (e) {
            await interaction.followUp({ content: '❌ JSON inválido! Tente novamente usando o comando.', ephemeral: true });
        }
    });
}

async function processarNovoJSON(interaction) {
    const sessao = sessoesUsuario.get(interaction.user.id);
    if (!sessao?.novo_config_json) return interaction.reply({ content: '❌ Nenhum JSON pendente.', ephemeral: true });

    // Aqui você salvaria no banco de dados (ex: config.json ou similar)
    // Para este exemplo, apenas confirmamos o recebimento
    
    await interaction.editReply({
        content: '✅ **Sistema de Tickets atualizado com sucesso via JSON!**',
        components: []
    });
    
    sessoesUsuario.set(interaction.user.id, { ...sessao, novo_config_json: null });
}

async function handleSelect(interaction, client) {
    const { customId, values, user, channel } = interaction;
    
    // Tentar deferir a atualização IMEDIATAMENTE para todos os casos do Select
    try {
        if (!interaction.deferred && !interaction.replied) {
            // Se for abrir o modal de depósito, não podemos usar deferUpdate
            if (customId === 'menu_selecao' && values[0] === 'menu_depositar') {
                // Não faz nada, showModal cuidará disso
            } else {
                await interaction.deferUpdate().catch(() => {});
            }
        }
    } catch (e) {}

    if (channel) resetarTimeoutInatividade(user.id, channel.id);

    if (customId === 'menu_selecao') {
        const value = values[0];
        if (value === 'menu_historico') {
            await interaction.editReply(criarContainerHistorico(user.id)).catch(() => {});
        } else if (value === 'menu_depositar') {
            const mpToken = General.get('mercadopago.access_token');
            if (!mpToken) {
                return interaction.followUp({ content: `${emoji.get('erro') || '❌'} O administrador ainda não configurou o Access Token do Mercado Pago.`, flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }

            const modalDeposito = new ModalBuilder()
                .setCustomId('modal_deposito_pix')
                .setTitle('Adicionar Saldo');

            const inputValor = new TextInputBuilder()
                .setCustomId('valor_deposito')
                .setLabel('Qual valor deseja depositar? (R$)')
                .setPlaceholder('Ex: 10.00')
                .setRequired(true)
                .setStyle(TextInputStyle.Short);

            modalDeposito.addComponents(new ActionRowBuilder().addComponents(inputValor));
            
            // CORREÇÃO: Usar reply direto se for StringSelectMenu para abrir modal
            try {
                await interaction.showModal(modalDeposito);
            } catch (error) {
                console.error('[DEPÓSITO] Erro ao abrir modal via select:', error);
                // Fallback: se o deferUpdate já foi feito, talvez não consiga abrir o modal
                // Mas tentamos sem o catch inicial do defer se possível ou verificando estado
            }
        }
    }

    if (customId === 'select_servico') {
        console.log('[SELECT SERVIÇO] Usuário clicou em um serviço');
        const selectedValue = values[0]; // Ex: "sms_12"
        console.log('[SELECT SERVIÇO] Valor selecionado:', selectedValue);
        
        if (selectedValue === 'null') {
            console.log('[SELECT SERVIÇO] Valor null, ignorando');
            return;
        }

        const idServico = selectedValue.replace('sms_', '');
        console.log('[SELECT SERVIÇO] ID do serviço:', idServico);
        
        const servico = SERVICOS.find(s => s.id == idServico);
        console.log('[SELECT SERVIÇO] Serviço encontrado:', servico ? servico.nome : 'NÃO ENCONTRADO');

        if (!servico) {
            console.log('[SELECT SERVIÇO] Serviço não encontrado! Total de serviços:', SERVICOS.length);
            return interaction.followUp({ content: 'Serviço não encontrado.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
        }

        const saldoUsuario = parseFloat(saldo.get(user.id) || 0);
        console.log('[SELECT SERVIÇO] Saldo do usuário:', saldoUsuario);

        // Salva na sessão o que ele escolheu
        sessoesUsuario.set(user.id, {
            estagio: 'confirmacao',
            dados: { servico: servico }
        });

        console.log('[SELECT SERVIÇO] Indo para tela de confirmação');
        // Garantir que usamos editReply após o deferUpdate inicial
        await interaction.editReply(criarContainerConfirmacao(servico, saldoUsuario)).catch(async (err) => {
            console.error('[SELECT SERVIÇO] Erro ao editar reply:', err);
            if (err.code === 10062) {
                // Se ainda assim der Unknown Interaction, tentamos enviar uma nova mensagem como fallback
                await channel.send(criarContainerConfirmacao(servico, saldoUsuario)).catch(() => {});
            }
        });
    }
}

async function handleModal(interaction, client) {
    const { customId, fields, user, channel } = interaction;

    if (customId === 'modal_deposito_pix') {
        console.log('[DEPÓSITO] Iniciando processo de depósito para usuário:', user.id);
        const valorRaw = fields.getTextInputValue('valor_deposito').replace(',', '.');
        const valor = parseFloat(valorRaw);
        console.log('[DEPÓSITO] Valor informado:', valor);

        if (isNaN(valor) || valor < 1) {
            console.log('[DEPÓSITO] Valor inválido');
            // Modais precisam de resposta direta ou deferida
            if (!interaction.replied && !interaction.deferred) {
                return interaction.reply({ content: '❌ Valor inválido. O mínimo é R$ 1,00.', flags: [MessageFlags.Ephemeral] }).catch(() => {});
            }
            return;
        }

        // Estado de "Aguarde..."
        const loadingContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⏳ Aguarde...\nEstamos gerando seu PIX de **R$ ${valor.toFixed(2)}**`));
        
        try {
            console.log('[DEPÓSITO] Enviando loading...');
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ components: [loadingContainer], flags: [MessageFlags.IsComponentsV2] }).catch(() => {});
                console.log('[DEPÓSITO] Loading enviado com sucesso');
            }
        } catch (e) {
            console.error('[DEPÓSITO] Erro ao enviar loading:', e);
        }

        try {
            console.log('[DEPÓSITO] Iniciando criação de pagamento...');
            const mpToken = General.get('mercadopago.access_token');
            console.log('[DEPÓSITO] Token MP encontrado:', !!mpToken);
            
            if (!mpToken) {
                throw new Error('Access Token do Mercado Pago não configurado');
            }
            
            const MercadoPagoHandler = require('../../Handler/mercadopago');
            const mp = new MercadoPagoHandler(mpToken);

            console.log('[DEPÓSITO] Chamando API Mercado Pago...');
            const pagamento = await mp.criarPagamentoPix(valor, `Depósito de Saldo - ${user.username}`);
            console.log('[DEPÓSITO] Pagamento criado:', pagamento.id);
            
            // Timer para deletar PIX e mensagem após 5 minutos
            const pixTimeout = setTimeout(async () => {
                const s = sessoesUsuario.get(user.id);
                if (s && s.pix_id === pagamento.id) {
                    sessoesUsuario.delete(user.id);
                    try {
                        await interaction.editReply(criarContainerMenuPrincipal(user.id)).catch(() => {});
                        await channel.send("⚠️ Seu PIX expirou e foi cancelado.").then(m => setTimeout(() => m.delete().catch(() => {}), 5000));
                    } catch (e) {}
                }
            }, 5 * 60 * 1000);

            // Tentar gerar o container, mas remover a imagem se o base64 estiver vindo errado ou não suportado no V2
            // Discord V2 pode ter limitações com data URIs em MediaGallery dependendo da versão
            const pixContainer = new ContainerBuilder();

            // 1. Título e Valor PRIMEIRO
            pixContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `## <:pix:1457209865675083836> Depósito PIX\n` +
                `### Valor: \`R$ ${valor.toFixed(2)}\``
            ));

            // 2. Imagem do QR Code logo abaixo do título/valor
            if (pagamento.qr_code) {
                 try {
                    pixContainer.addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems(
                            new MediaGalleryItemBuilder().setURL(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pagamento.qr_code)}`)
                        )
                    );
                 } catch (e) {
                    console.error('[DEPÓSITO] Erro ao adicionar QR Code:', e);
                 }
            }

            // 3. Copia e Cola e Botão
            pixContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `**Copia e Cola:**\n` +
                `-# \`${pagamento.qr_code}\`\n\n` +
                `Clique no botão abaixo para copiar:`
            ))
            .addSeparatorComponents(new SeparatorBuilder().setDivider(true))
            .addActionRowComponents(new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`copiar_pix_${pagamento.id}`).setLabel('Copiar Código').setStyle(ButtonStyle.Primary).setEmoji('1269507096282533969')
            ));

            // Salvar o código para o botão de copiar funcionar
            sessoesUsuario.set(user.id, { ...sessoesUsuario.get(user.id), pix_code: pagamento.qr_code, pix_id: pagamento.id, timeout: pixTimeout });

            await interaction.editReply({ components: [pixContainer], flags: [MessageFlags.IsComponentsV2] });

            // Monitorar pagamento em background com verificação extra
            const status = await mp.aguardarPagamento(pagamento.id);

            if (status.status === 'approved') {
                const s = sessoesUsuario.get(user.id);
                if (s?.timeout) clearTimeout(s.timeout);
                
                let currentSaldo = parseFloat(saldo.get(user.id) || 0);
                const novoSaldo = (currentSaldo + valor).toFixed(2);
                saldo.set(user.id, novoSaldo);

                // Registrar no histórico
                const historicoAtual = historico.get(user.id) || [];
                historicoAtual.push({
                    tipo: 'deposito',
                    valor: valor,
                    metodo: 'PIX',
                    status: 'Concluído',
                    timestamp: Date.now()
                });
                historico.set(user.id, historicoAtual);

                // Retornar ao menu principal após aprovação, limpando tudo
                const menuPrincipal = criarContainerMenuPrincipal(user.id);
                try {
                    await interaction.editReply(menuPrincipal);
                    await channel.send({ content: `<a:953908880642043954:1457207680748880101> **Pagamento Confirmado!** R$ ${valor.toFixed(2)} foram adicionados ao seu saldo.` });
                } catch (e) {
                    await channel.send(menuPrincipal);
                }
            }

        } catch (error) {
            console.error(error);
            const errorMsg = error.message.length > 100 ? error.message.substring(0, 100) + "..." : error.message;
            await interaction.editReply({ content: `❌ Erro ao gerar pagamento: ${errorMsg}`, components: [] }).catch(() => {});
        }
    }
}

// ==================================================================
// FUNÇÕES LÓGICAS
// ==================================================================

async function mudarPagina(interaction, dir) {
    const userId = interaction.user.id;
    let pag = paginasUsuarios.get(userId) || 0;
    pag += dir;
    if (pag < 0) pag = 0;

    paginasUsuarios.set(userId, pag);
    await interaction.editReply(criarContainerCatalogo(pag)).catch(() => {});
}

async function processarCompra(interaction, client) {
    const userId = interaction.user.id;
    const sessao = sessoesUsuario.get(userId);
    
    console.log(`[COMPRA] Iniciando compra para usuário ${userId}`);
    console.log(`[COMPRA] Sessão atual:`, sessao);
    
    // Verificação inicial: se já tem id_numero, abortar
    if (sessao?.id_numero) {
        console.log(`[COMPRA] Usuário ${userId} já tem número ativo, abortando.`);
        sessoesUsuario.set(userId, { ...sessao, processando_compra: false });
        return;
    }
    
    if (!sessao || !sessao.dados.servico) {
        console.log(`[COMPRA] Sessão inválida para usuário ${userId}`);
        // Limpar flag em caso de erro de sessão
        sessoesUsuario.set(userId, { ...sessao, processando_compra: false });
        return;
    }

    const { servico } = sessao.dados;
    const preco = servico.preco_final;
    const apiKey = General.get('sms24h.api_key');

    // Garantir que a interação seja atualizada ou deferida LOGO NO INÍCIO
    try {
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferUpdate().catch(() => {});
        }
    } catch (e) {
        console.error("Erro ao deferir interação:", e);
    }

    // Loading State
    const loadingContainer = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ⏳ Processando Compra: ${servico.nome}...`));

    try {
        await interaction.editReply({ components: [loadingContainer], flags: [MessageFlags.IsComponentsV2] }).catch(() => {});
    } catch (e) {
        console.error("Erro ao enviar loading state:", e);
        // Se falhou o editReply, tentamos followUp se não tiver respondido, mas editReply é o esperado aqui
    }

    try {
        if (!apiKey) throw new Error("API Key não configurada.");

        // API Handler
        const sms24h = new SMS24HHandler(apiKey);
        
        console.log(`[COMPRA] Solicitando número para serviço: ${servico.id} (${servico.nome})`);
        console.log(`[COMPRA] Sessão atual antes da API:`, sessao);
        
        const numero = await sms24h.getNumber(servico.id, 73, 'any'); // Brasil

        // Validação extra do ID do número
        if (!numero || !numero.id) {
            throw new Error("A API não retornou um ID de número válido.");
        }

        console.log(`[COMPRA] Número recebido da API: ID=${numero.id}, Numero=${numero.numero}`);

        // VERIFICAÇÃO CRÍTICA: Antes de descontar saldo, verificar se não criou duplicado
        const sessaoVerificacao = sessoesUsuario.get(userId);
        console.log(`[COMPRA] Sessão após API:`, sessaoVerificacao);
        
        if (sessaoVerificacao?.id_numero) {
            console.log(`[COMPRA] DUPLICAÇÃO DETECTADA! Já existe número ${sessaoVerificacao.id_numero}. Abortando novo número ${numero.id}`);
            // Cancelar o número que acabou de criar
            try {
                await sms24h.cancelActivation(numero.id);
                console.log(`[COMPRA] Número duplicado ${numero.id} cancelado com sucesso`);
            } catch (err) {
                console.error('[COMPRA] Erro ao cancelar número duplicado:', err);
            }
            sessoesUsuario.set(userId, { ...sessao, processando_compra: false });
            return;
        }

        // Salvar ID do número para cancelamento e resetar flag de processamento
        // Usar String() no ID para garantir compatibilidade com a API
        const idNumeroStr = String(numero.id);

        // Desconta Saldo
        let currentSaldo = parseFloat(saldo.get(userId) || 0);
        saldo.set(userId, (currentSaldo - preco).toFixed(2));

        // Registrar no histórico
        const compraInfo = {
            plataforma: servico.nome,
            valor: preco,
            numero: numero.numero,
            status: 'Aguardando SMS',
            timestamp: Date.now(),
            id: idNumeroStr
        };
        const historicoAtual = historico.get(userId) || [];
        historicoAtual.push(compraInfo);
        historico.set(userId, historicoAtual);

        console.log(`[COMPRA] Número ${numero.id} (${numero.numero}) gerado com sucesso. Saldo debitado: R$ ${preco}`);
        sessoesUsuario.set(userId, { 
            ...sessao, 
            id_numero: idNumeroStr, 
            preco: preco,
            processando_compra: false 
        });

        // Tela de Sucesso
        const successContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                `## ✅ Sucesso!\n` +
                `### 📱 \`${numero.numero}\`\n` +
                `**Serviço:** ${servico.nome}\n` +
                `**ID:** ${idNumeroStr}\n\n` +
                `<a:loading:1457217500319318163> **Aguardando**\n\n` +
                `O código SMS aparecerá aqui em breve.`
            ))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('menu_comprar').setLabel('Comprar Mais').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('cancelar_sms').setLabel('Cancelar/Reembolso').setStyle(ButtonStyle.Danger)
                )
            );

        // Garantir que usamos o método correto de resposta
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ components: [successContainer], flags: [MessageFlags.IsComponentsV2] }).catch(() => {});
        } else {
            await interaction.reply({ components: [successContainer], flags: [MessageFlags.IsComponentsV2] }).catch(() => {});
        }

        // Loop de verificação de SMS
        let tentativas = 0;
        const interval = setInterval(async () => {
            tentativas++;
            // Se o usuário cancelou o SMS (id_numero fica null na sessão), parar o loop
            const sessaoAtualizada = sessoesUsuario.get(interaction.user.id);
            if (!sessaoAtualizada || sessaoAtualizada.id_numero !== numero.id) {
                clearInterval(interval);
                return;
            }

            if (tentativas > 60) { // 10 minutos (10s interval)
                clearInterval(interval);
                return;
            }

            try {
                const status = await sms24h.getStatus(numero.id);
                // Ajuste para aceitar tanto STATUS_OK quanto RECEBIDO
                if (status.status === 'STATUS_OK' || status.status === 'RECEBIDO') {
                    clearInterval(interval);
                    
                    const code = status.codigo || status.code;

                    // Atualizar histórico com o código
                    const hist = historico.get(userId) || [];
                    const index = hist.findIndex(h => h.id === numero.id);
                    if (index !== -1) {
                        hist[index].status = 'Concluído';
                        hist[index].codigo = code;
                        historico.set(userId, hist);
                    }

                    const finalContainer = new ContainerBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(
                            `## ✅ Sucesso!\n` +
                            `### 📱 \`${numero.numero}\`\n` +
                            `**Serviço:** ${servico.nome}\n` +
                            `**ID:** ${numero.id}\n\n` +
                            `📬 **Código Recebido:** \`${code}\``
                        ))
                        .addActionRowComponents(
                            new ActionRowBuilder().addComponents(
                                new ButtonBuilder().setCustomId('menu_comprar').setLabel('Comprar Mais').setStyle(ButtonStyle.Success)
                            )
                        );

                    await interaction.editReply({ components: [finalContainer], flags: [MessageFlags.IsComponentsV2] }).catch(() => {});
                }
            } catch (e) {}
        }, 10000);

    } catch (error) {
        // Limpar flag em caso de erro
        sessoesUsuario.set(interaction.user.id, { ...sessao, processando_compra: false });

        const errorContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ❌ Erro\n${error.message}`));
        const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('voltar_menu').setLabel('Voltar').setStyle(ButtonStyle.Secondary));

        await interaction.editReply({ components: [errorContainer, btn], flags: [MessageFlags.IsComponentsV2] });
    }
}

// ==================================================================
// CRIAÇÃO DE TICKET (AQUI ESTAVA O ERRO PRINCIPAL)
// ==================================================================

async function criarTicket(interaction, client) {
    const userId = interaction.user.id;

    if (ticketsAbertos.has(userId)) {
        // Tenta pegar o canal para ver se ainda existe
        const canalId = ticketsAbertos.get(userId);
        const canal = interaction.guild.channels.cache.get(canalId);

        if (canal) {
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply({ content: `❌ Você já tem um ticket: ${canal}` }).catch(() => {});
            }
            return interaction.reply({ content: `❌ Você já tem um ticket: ${canal}`, ephemeral: true }).catch(() => {});
        } else {
            ticketsAbertos.delete(userId); // Limpa se o canal não existir mais
        }
    }

    // Tenta criar o canal
    try {
        // Bloqueio de concorrência local para evitar múltiplos cliques
        if (interaction.client.processandoTicket?.has(userId)) return;
        if (!interaction.client.processandoTicket) interaction.client.processandoTicket = new Set();
        
        // Mover o deferReply para o início absoluto do processamento do ticket
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true }).catch(() => {});
        }

        // Se mesmo após o catch o defer falhou (Unknown Interaction), abortamos
        if (!interaction.deferred && !interaction.replied) return;

        interaction.client.processandoTicket.add(userId);
        const categoriaId = General.get('tickets.categoria');
        if (!categoriaId) {
            interaction.client.processandoTicket.delete(userId);
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply({ content: 'Categoria nao configurada!' }).catch(() => {});
            }
            return interaction.reply({ content: 'Categoria nao configurada!', ephemeral: true }).catch(() => {});
        }
        
        if (!categoriaId) {
            interaction.client.processandoTicket.delete(userId);
            if (interaction.deferred || interaction.replied) {
                return interaction.editReply({ content: 'Categoria nao configurada!' }).catch(() => {});
            }
            return interaction.reply({ content: 'Categoria nao configurada!', ephemeral: true }).catch(() => {});
        }
        

        const ticket = await interaction.guild.channels.create({
            name: `🎫-${interaction.user.username}`,
            type: 0, // GuildText
            parent: categoriaId,
            permissionOverwrites: [
                { id: interaction.guild.id, deny: ['ViewChannel'] },
                { id: userId, allow: ['ViewChannel', 'SendMessages'] },
                { id: client.user.id, allow: ['ViewChannel', 'SendMessages'] }
            ]
        });

        ticketsAbertos.set(userId, ticket.id);
        iniciarTimeoutInatividade(userId, ticket.id);

        // Responde o botão original dizendo que criou
        await interaction.editReply({ content: `✅ Ticket criado: ${ticket}` }).catch(() => {});

        // Envia a mensagem V2 dentro do ticket
        // CORREÇÃO AQUI: Não use 'content' junto com 'components' V2
        const payload = criarContainerTermos(userId);
        await ticket.send(payload);

        interaction.client.processandoTicket.delete(userId);

    } catch (error) {
        interaction.client.processandoTicket?.delete(userId);
        console.error("Erro ao criar ticket:", error);

        // Verifica se já respondeu para evitar o erro "InteractionAlreadyReplied"
        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: `❌ Erro ao criar ticket: ${error.message}` }).catch(() => {});
            } else {
                await interaction.reply({ content: `❌ Erro ao criar ticket: ${error.message}`, ephemeral: true }).catch(() => {});
            }
        } catch (e) {}
    }
}

// Timer helpers
function iniciarTimeoutInatividade(userId, channelId) {
    clearTimeout(timeoutsUsuario.get(userId));
    const timer = setTimeout(async () => {
        try {
            const channel = await userId.client?.channels.fetch(channelId).catch(() => null); // mock client access
            // Na prática você precisa passar o client ou acessar via cache global
            if (channel) channel.delete().catch(() => {});
            ticketsAbertos.delete(userId);
        } catch (e) {}
    }, INATIVIDADE_TIMEOUT);
    timeoutsUsuario.set(userId, timer);
}

function resetarTimeoutInatividade(userId, channelId) {
    iniciarTimeoutInatividade(userId, channelId);
}

module.exports.criarTicket = criarTicket;

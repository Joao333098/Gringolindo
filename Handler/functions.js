const GetInfoPlayer = async (interaction,id) => {
    var user = interaction.guild.members.fetch(id)

    return user
    
}

module.exports = { GetInfoPlayer };

module.exports = {
	name: 'camera',
	ownerOnly: true,
	description: '',
	async execute(message,args) {
        voiceChannel = message.guild.channels.cache.find(c => c.type=="voice" && c.members.some(m => m.id=message.author.id));
        members=voiceChannel.members.map(m => message.guild.member(m.id));
        serverName=message.guild.name;
        for (const u of members) {
            m=u.voice;
            name=u.nickname;
            if(!name)
                name=u.user.username;
            if (!m.selfVideo) {
                console.log(name+" has no video in "+message.guild.name);
                const data = [];
                data.push(`Hallo ${name}, du hast in ${serverName} deine Kamera nicht an.`);
                u.user.send(data, { split: true })
                    .then(() => {
                        if (message.channel.type === 'dm') return;
                    })
                    .catch(error => {
                        console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    });
            }else{
                console.log(name+" has video");
            }
        }
	},
};

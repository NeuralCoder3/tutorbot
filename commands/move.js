module.exports = {
	name: 'move',
	description: '',
	ownerOnly: true,
	args: true,
	execute(message,args) {

const groupPrefix=args[0];

const channels=message.guild.channels.cache;
let members=new Set();
for (const [channelID, channel] of channels) {
  if(channel.type!=="voice")
	continue;
  for (const [memberID, member] of channel.members) {
	members.add(member);
  }
}

console.log("")

members = Array.from(members).filter(member => {
	return (member!=message.guild.owner && !member.user.bot)
	// return !member.user.bot
});

let memberCount=members.length;
let i=0;

for (const [channelID, channel] of channels) {
	// console.log("Group: "+channel.name);
	if(channel.type!=="voice")
		continue;
	// if(channel.type==="voice")
	// 	console.log(channel);
	if(channel.name.startsWith(groupPrefix)){
		let maxuser=channel.userLimit;
		if(!maxuser)
			maxuser=1000;
		// console.log("maximum "+maxuser+" into this channel");
		// console.log(channel.members.size);
		let count=channel.members.size;
		while(count<maxuser && i<memberCount){
			members[i].voice.setChannel(channel);
			count++;
			console.log("Moved "+members[i]+" to "+channel+" => "+count+"/"+maxuser);
			i++;
		}
	}
}

	},
};

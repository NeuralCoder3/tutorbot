
module.exports = {
    handler: (oldMember,newMember) => {
        if(oldMember.channel)
        {
  let oldRole=oldMember.guild.roles.cache.find(role => role.name==oldMember.channel.name);
  if(oldRole){
	oldMember.member.roles.remove(oldRole);
  }
    }

  if(!newMember.channel)
      return;
  let channelName=newMember.channel.name;
  let textRole=newMember.guild.roles.cache.find(role => role.name==newMember.channel.name);
  const everyoneRole = newMember.guild.roles.cache.find(r => r.name=='@everyone');
  let guild=newMember.guild;

  if(textRole==undefined) {
	guild.roles.create({
	data: {
		name: channelName,
		color: 'BLUE',
	},
	reason: 'a role for associated text channels',
	})
  .then(
	role => 
	guild.channels.create(channelName+"_text", 'text')
    .then(r => {
        r.overwritePermissions( [ 
	 { id: everyoneRole,
	 deny: ['VIEW_CHANNEL'], }, 
	 { id: role,
	 allow: ['VIEW_CHANNEL'], }, 
	]);
    })
    .catch(console.error)
  ).catch(console.error);
  }

//better use await
  let textRole2=newMember.guild.roles.cache.find(role => role.name==newMember.channel.name);
  if(textRole2){
	newMember.member.roles.add(textRole2);
  }
//   console.log(textRole);
    }
};
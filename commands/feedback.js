module.exports = {
	name: 'feedback',
	description: '',
	ownerOnly: false,
	args: true,
	execute(message,args) {
		var feedback=args.join(" ");

		// global.client.channels.fetch('744329339755036712')
		global.client.channels.fetch('772799523721445396')
			.then(channel => 
				// console.log(channel.name)
				channel.send("Feedback: "+feedback)
				);


	},
};

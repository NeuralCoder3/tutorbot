const poll = require('./poll');

module.exports = {
	name: 'pollmult',
	description: '',
	args: true,
	async execute(message,args) {
		args=args.join(" ").split("\"");
		args2=[];
		for (let index = 1; index < args.length; index+=2) {
			const element = args[index];
			args2.push(element);
		}
        // console.log(args2);
        await poll.pollEmbed(message,args2[0],args2.slice(1),120,true);
    }
};

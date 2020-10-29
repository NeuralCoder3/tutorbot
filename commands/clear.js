
module.exports = {
	name: 'clear',
	description: '',
	ownerOnly: true,
	args: true,
	async execute(message,args) {

        amount=args[0];
if (!amount) return message.reply('You haven\'t given an amount of messages which should be deleted!'); 
if (isNaN(amount)) return message.reply('The amount parameter isn`t a number!'); 

if (amount > 100) return message.reply('You can`t delete more than 100 messages at once!'); 
if (amount < 1) return message.reply('You have to delete at least 1 message!'); 

await message.channel.messages.fetch({ limit: amount }).then(messages => { 
    message.channel.bulkDelete(messages
)});

	},
};

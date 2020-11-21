const fs = require('fs');
const Discord = require('discord.js');
global.Discord=Discord;
const { prefix, token } = require('./config.json');
const readline = require('readline');
const Keyv = require('keyv');

const client = new Discord.Client();
global.client=client;
client.commands = new Discord.Collection();

// console.log(`sqlite:${__dirname}/data.sqlite`);
// const keyv = new Keyv(`sqlite:${__dirname}/data.sqlite`);
global.keyv = new Keyv(`sqlite:data.sqlite`);
global.keyv.on('error', err => console.error('Keyv connection error:', err));

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once('ready', () => {
	console.log('Ready!');
});

const textchannels = require(`./commands/textchannels.js`);
client.on('voiceStateUpdate', textchannels.handler);

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.ownerOnly && (message.channel.type==='dm' || message.author!=message.guild.owner.user)) {
		// console.log(message.author);
		// console.log(message.guild.owner);
		return message.reply('You don\'t have the necessary permissions!');
	}

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});


const readInterface = readline.createInterface({
    input: fs.createReadStream('boards.txt'),
    // output: process.stdout,
    console: false
});

global.boards=[];
readInterface.on('line', function(line) {
	if(!line.startsWith("https"))
		return;
	global.boards.push(line)
	// console.log("B:"+line);
	// if(await keyv.get(line))
});



client.login(token);

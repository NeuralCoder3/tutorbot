const { MessageEmbed } = require('discord.js');
const Canvas = require('canvas');


const applyText = (canvas, text,xpos,ypos) => {
	const ctx = canvas.getContext('2d');

	let fontSize = 70;

	do {
		ctx.font = `${fontSize -= 1}px sans-serif`;
	} while (ctx.measureText(text).width > canvas.width - xpos || ctx.measureText(text).height > canvas.height - ypos);

	return (ctx.font,fontSize);
};

function generateHslaColors (saturation, lightness, alpha, amount) {
  let colors = []
  let huedelta = Math.trunc(360 / amount)

  for (let i = 0; i < amount; i++) {
    let hue = i * huedelta
	// colors.push(`hsla(${hue},${saturation}%,${lightness}%,${alpha})`)
	col=`hsla(${hue},${saturation}%,${lightness}%,${alpha})`;
	colors.push(Color(col).hex());
  }

  return colors
}

function sendImage(channel,options) {
	const canvas = Canvas.createCanvas(500, 250+40);
	mid=canvas.height/2;
	const ctx = canvas.getContext('2d');
  
  var colors = ['#4CAF50', '#00BCD4', '#E91E63', '#FFC107', '#9E9E9E', '#CDDC39', '#18FFFF', '#F44336', '#FFF59D', '#6D4C41'];

  var angles=[];

	// options=[["A",10],["B",2],["eklwrhjwel",5],["D",1],["E",3]];
	sum=0;
	text="";
	for (let idx = 0; idx < options.length; idx++) {
		var [name,votes]=options[idx];
		sum+=votes;
		text+=name+"\n";
	}
	for (let idx = 0; idx < options.length; idx++) {
		var [_,votes]=options[idx];
        angles.push(Math.PI*2*votes/sum);
	}



  var offset = 10;
  var beginAngle = 0;
  var endAngle = 0;
  var offsetX, offsetY, medianAngle;
  
  for(var i = 0; i < angles.length; i = i + 1) {
    beginAngle = endAngle;
    endAngle = endAngle + angles[i];
    medianAngle = (endAngle + beginAngle) / 2;
    offsetX = Math.cos(medianAngle) * offset;
    offsetY = Math.sin(medianAngle) * offset;
    ctx.beginPath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.moveTo(mid + offsetX, mid + offsetY);
    ctx.arc(mid + offsetX, mid + offsetY, 120, beginAngle, endAngle);
    ctx.lineTo(mid + offsetX, mid + offsetY);
    ctx.stroke();
    ctx.fill();
  }


	x=canvas.height+10;
	y=20;
	ctx.font,fontSize = applyText(canvas, text,x+40,y);

	for (let idx = 0; idx < options.length; idx++) {
		ctx.fillStyle = colors[idx % colors.length];

		ay=y+idx*(fontSize+fontSize/4);
		ctx.fillRect(x,ay,fontSize,fontSize);
	}

	x+=fontSize;
	y+=fontSize;
	ctx.fillStyle = '#ffffff';
	ctx.fillText(text, x, y);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
	channel.send(``, attachment);
}




const defEmojiList = [
	'\u0031\u20E3',
	'\u0032\u20E3',
	'\u0033\u20E3',
	'\u0034\u20E3',
	'\u0035\u20E3',
	'\u0036\u20E3',
	'\u0037\u20E3',
	'\u0038\u20E3',
	'\u0039\u20E3',
	'\uD83D\uDD1F'
];

const pollEmbed = async (msg, title, options, timeout = 30, emojiList = defEmojiList.slice(), forceEndPollEmoji = '\u2705') => {
	if (!msg && !msg.channel) return msg.reply('Channel is inaccessible.');
	if (!title) return msg.reply('Poll title is not given.');
	if (!options) return msg.reply('Poll options are not given.');
	if (options.length < 2) return msg.reply('Please provide more than one choice.');
	if (options.length > emojiList.length) return msg.reply(`Please provide ${emojiList.length} or less choices.`);

	let text = `*To vote, react using the correspoding emoji.\nThe voting will end in **${timeout} seconds**.\nPoll creater can end the poll **forcefully** by reacting to ${forceEndPollEmoji} emoji.*\n\n`;
	const emojiInfo = {};
	for (const option of options) {
		const emoji = emojiList.splice(0, 1);
		emojiInfo[emoji] = { option: option, votes: 0 };
		text += `${emoji} : \`${option}\`\n\n`;
	}
	const usedEmojis = Object.keys(emojiInfo);
	usedEmojis.push(forceEndPollEmoji);

	const poll = await msg.channel.send(embedBuilder(title, msg.author.tag).setDescription(text));
	for (const emoji of usedEmojis) await poll.react(emoji);

	const reactionCollector = poll.createReactionCollector(
		(reaction, user) => usedEmojis.includes(reaction.emoji.name) && !user.bot,
		timeout === 0 ? {} : { time: timeout * 1000 }
	);
	const voterInfo = new Map();
	reactionCollector.on('collect', (reaction, user) => {
		if (usedEmojis.includes(reaction.emoji.name)) {
			if (reaction.emoji.name === forceEndPollEmoji && msg.author.id === user.id) return reactionCollector.stop();
			if (!voterInfo.has(user.id)) voterInfo.set(user.id, { emoji: reaction.emoji.name });
			const votedEmoji = voterInfo.get(user.id).emoji;
			if (votedEmoji !== reaction.emoji.name) {
				// const lastVote = poll.reactions.get(votedEmoji);
				// lastVote.count -= 1;
				// lastVote.users.remove(user.id);
				emojiInfo[votedEmoji].votes -= 1;
				voterInfo.set(user.id, { emoji: reaction.emoji.name });
			}
			emojiInfo[reaction.emoji.name].votes += 1;
		}
	});

	reactionCollector.on('dispose', (reaction, user) => {
		if (usedEmojis.includes(reaction.emoji.name)) {
			voterInfo.delete(user.id);
			emojiInfo[reaction.emoji.name].votes -= 1;
		}
	});

	reactionCollector.on('end', () => {
		text = '*Time\'s up!\n Results are in,*\n\n';
		for (const emoji in emojiInfo) text += `\`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes}\`\n\n`;
		poll.delete();
		msg.channel.send(embedBuilder(title, msg.author.tag).setDescription(text));
		options=[];
		for (const emoji in emojiInfo) options.push([emojiInfo[emoji].option,emojiInfo[emoji].votes+1]);
		sendImage(msg.channel,options);
	});
};

const embedBuilder = (title, author) => {
	return new MessageEmbed()
		.setTitle(`Poll - ${title}`)
		.setFooter(`Poll created by ${author}`);
};


module.exports = {
	name: 'poll',
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
        await pollEmbed(message,args2[0],args2.slice(1));
    }
};
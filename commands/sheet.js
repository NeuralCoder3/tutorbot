const shell = require('shelljs');
const board = require('./board');

module.exports = {
	name: 'sheet',
	description: '',
	async execute(message,args) {
		let channelId=message.channel.id;
        url=await board.getBoard(channelId);
        await message.channel.send("I will deliver the sheet to "+url);
        matches=url.match(/https:\/\/miro.com\/app\/board\/(.*?=)\//);
        boardId=matches[1];
        // console.log(boardId);
        shell.exec("python miro.py "+boardId+" ./tmp/Uebungsblatt_Praedikatenlogik.pdf")
		message.channel.send("The sheet was added to "+url);

	},
};

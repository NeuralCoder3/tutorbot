async function getBoard(channelId) {
		url=await global.keyv.get(channelId);
		if(!url){
			for (const board of global.boards) {
				resChannel=await global.keyv.get(board);
				if(!resChannel){
					await keyv.set(board, channelId);
					await keyv.set(channelId, board);
					url=board;
					break;
				}
			}
		}
		return url;
}

module.exports = {
	name: 'board',
	getBoard: getBoard,
	description: '',
	async execute(message,args) {

		let channelId=message.channel.id;
		url=await getBoard(channelId);
		message.channel.send("Your board is "+url);

	},
};

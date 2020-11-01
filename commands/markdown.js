const shell = require('shelljs');
const fs = require('fs');

module.exports = {
	name: 'markdown',
	description: '',
	async execute(message,args) {

    filePath="template.md";
    shell.exec("curl -v -XPOST -H 'Content-Type: text/markdown' 'https://demo.codimd.org/new' --data-binary @"+filePath+" > /tmp/Url.txt")
    url=fs.readFileSync("/tmp/Url.txt","utf8").replace("Found. Redirecting to ","")+"?both";
    message.channel.send("Your markdown is "+url);

	},
};

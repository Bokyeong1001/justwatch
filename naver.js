const https = require('https');

class Naver
{

	constructor(options)
	{
		this._options = Object.assign(options);
	}

	request(title,years)
	{
		return new Promise((resolve, reject) => {
        let buffer=[];
        var arr=[];
        var naver_header = {
            hostname: "openapi.naver.com",
            path: "/v1/search/movie.json?query="+encodeURI(title)+"&yearfrom="+years+"&yearto="+years,
            timeout: 2000,
            method: 'GET',
        };
        var requesting = https.request(naver_header, function(res) {
        res.on('data', chunk => {
            buffer.push(chunk);
        });
    
        res.on('end', () => {
            var output = null;
		    output = Buffer.concat(buffer);
			output = output.toString();
			output = JSON.parse(output);
			output=output.items[0].userRating;
            console.log(output);
            resolve(
                {naverRating:output}
            );
        });
    });
    requesting.on('error', (e) => {console.error(e.message);});
    requesting.end();
		});
    }
    async search(title,years)
	{
		return await this.request(title,years);
	}
}

module.exports = Naver;
const http = require('http');
class movielist2
{

	constructor(options)
	{
		this._options = Object.assign(options);
	}

	request(movieCd)
	{
		return new Promise((resolve, reject) => {
			var movie_header = {
                hostname: "www.kobis.or.kr",
                timeout: 2000,
                method: 'GET'
            };
            var buffer=[];
			
			var requesting = http.request(movie_header, function(res) {
		        res.on('data', chunk => {
		            buffer.push(chunk);
		        });
		        res.on('end', () => {
		            var output = null;
		            output = Buffer.concat(buffer);
					output = output.toString();
					output = JSON.parse(output);
                    //console.log(output);
                    resolve(
                        output
                    );
		        });
		    });
		requesting.on('error', (e) => {console.error(e.message);});
		requesting.end(null);
		});
	}

	async search(movieCd)
	{
		return await this.request(movieCd);
	}
}

module.exports = movielist2;
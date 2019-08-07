const http = require('http');
class movielist
{

	constructor(options)
	{
		this._options = Object.assign(options);
	}

	request(title,years)
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
                    output=output.movieListResult.movieList[0].movieCd;
                    //console.log(output);
                    resolve({
                        output:output
                    });
		        });
		    });
		requesting.on('error', (e) => {console.error(e.message);});
		requesting.end(null);
		});
	}

	async search(title,years)
	{
		return await this.request(title,years);
	}
}

module.exports = movielist;
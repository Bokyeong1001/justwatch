const movielist = require('movielist');
const movielist2 = require('movielist2');
const Naver = require('Naver');
const JustWatch = require('JustWatch');

exports.handler = async (event,context,callback) => {

		let title = event.title;
		let years = Number(event.years);
        let jyears = years-1;
        
        var justwatch = new JustWatch();

        var searchResult = await justwatch.search({query: title,release_year_from:jyears});
        console.log(searchResult.items[0]);
        var justdescript = searchResult.items[0].short_description;
		
        var Movielist = new movielist({});
		var movieResult= await Movielist.search(title,years);
        console.log(movieResult);
        var moviecd = parseInt(movieResult.output);
        console.log(moviecd);
        var Movielist2 = new movielist2({});
		var movie2Result= await Movielist2.search(moviecd);
		console.log(movie2Result);
        movie2Result =movie2Result.movieInfoResult.movieInfo;
        
        var naver = new Naver({});
        var naverResult= await naver.search(title,years);
        console.log(naverResult);
        var descript={description:justdescript};
        var movinfo = Object.assign(movie2Result, descript,naverResult);

		callback(null,movinfo);
}
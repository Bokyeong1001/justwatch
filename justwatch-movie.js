const https = require('https');
const http = require('http');
const QueryString = require('querystring');
const API_DOMAIN = 'apis.justwatch.com';

class JustWatch
{

	constructor(options)
	{
		this._options = Object.assign({locale:'ko_KR'}, options);
	}

	request(method, endpoint, params)
	{
		return new Promise((resolve, reject) => {
			params = Object.assign({}, params);
			var reqData = {
				protocol: 'https:',
				hostname: API_DOMAIN,
				path: '/content' + endpoint,
				method: method,
				headers: {}
			};
			var body = null;
			if(method==='GET')
			{
				if(Object.keys(params) > 0)
				{
					reqData.path = reqData.path+'?'+QueryString.stringify(params);
				}
			}
			else
			{
				body = JSON.stringify(params);
				reqData.headers['Content-Type'] = 'application/json';
			}
			const req = https.request(reqData, (res) => {
				let buffers = [];
				res.on('data', (chunk) => {
					buffers.push(chunk);
				});
				res.on('end', () => {
					var output = null;
					try
					{
						output = Buffer.concat(buffers);
						output = output.toString();
						output = JSON.parse(output);
					}
					catch(error)
					{
						if(res.statusCode !== 200)
						{
							reject(new Error("request failed with status "+res.statusCode+": "+res.statusMessage));
						}
						else
						{
							reject(error);
						}
						return;
					}
					
					if(output.error)
					{
						reject(new Error(output.error));
					}
					else
					{
						//console.log(output);
						resolve({
							output:output,
							statusCode:res.statusCode
						});
					}
				});
			});
			req.on('error', (error) => {
				reject(error);
			});
			req.end(body);
		});
	}

	async search(options={})
	{
		if(typeof options === 'string')
		{
			options = {query: options};
		}
		else
		{
			options = Object.assign({}, options);
		}
		var params = {
			'content_types': null,
			'presentation_types': null,
			'providers': null,
			'genres': null,
			'languages': null,
			'release_year_from': null,
			'release_year_until': null,
			'monetization_types': null,
			'min_price': null,
			'max_price': null,
			'scoring_filter_types': null,
			'cinema_release': null,
			'query': null,
			'page': null,
			'page_size': null
		};
		var paramKeys = Object.keys(params);
		for(const key in options)
		{
			if(paramKeys.indexOf(key) === -1)
			{
				throw new Error("invalid option '"+key+"'");
			}
			else
			{
				params[key] = options[key];
			}
		}
		var locale = encodeURIComponent(this._options.locale);
		return await this.request('POST', '/titles/'+locale+'/popular', params);
	}
}

exports.handler = async (event,context,callback) => {

		let title = event.title;
		let years = Number(event.years);
		let jyears=years-1;
		
        var justwatch = new JustWatch();
        var data=[];
        try{
        var searchResult = await justwatch.search({query: title,release_year_from:jyears});
        //var stat = searchResult.statusCode;
        //console.log(searchResult.statusCode);
      
        const platform = searchResult.output.items[0].offers.map(offer => {
        	return { "provider_id": offer.provider_id, "monetization_type":offer.monetization_type, "retail_price": offer.retail_price,"presentation_type": offer.presentation_type };
        });
        console.log(platform);
        for (let i = 0; i < platform.length;i++){
        	if(platform[i].provider_id==98){
        		platform[i].provider_id=-1;
        	}
        }
		for(let i=0;i<platform.length-1;i++){
			var platnum=platform[platform.length-1].provider_id;
			var monarr=[];
			var what;
			for(let j=i;j<platform.length;j++){
				if(platform[i].provider_id==platform[j].provider_id){
					platnum=platform[i].provider_id;
					break;
				}
			}
			
			for(let j=i;j<platform.length;j++){
				if(platform[i].provider_id==platform[j].provider_id){
					monarr.push(platform[j].monetization_type);
				}
				else{
					i=j-1;
					break;
				}
			}
			const montarr = monarr.filter((value, idx, arr) => monarr.indexOf(value) === idx);
			var platemp={"platform_number":platnum};
			var montemp={"monetization_type":montarr};
			what = Object.assign(platemp, montemp);
			data.push(what);
		}
		console.log(data);
		callback(null,data);
        }
        catch(error){
        callback(null,data);
        }
		
}
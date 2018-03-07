const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('sync-request');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true }));

const server = app.listen(process.env.PORT || 8080, () => {
	console.log('server listening.');
});

app.get('/',(req,res) => {
	handleQueries(req.query,res);
});

app.post('/',(req,res) => {
	handleQueries(req.body,res);
});

// JSONパース
function getSpl2StageInfo() {
	const url = 'https://spla2.yuu26.com/schedule';
	const options = {
		json: true
	};
	let response = request('GET',url,options);
	let resToJson = JSON.parse(response.getBody('utf8'));
	return resToJson;
}


// 返答
function handleQueries(q,res) {
	let json = getSpl2StageInfo();
	let mode = '';
	let rule = '';
	let maps = [];
	let startTime;
	let endTime = '';

	if (q.text) {
		switch (q.text) {
			case 'レギュラー' :
			case 'regular' :
			case 'r' :
			mode = 'レギュラーマッチ';
			rule = json['result']['regular'][0]['rule_ex']['name'];
			maps.push(json['result']['regular'][0]['maps_ex'][0]['name']);
			maps.push(json['result']['regular'][0]['maps_ex'][1]['name']);
			startTime = json['result']['regular'][0]['start']
			endTime = json['result']['regular'][0]['end'];
			break;
			case 'ガチ' :
			case 'gachi' :
			case 'g':
			mode = "ガチマッチ";
			rule = json['result']['gachi'][0]['rule_ex']['name'];
			maps.push(json['result']['gachi'][0]['maps_ex'][0]['name']);
			maps.push(json['result']['gachi'][0]['maps_ex'][1]['name']);
			startTime = json['result']['gachi'][0]['start'];
			endTime = json['result']['gachi'][0]['end'];
			break;
			case 'リーグ' :
			case 'league' :
			case 'l' :
			mode = 'リーグマッチ';
			rule = json['result']['league'][0]['rule_ex']['name'];
			maps.push(json['result']['league'][0]['maps_ex'][0]['name']);
			maps.push(json['result']['league'][0]['maps_ex'][1]['name']);
			startTime = json['result']['league'][0]['start'];
			endTime = json['result']['league'][0]['end'];
			break;
			default :
			mode = 'レギュラーマッチ';
			rule = json['result']['regular'][0]['rule_ex']['name'];
			maps.push(json['result']['regular'][0]['maps_ex'][0]['name']);
			maps.push(json['result']['regular'][0]['maps_ex'][1]['name']);
			startTime = json['result']['regular'][0]['start'];
			endTime = json['result']['regular'][0]['end'];
			break;
		}
		let start = formatDate( new Date(startTime),'MM/dd HH:mm' );
		let end = formatDate( new Date(endTime), 'MM/dd HH:mm') ;
		let data = {
			'response_type': 'in_channel',
			'text' : mode+'の、'+start+'から'+end+'までのステージとルール情報です。イカ、よろしくー！',
			'attachments': [
				{
					'text' : 'ルール：'+rule+'  ステージ：'+maps[0]+'、'+maps[1],
				}
			]
		};
		res.json(data)
	} else {
		let start = formatDate( new Date('2018-03-06T19:00:00'),'MM/dd HH:mm' );
		let end = formatDate( new Date('2018-03-06T21:00:00'), 'MM/dd HH:mm') ;
		console.log(start+""+end);
		
		let data = {
			'response_type': 'ephemeral',
			'text': '「レギュラー」「ガチ」「リーグ」のいずれかを入力してね。',
			'attachments': [
				{
					'text' : '入力例： `/spl2 レギュラー` ',
				}
			]
		};
		res.json(data);
	}
}

function formatDate (date,format) {
	format = format.replace(/yyyy/g,date.getFullYear());
	format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
	format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
	format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
	format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
	format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
	format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
	return format;
}
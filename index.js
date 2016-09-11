'use strict';
const fs = require('fs');
const STATE_KEYS = [
	'categories', 'categorizedPhrasesCount', 'totalPhrases', 'vocabulary', 'vocabularySize',
	'categorizedWordCount', 'wordFrequencyCount'
];
const tokenizer = phrase => (
	phrase.toLowerCase().replace(/[^(a-zA-ZA-Яa-я0-9_)+\s]/g, '').split(/\s+/)
);
class Tretas{
	constructor(){
		this.tokenizer = tokenizer;
		this.vocabulary = {};
		this.vocabularySize = 0;
		this.totalPhrases = 0;
		this.categorizedPhrasesCount = {};
		this.categorizedWordCount = {};
		this.wordFrequencyCount = {};
		this.categories = {};
	}
	initializeCategory(categoryName){
		if(!this.categories[categoryName]){
			this.categorizedPhrasesCount[categoryName] = 0;
			this.categorizedWordCount[categoryName] = 0;
			this.wordFrequencyCount[categoryName] = {};
			this.categories[categoryName] = true;
		}
		return this;
	}
	learn(phrase, category){
		this.initializeCategory(category);
		this.categorizedPhrasesCount[category]++;
		this.totalPhrases++;
		let tokens = this.tokenizer(phrase);
		let frequencyTable = this.frequencyTable(tokens);
		for(let token in frequencyTable){
			if(!this.vocabulary[token]){
				this.vocabulary[token] = true;
				this.vocabularySize++;
			}
			let frequencyInPhrase = frequencyTable[token];
			if(!this.wordFrequencyCount[category][token]){
				this.wordFrequencyCount[category][token] = frequencyInPhrase;
			}else{
				this.wordFrequencyCount[category][token] += frequencyInPhrase;
			}
			this.categorizedWordCount[category] += frequencyInPhrase;
		}
		return this;
	}
	frequencyTable(tokens){
		let frequencyTable = {};
		tokens.forEach(token => {
			if(!frequencyTable[token]){
				frequencyTable[token] = 1;
			}else{
				frequencyTable[token]++;
			}
		});
		return frequencyTable;
	}
	saveData(fileName){
		let state = {};
		STATE_KEYS.forEach(key => state[key] = this[key])
		let jsonStr = JSON.stringify(state);
		return fs.writeFile(`../../${fileName}.json`,jsonStr);
	}
	loadData(path){
		let jsonData = fs.readFileSync(`../../${path}.json`, 'utf-8');
		let parsed;
		try{
			parsed = JSON.parse(jsonData);
		}catch(e){
			throw new Error('Tretas.loadData expects a valid JSON string. Error: ',e);
		}
		let analizer = new Tretas();
		STATE_KEYS.forEach(key => {
			if(!parsed[key]){
				throw new Error(`Tretas.loadData: JSON string is missing an expected property: ${key}.`);
			}
			analizer[key] = parsed[key];
		});
		return analizer;
	}
	analizer(phrase){
		let maximumProbability = Number.NEGATIVE_INFINITY;
        let phraseCategory;
        let tokens = this.tokenizer(phrase);
        let frequencyTable = this.frequencyTable(tokens);
        for(let category in this.categories){
        	let categoryProbability = this.categorizedPhrasesCount[category] / this.totalPhrases;
        	let logProbability = Math.log(categoryProbability);

        	for(let token in frequencyTable){
        		let frequencyInPhrase = frequencyTable[token];
        		let tokenProbability = this.tokenProbability(token, category);
        		logProbability += frequencyInPhrase * Math.log(tokenProbability);
        	}
        	if(logProbability > maximumProbability){
        		maximumProbability = logProbability;
        		phraseCategory = category;
        	}
        }
        return console.log(phraseCategory);
	}
	tokenProbability(token, category){
		let wordFrequencyCount = this.wordFrequencyCount[category][token] || 0;
		let categorizedWordCount = this.categorizedWordCount[category];
		return (wordFrequencyCount + 1) / (categorizedWordCount + this.vocabularySize);
	}
}
module.exports = function(){
	return new Tretas();
}
# Treta has been planted!


```javascript
const Tretas = require('treta');

// if you want to train
const treta = new Tretas();

treta.learn('phrase with treta', 'treta');
treta.learn('another phrase with treta', 'treta');
treta.learn('another other phrase with treta', 'treta');
treta.learn('phrase without treta', 'noTreta');

// for save your train
treta.saveData('data');
// => data.json

// else - use a data.json

treta.loadData('data');

// return if the phrase have or not Treta (treta or noTreta)
treta.analizer('kind of treta');
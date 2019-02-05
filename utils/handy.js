module.exports.extractFromArray = function(array, field){
    var resultArray = [];
    for(let i in array){
        resultArray.push(array[i][field])
    }
    return resultArray;
}
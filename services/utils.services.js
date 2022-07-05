
function to(promise) {
    return new Promise(function (resolve, reject) {
        promise
            .then(data => {
                resolve([null, data])
            }).catch(err =>
                reject([err])
            );
    })
}
module.exports.to = to

function isNull(field) {
    return typeof field === 'undefined' || field === '' || field === null
}

module.exports.isNull = isNull

function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
}

module.exports.isEmpty = isEmpty

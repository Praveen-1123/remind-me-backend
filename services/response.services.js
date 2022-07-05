const ReS = (res, data) => {

    res.statusCode = 200;
    return res.json({
        success: true,
        result: data
    })
};

const ReE = (res, data, code) => {

    if (typeof code !== 'undefined') res.statusCode = code;

    return res.json({
        success: false,
        result: data
    })
};

const ReF = (res, field) => {

    res.statusCode = 400;
    return res.json({
        success: false,
        result: `${field} is required`
    })
};

module.exports = {
    ReE,
    ReS,
    ReF
}
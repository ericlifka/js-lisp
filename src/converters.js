function fnConverter(list) {
    if (!list || !list.car) {
        return "null";
    }

    var base = list.car;
    var params = [];
    while (null != (list = list.cdr)) {
        params.push(list.car);
    }

    return "" + base + "(" + params.join(", ") + ")";
}

module.exports = {
    fn: fnConverter
};

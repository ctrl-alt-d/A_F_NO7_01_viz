export const loadFixtureAsArrayBuffer = (fixture, callback) => {
    const request = new XMLHttpRequest();

    request.onerror = function () {
        callback('request-failed');
    };
    request.onload = function (event) {
        callback(null, event.target.response);
    };
    request.open('GET',  fixture);
    request.responseType = 'arraybuffer';
    request.send();
};

export const loadFixtureAsJson = (fixture, callback) => {
    const request = new XMLHttpRequest();

    request.onerror = function () {
        callback('request-failed');
    };
    request.onload = function (event) {
        try {
            callback(null, JSON.parse(event.target.response));
        } catch (err) {
            callback('request-failed');
        }
    };
    request.open('GET', fixture);
    request.send();
};

export const groupBy = (items, key) => 
    items.reduce(
        (result, item) => ({
        ...result,
        [item[key]]: [
            ...(result[item[key]] || []),
            item,
        ],
        }), 
        {},
    );

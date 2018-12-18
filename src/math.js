const add = (a, b) => {
    if (isNaN(a || isNaN(b))) {
        return undefined;
    }
    return a + b;
};

const subtract = (a, b) => {
    if (isNaN(a || isNaN(b))) {
        return undefined;
    }
    return a - b;
};

export {
    add as default,
    subtract
};
// named exports, as many as you want
// default export, can only have one

const message = 'From myModule';
const name = 'Larry';
const location = 'North Richland Hills';

const getGreeting = (name) => {
    return `Welcome to the course ${name}.`;
};

export {
    message,
    name,
    location as default,
    getGreeting
};
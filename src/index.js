import {GraphQLServer} from "graphql-yoga";

// type defs (schema)
const typeDefs = `
    type Query {
        greeting(name: String): String!,
        add(numbers: [Float!]!): Float!,
        me: User!,
        post: Post!,
        grades: [Int!]!
    }

    type User {
        id: ID!,
        name: String!,
        email: String!,
        age: Int
    }

    type Post {
        id: ID!,
        title: String!,
        body: String!,
        published: Boolean!
    }
`;

// resolvers
const resolvers = {
    Query: {
        me() {
            return {
                id: 'abc123',
                name: 'Larry Tubbs',
                email: 'larry.tubbs@example.com',
                age: 50
            };
        },

        post() {
            return {
                id: 123456,
                title: 'GraphQL is pretty cool.',
                body: 'This could solve the problems presented by our core services being so heavy.',
                published: true
            }
        },

        greeting(parent, args, ctx, info) {
            if (args.name) {
                return `Hello ${args.name}!`;
            } else {
                return 'Hello!';
            }
        }, 

        add(parent, args, ctx, info) {
            if (args.numbers.length === 0) {
                return 0;
            } 
            return args.numbers.reduce((accumulator, currentValue) => {
                return accumulator + currentValue;
            });
        },
        grades(parent, args, ctx, info) {
            return [99, 80, 93];
        }
    }
};

const server = new GraphQLServer({
    typeDefs,
    resolvers
});

server.start(() => {
    console.log('The server is up and running.');
});
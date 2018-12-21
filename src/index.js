import {GraphQLServer} from "graphql-yoga";

// demo data
const users = [{
    id: '1',
    name: 'Larry',
    email: 'larry@example.com',
    age: 40
}, {
    id: '2',
    name: 'Lori',
    email: 'lori@example.com',
    age: 38
}, {
    id: '3',
    name: 'Emily',
    email: 'emily@example.com',
    age: 15
}, {
    id: '4',
    name: 'Sophia',
    email: 'sophia@example.com',
    age: 12
}];

const posts = [{
    id: '11',
    title: 'GraphQL is pretty cool',
    body: 'This could be the future of API development.  We\'ll see.',
    published: true,
    author: '1'
}, {
    id: '12',
    title: 'Does it break the interface contracts of REST?',
    body: 'REST provides a very predictable interface.  Will GraphQL generate APIs that are supportable?',
    published: true,
    author: '1'
}, {
    id: '13',
    title: 'Time will tell',
    body: '',
    published: false,
    author: '2'
}];

const comments = [{
    id: 101,
    text: 'I think it just might be.',
    author: '1',
    post: '11'
}, {
    id: 102,
    text: 'This could really help us on core services.',
    author: '1',
    post: '11'
}, {
    id: 103,
    text: 'Maybe not.  The resolvers seem to be written in such a way as to maximize performance.',
    author: '2',
    post: '12'
}, {
    id: 104,
    text: 'This is fun',
    author: '3',
    post: '12'
}];

// type defs (schema)
const typeDefs = `
    type Query {
        me: User!
        users(query: String): [User!]!
        post: Post!
        posts(query: String): [Post!]!
        comments: [Comment!]!
    }

    type User {
        id: ID!,
        name: String!,
        email: String!,
        age: Int,
        posts: [Post!]!
        comments: [Comment!]!
    }

    type Post {
        id: ID!,
        title: String!,
        body: String!,
        published: Boolean!,
        author: User!
        comments: [Comment]!
    }

    type Comment {
        id: ID!
        text: String!
        author: User!
        post: Post!
    }
`;

// resolvers
const resolvers = {
    Query: {
        users(parent, args, ctx, info) {
            if (! args.query) {
                return users;
            };

            return users.filter((user) => {
                return user.name.toLowerCase().includes(args.query.toLowerCase());
            });
        },

        posts(parent, args, ctx, info) {
            if (! args.query) {
                return posts;
            };

            return posts.filter((post) => {
                return post.title.toLowerCase().includes(args.query.toLowerCase()) || 
                        post.body.toLowerCase().includes(args.query.toLowerCase()) ;
            });
        },
        
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
        
        comments(parent, args, ctx, info) {
            return comments;
        }
    },
    Post: {
        author (parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author;
            });
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.post === parent.id;
            });
        }
    },
    User: {
        posts (parent, args, ctx, info) {
            return posts.filter((post) => {
                return post.author === parent.id;
            });
        },
        comments (parent, args, ctx, info) {
            return comments.filter((comment) => {
                return comment.author === parent.id;
            });
        }
    },
    Comment: {
        author (parent, args, ctx, info) {
            return users.find((user) => {
                return user.id === parent.author;
            });
        },
        post (parent, args, ctx, info) {
            return posts.find((post) => {
                return post.id === parent.post;
            });
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
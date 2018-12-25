import {GraphQLServer} from "graphql-yoga";
import uuidv4 from "uuid/v4";

// demo data
let users = [{
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

let posts = [{
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

let comments = [{
    id: "101",
    text: 'I think it just might be.',
    author: '1',
    post: '11'
}, {
    id: "102",
    text: 'This could really help us on core services.',
    author: '1',
    post: '11'
}, {
    id: "103",
    text: 'Maybe not.  The resolvers seem to be written in such a way as to maximize performance.',
    author: '2',
    post: '12'
}, {
    id: "104",
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

    type Mutation {
        createUser(data: CreateUserInput!): User!
        deleteUser(id: ID!): User!
        createPost(data: CreatePostInput!): Post!
        deletePost(id: ID!): Post!
        createComment(data: CreateCommentInput): Comment!
        deleteComment(id: ID!): Comment!
    }

    input CreateUserInput {
        name: String!,
        email: String!,
        age: Int
    }

    input CreatePostInput {
        title: String!, 
        body: String!, 
        published: Boolean!, 
        author: ID!
    }

    input CreateCommentInput {
        text: String!, 
        author: ID!, 
        post: ID!
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
    },
    Mutation: {
        createUser (parent, args, ctx, info) {
            // ensure user isn't already in the array by email
            const emailTaken = users.some((user) => {
                return user.email === args.data.email;
            });
            if (emailTaken) {
                throw new Error(`Already have a user with the email ${args.data.email}`);
            };
            const user = {
                id: uuidv4(),
                ...args.data
            };
            users.push(user);
            return user;
        },
        deleteUser (parent, args, ctx, info) {
            // if user found
            const userIndex = users.findIndex((user) => {
                return user.id === args.id;
            });
            if (userIndex === -1) {
                throw new Error('User not found.');
            }
            // delete all comments
            comments = comments.filter((comment) => {
                return comment.author !== args.id;
            });
            // delete all posts
            posts = posts.filter((post) => {
                const match = post.author === args.id
                // if match, delete its comments
                if (match) {
                    comments = comments.filter((comment) => {
                        return comment.post !== post.id;
                    });
                };
                return !match; // keep only non-matched posts
            });
            // delete the user
            const deletedUsers = users.splice(userIndex, 1);
            return deletedUsers[0];
        },
        createPost (parent, args, ctx, info) {
            // make sure the author id matches an existing user
            const userExists = users.some((user) => {
                return user.id === args.data.author;
            });
            if (!userExists) {
                throw new Error(`No user exists with id: ${args.data.author}.`);
            };
            const post = {
                id: uuidv4(),
                ...args.data
            };
            posts.push(post);
            return post;
        },
        deletePost (parent, args, ctx, info) {
            // does post exist, if not throw error
            const postIndex = posts.findIndex ((post) => {
                return post.id === args.id;
            });
            if (postIndex === -1) {
                throw new Error('Post not found.');
            };

            // remove the post
            const removedPosts = posts.splice(postIndex, 1);

            // remove all comments associated with the post
            comments = comments.filter((comment) => {
                return comment.post !== args.id;
            });

            // return the removed post
            return removedPosts[0];
        },
        createComment (parent, args, ctx, info) {
            const userExists = users.some((user) => {
                return user.id === args.data.author;
            });
            if (!userExists) {
                throw new Error(`No user exists with id: ${args.data.author}.`);
            };
            const publishedPostExists = posts.some((post) => {
                return post.id === args.data.post && post.published;
            });
            if (!publishedPostExists) {
                throw new Error(`No published post exists with id: ${args.data.post}.`);
            };
            const comment = {
                id: uuidv4(),
                ...args.data
            };
            comments.push(comment);
            return comment;
        },
        deleteComment (parent, args, ctx, info) {
            // does the comment exist, if not throw error
            const commentIndex = comments.findIndex((comment) => {
                return comment.id === args.id;
            });

            if (commentIndex === -1) {
                throw new Error('No comment found.');
            };

            // remove the comment and return it
            const foundComments = comments.splice(commentIndex, 1);
            return foundComments[0];
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
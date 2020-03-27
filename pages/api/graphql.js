import { ApolloServer } from 'apollo-server-micro'
import neo4j from 'neo4j-driver'
import { augmentedSchema } from '../../utils/graphql/schema'
import verifyIdToken from '../../utils/auth/verifyIdToken'
// import { AuthorizationError } from '../../utils/graphql/errors'

/*
 * Create a Neo4j driver instance to connect to the database
 * using credentials specified as environment variables
 * with fallback to defaults
 */
const driver = neo4j.driver(
	process.env.NEO4J_URI,
	neo4j.auth.basic(
		process.env.NEO4J_USER,
		process.env.NEO4J_PASSWORD
	)
);

const verifyAndDecodeToken = ({ req }) => {
	if (!req || !req.headers || !req.headers.authorization) {
		console.log('verifyAndDecodeToken - No authorization token')
		return null
	}
	const token = req.headers.authorization || req.headers.Authorization
	const idToken = token.replace('Bearer ', '')
	
	return verifyIdToken(idToken)
		.then(decodedToken => {
			return decodedToken
		})
		.catch(error => {
			console.log(error)
			return null
			// throw new AuthorizationError({
			// 	message: "You are not authorized for this resource"
			// });
		})
}

/*
 * Create a new ApolloServer instance, serving the GraphQL schema
 * created using makeAugmentedSchema above and injecting the Neo4j driver
 * instance into the context object so it is available in the
 * generated resolvers to connect to the database.
 */
const server = new ApolloServer({
	context: async ({ req }) => {
		const response = await verifyAndDecodeToken({ req })
		let uid = ''
		if (response) {
			uid = response.uid
		}
		
		return {
			driver,
			req,
			headers: req.headers,
			cypherParams: {
				currentUserUid: uid
			}
		}
	},
	schema: augmentedSchema,
	// introspection: true,
	// playground: true, // Disable in production
})

// Next.js API Routes reference: https://github.com/zeit/next.js#api-routes
export const config = {
	api: {
		// Body parsing is enabled by default with a size limit of 1mb for the parsed body. 
		// You can opt-out of automatic body parsing if you need to consume it as a Stream.
		bodyParser: false
	}
}

export default server.createHandler({
	path: '/api/graphql'
})
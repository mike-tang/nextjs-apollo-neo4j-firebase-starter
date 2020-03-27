export const typeDefs = `

	directive @isAuthenticated on FIELD_DEFINITION | OBJECT

	type User {
		uid: ID!
		givenName: String
		familyName: String
		username: String
		email: String
		creationTime: DateTime
		lastSignInTime: DateTime
	}

	type Query {
		allUsers: [User]
		currentUser: User @isAuthenticated
			@cypher(
				statement: """
					MATCH (user:User) 
					WHERE user.uid = $cypherParams.currentUserUid
					RETURN user
				"""
			)
		userByUsername(
			username: String
		): User!
			@cypher(
				statement: """
					MATCH (user:User)
					WHERE user.username = $username
					RETURN user
				"""
			)
	}

	type Mutation {
		CreateUser(
			uid: ID
			givenName: String
			familyName: String
			email: String
			creationTime: _Neo4jDateTimeInput
		): User 
			@cypher(
				statement: """
					CREATE (user:User {
						uid: $uid,
						givenName: $givenName,
						familyName: $familyName,
						email: $email,
						username: randomUUID(),
						creationTime: $creationTime.formatted
					})
					RETURN user
				"""
			)

		UpdateUser(
			givenName: String
			familyName: String
			username: String
		): User
			@cypher(
				statement: """
					MATCH (user:User)
					WHERE user.uid = $cypherParams.currentUserUid
					SET user.givenName = $givenName, 
							user.familyName = $familyName, 
							user.username = $username
					RETURN user
				"""
			)
		
		checkEmail(email: String): User 
			@cypher(
				statement: """
					MATCH (user:User) 
					WHERE user.email = $email
					RETURN user
				"""
			)
	}

`

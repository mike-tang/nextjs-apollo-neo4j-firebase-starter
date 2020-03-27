import { gql } from '@apollo/client'

const CREATE_USER_MUTATION = gql`
	mutation CreateUser(
		$uid: ID
		$givenName: String, 
		$familyName: String, 
		$email: String!, 
		$creationTime: _Neo4jDateTimeInput, 
	) {
		CreateUser(
			uid: $uid
			givenName: $givenName, 
			familyName: $familyName, 
			email: $email, 
			creationTime: $creationTime, 
		) {
			uid
			givenName
			familyName
			username
			email
			creationTime {
				formatted
			}
		}
	}
`

export default CREATE_USER_MUTATION
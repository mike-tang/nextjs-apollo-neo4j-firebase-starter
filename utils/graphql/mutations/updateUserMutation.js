import { gql } from '@apollo/client'

const UPDATE_USER_MUTATION = gql`
	mutation UpdateUser(
		$givenName: String, 
		$familyName: String, 
		$username: String, 
	) {
		UpdateUser(
			givenName: $givenName,
			familyName: $familyName,
			username: $username,
		) {
			givenName
			familyName
			username
		}
	}
`

export default UPDATE_USER_MUTATION
import { gql } from '@apollo/client'

const USER_BY_USERNAME_QUERY = gql`
	query userByUsername(
		$username: String
	) {
		userByUsername(
			username: $username
		) {
			givenName
			familyName
			username
			email
			creationTime {
				formatted
			}
			lastSignInTime {
				formatted
			}
		}
	}
`

export default USER_BY_USERNAME_QUERY
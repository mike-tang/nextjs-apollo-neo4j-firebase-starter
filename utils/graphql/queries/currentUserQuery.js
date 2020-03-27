import { gql } from '@apollo/client'

const CURRENT_USER_QUERY = gql`
	query currentUser {
		currentUser {
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

export default CURRENT_USER_QUERY
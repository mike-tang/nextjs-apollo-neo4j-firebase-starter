import { gql } from '@apollo/client'

const CHECK_EMAIL_MUTATION = gql`
	mutation checkEmail(
		$email: String
	) {
		checkEmail(
			email: $email
		) {
			email
		}
	}
`

export default CHECK_EMAIL_MUTATION
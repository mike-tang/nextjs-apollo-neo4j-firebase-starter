import * as admin from 'firebase-admin'
import initFirebaseAdmin from '../../utils/auth/firebase-admin'

const verifyIdToken = (idToken) => { 
	console.log('Verifying id token...')
	initFirebaseAdmin()

	return admin
		.auth()
		.verifyIdToken(idToken)
		.catch(error => {
			throw error
		})
}

export default verifyIdToken
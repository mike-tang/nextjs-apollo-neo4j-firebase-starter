import verifyIdToken from '../../utils/auth/verifyIdToken'
import cookies from '../../utils/auth/cookies'

const handler = (req, res) => {
	if (!req.body) {
		return res.status(400)
	}

	const idToken = req.body.idToken // Stringified on client-side
	const refreshToken = req.body.refreshToken // Stringified on client-side

	// Decode the user's Firebase token and make available for the client
	return verifyIdToken(idToken)
		.then(decodedToken => {
			let firebaseUid = decodedToken.uid
			console.log('Token verified by Firebase Admin. Attempting to set cookie...')
			// Set cookie policy for session cookie.
			const expiresIn = 60 * 60 * 24 * 5 * 1000
			res.cookie('refreshToken', refreshToken, {
				maxAge: expiresIn, 
				httpOnly: true,
				path: '/',
				sameSite: 'lax', 
				secure: (process.env.NODE_ENV === 'production')
			})
			return firebaseUid
		})
		.then((firebaseUid) => {
			console.log('refreshToken has been set in cookie!')
			return res.status(200).json({ status: true, firebaseUid })
		})
		.catch(error => {
			return res.status(500).json({ error })
		})
}

export default cookies(handler)
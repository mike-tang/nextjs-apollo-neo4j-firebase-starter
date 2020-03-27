// import cookies from '../../utils/auth/cookies'
// import cookie from 'cookie'
import fetch from 'isomorphic-unfetch'

// Firebase refresh token reference:
// https://firebase.google.com/docs/reference/rest/auth#section-refresh-token

const handler = async (req, res) => {
	console.log('Running refresh-token api...')
	const refreshToken = req.cookies['refreshToken']
	// console.log('✓ --- API refreshToken: ' + refreshToken)
	
	if (!refreshToken) {
		return res.status(400).json({
			status: false
		})
	}
	
	// fetch the accessToken from Firebase endpoint
	try {
		const response = await fetch(process.env.FIREBASE_REFRESH_TOKEN_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			body: 'grant_type=refresh_token&refresh_token=' + refreshToken,
		})

		if (response.status === 200) {
			const data = await response.json()
			const accessToken = data.id_token
			// console.log('✓ --- API accessToken: ' + accessToken)
			return res.status(200).json({
				status: true, 
				accessToken 
			})
		}

		return res.json()
	}
	catch (error) {
		console.log('refresh-token error: ' + error)
		return res.status(500).json({ error })
	}

}

export default handler
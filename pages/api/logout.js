import cookies from '../../utils/auth/cookies'

const handler = async (req, res) => {
	console.log('Running logout api...')
	res.cookie('refreshToken', "", {
		httpOnly: true,
		path: '/',
		expires: new Date(0)
		// maxAge: expiresIn, 
		// sameSite: 'lax', 
		// secure: true
	})
	res.status(200).json({ status: true })
}

export default cookies(handler)
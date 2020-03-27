import * as admin from 'firebase-admin'
import initFirebaseAdmin from '../../utils/auth/firebase-admin'

const handler = (req, res) => {
	if (!req.body) {
		return res.status(400)
	}

	initFirebaseAdmin()

	const email = req.body.email // Stringified on client-side
	
	// attempt to create the user
	return admin.auth().createUser({
		email: email,
		emailVerified: false,
	})
		.then(userRecord => {
			let firebaseUid = userRecord.uid
			let creationTime = userRecord.metadata.creationTime
			
			// See the UserRecord reference doc for the contents of userRecord.
			console.log('Successfully created new user:', userRecord.uid)
			return res.status(200).json({ status: true, firebaseUid, creationTime })
		})
		.catch(error => {
			console.log('Error creating new user: ' + error);
			return res.status(500).json({ error })
		});

}

export default handler
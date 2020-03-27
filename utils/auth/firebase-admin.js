import * as admin from 'firebase-admin'

const config = {
	projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
	clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
	privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
}

function initFirebaseAdmin() {
	if (!admin.apps.length) {
		admin.initializeApp({
			credential: admin.credential.cert(config)
		})
	}
}

export default initFirebaseAdmin
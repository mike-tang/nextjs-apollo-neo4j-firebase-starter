import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAuth } from '../utils/auth/use-auth'

async function handleSignIn(auth, router, setState) {
	console.log('************ Running handleSignIn function...')
	const pathname = router.asPath
	const isValidSignInLink = await auth.verifySignInLink(pathname)

	if (isValidSignInLink) {
		console.log('*************** Sign in link is valid')
		let email = window.localStorage.getItem('emailForSignIn')
		
		if (!email) {
			console.log('****************** Email not found in localStorage')
			// email = window.prompt('Please provide the email you\'d like to sign-in with for confirmation.');
			router.push('/notifications/email-error-not-found')
			// return null
		}

		if (email) {
			console.log('****************** Email found. now trying to sign in...')
			setState({
				verifying: false,
				email: email,
				authenticating: true		
			})

			await auth.signInWithEmailLink(email, pathname)
			
		}

	} else {
		console.log('****************** Invalid sign in link: ' + pathname)
		router.push('/notifications/email-error-invalid-link')
	}
}

function Callback() {
	console.log('********* Rendering Callback component...')
	const router = useRouter()
	const auth = useAuth()
	const loading = auth.authState.loading
	const error = auth.authState.error
	const user = auth.authState.user
	const [state, setState] = useState(() => {
		return {
			verifying: true,
			email: null,
			authenticating: false
		}
	})

	useEffect(() => {
		if (!loading && !user) {
			handleSignIn(
				auth, 
				router, 
				setState
			)
		}

		if (user) {
			console.log('User signed in! Redirecting...')
			router.push('/notifications/email-verified')
		}

		if (error) {
			router.push('/notifications/email-error')
		}
	}, [
		user, 
		error, 
		loading, 
		auth, 
		router
	])

	return (
		<>
			<Head>
				<title>Verifying...</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			{state.verifying &&
				<p>Verifying link...</p>
			}

			{state.authenticating && state.email &&
				<p>Signing in as {state.email}...</p>
			}

		</>
	)
}

export default Callback
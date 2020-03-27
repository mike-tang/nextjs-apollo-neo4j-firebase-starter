import React, { useState, useEffect, useContext, createContext } from 'react'
import * as firebase from 'firebase/app'
import initFirebaseClient from './firebase-client'
import fetch from 'isomorphic-unfetch'
import { useApolloClient } from '@apollo/client'

// Initialize Firebase Client
initFirebaseClient()

const authContext = createContext()

// Provider component that wraps your app and makes auth object
// available to any child component that calls useAuth()
// eslint-disable-next-line react/prop-types
export function AuthProvider({ children }) {
	const auth = useAuthProvider()
	return <authContext.Provider value={auth}>{children}</authContext.Provider>
}

// Hook for child components to get the auth object
// and re-render when it changes
export const useAuth = () => {
	return useContext(authContext)
}

// Provider hook that creates auth object and handles state
function useAuthProvider() {
	const client = useApolloClient()
	const [authState, setAuthState] = useState(() => {
		// fetch user from refresh-token api?
		const user = firebase.auth().currentUser
		return {
			loading: !user,
			error: null,
			user
		}
	})

	const actionCodeSettings = {
		// URL you want to redirect back to. The domain (www.example.com) for this
		// URL must be whitelisted in the Firebase Console.
		url: process.env.FIREBASE_AUTH_REDIRECT_URL,
		handleCodeInApp: true, // This must be true for passwordless sign in.
	}

	// Wrap any Firebase methods we want to use
	// and save the user to state

	const sendSignInLink = (email) => {
		console.log('-- use-auth: sendSignInLink')
		return firebase
			.auth()
			.sendSignInLinkToEmail(email, actionCodeSettings)
			.then(() => {
				console.log('---- Sign in link sent!')
				window.localStorage.setItem('emailForSignIn', email)
				console.log('---- Email (' + email + ') saved to local storage')
			})
			.catch(error => {
				console.log('---- sendSignInLink error: ' + error.code)
				setAuthState({
					loading: false,
					error: error,
					user: false
				})
			})
	}

	const verifySignInLink = (pathname) => {
		console.log('---------- use-auth: verifySignInLink')
		return firebase
			.auth()
			.isSignInWithEmailLink(pathname)
	}

	const signInWithEmailLink = (email, pathname) => {
		console.log('-------------- use-auth: signInWithEmailLink')
		return firebase
			.auth()
			.signInWithEmailLink(email, pathname)
			.then(result => {
				console.log('---------------- Signed in as: ' + result.user.email)
				
				// Clear the URL to remove the sign-in link parameters.
				if (history && history.replaceState) {
					window.history.replaceState({}, document.title, pathname.split('?')[0]);
					console.log('---------------- URL sign in link parameters removed')
				}

				// Clear email from storage.
				window.localStorage.removeItem('emailForSignIn')
				console.log('---------------- Email removed from local storage')

				return result
			})
			.catch(error => {
				// Handle Errors here.
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log(errorCode)
				console.log(errorMessage)
				setAuthState({
					loading: false,
					error: error,
					user: false
				})
				throw error
			})
	}

	const signOut = () => {
		return firebase
			.auth()
			.signOut()
			.then( async () => {
				const response = await fetch('/api/logout', {
					method: 'POST',
					credentials: 'same-origin',
				})
				if (response.status === 200) {
					client.resetStore()
					console.log('client store reset')
					setAuthState({
						loading: false,
						error: false,
						user: false
					})
				}
				console.log('Signed out')
			})
			.catch(error => {
				console.log(error)
				throw error
			})
	}

	// const [UpdateUser] = useMutation(UPDATE_USER_MUTATION)

	// Subscribe to user on mount
	// This sets state in the callback so it will cause
	// any component that utilizes this hook to re-render 
	// with the latest auth object
	useEffect(() => {
		console.log('-------------------------------------')
		console.log('-- use-auth useEffect - initiating...')
		const unsubscribe = firebase.auth().onAuthStateChanged(user => {
			if (user) {
				console.log('---- use-auth useEffect - user detected: ' + user.email)
				const refreshToken = user.refreshToken
				
				user.getIdToken(/* forceRefresh */ true)
					.then(async idToken => {
						//	Verify idToken with /api/login
						try {
							console.log('------ sending token to /api/login...')
							const response = await fetch('/api/login', {
								method: 'POST',
								// eslint-disable-next-line no-undef
								headers: new Headers({ 'Content-Type': 'application/json' }),
								credentials: 'same-origin',
								body: JSON.stringify({ 
									idToken, 
									refreshToken 
								}),
							})
							if (response.status === 200) {
								console.log('-------- cookie has been set')
								
								setAuthState({
									loading: false,
									error: false,
									user: user
								})

								// const data = await response.json()
								// const firebaseUid = data.firebaseUid
								// const lastSignInTime = dayjs.utc().format()

								// const apolloResponse = await UpdateUser({
								// 	variables: {
								// 		uid: firebaseUid,
								// 		lastSignInTime: {formatted: lastSignInTime}
								// 	},
									
								// })
				
								// if (apolloResponse && apolloResponse.data) {
								// 	// Set auth state after user has been updated in db
								// 	setAuthState({
								// 		loading: false,
								// 		error: false,
								// 		user: user
								// 	})
								// 	console.log('---------- user has been set in authContext')
								// }
							}
							
						} catch (error) {
							console.log('-------- use-auth useEffect: invalid token')
							signOut()
						}
					})
			} else {
				// Log out
				console.log('---- use-auth useEffect: user not found')
				// signOut() // This 
				setAuthState({
					loading: false,
					error: false,
					user: false
				})
			}
		})

		// Clean up subscription on unmount
		return () => unsubscribe()
	}, [])

	// Return the user object and auth methods
	return {
		authState,
		sendSignInLink,
		verifySignInLink,
		signInWithEmailLink,
		signOut
	}
}
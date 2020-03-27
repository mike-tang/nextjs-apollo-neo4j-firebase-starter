import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Nav from '../components/nav'
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router'
import { useAuth } from '../utils/auth/use-auth'
import { useMutation } from '@apollo/client'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import * as yup from 'yup'
import CREATE_USER_MUTATION from '../utils/graphql/mutations/createUserMutation'

dayjs.extend(utc)

const schema = yup.object().shape({
	givenName: yup.string().required().trim(),
	familyName: yup.string().required().trim(),
  email: yup.string().required().email('Invalid email').trim().lowercase()
})

// Create a login form component that will show when current user is not detected
function SignUpForm() {
	console.log('SignUpForm() initiating...')
	// Get auth state and re-render anytime it changes
	const auth = useAuth()
	const [signUpState, setSignUpState] = useState(() => {
		return {
			loading: false,
			error: null,
			success: false
		}
	})

	const [CreateUser] = useMutation(CREATE_USER_MUTATION)
	
	const { handleSubmit, register, errors } = useForm({
		validationSchema: schema
	})

	const onSubmit = async values => {
		console.log('Attempting to create user...')
		setSignUpState({
			loading: true,
			error: null,
			success: false
		})
				
		const email = values.email
		const givenName = values.givenName
		const familyName = values.familyName

		try {
			const firebaseResponse = await fetch('/api/signup', {
				method: 'POST',
				headers: new Headers({ 'Content-Type': 'application/json' }),
				credentials: 'same-origin',
				body: JSON.stringify({
					email
				}),
			})

			if (firebaseResponse.status === 200) {
				const firebaseUser = await firebaseResponse.json()
				const firebaseUid = firebaseUser.firebaseUid
				const creationTime = dayjs(firebaseUser.creationTime).utc().format()

				const apolloResponse = await CreateUser({
					variables: { 
						uid: firebaseUid,
						givenName: givenName,
						familyName: familyName,
						email: email,
						creationTime: {
							formatted: creationTime
						}
					}
				})

				if (apolloResponse && apolloResponse.data) {
					const email = apolloResponse.data.CreateUser.email
					auth.sendSignInLink(email)
					setSignUpState({
						loading: false,
						error: null,
						success: true
					})
				}

			}
			if (firebaseResponse.status === 500) {
				const data = await firebaseResponse.json()
				const firebaseError = data.error.message
				setSignUpState({
					loading: false,
					error: firebaseError,
					success: false
				})
			}
		} catch (error) {
			console.log('Error creating new user: ' + error)
			throw error
		}
	}

	if (signUpState.success) {
		return (
			<>
				<div className="hero">
					<h1 className="title">Almost done!</h1>
					<div className="row">
						<p>Verify your email to finish creating your account.</p>
					</div>
				</div>
				<style jsx>{`
					.hero {
						width: 100%;
						color: #333;
					}
					.title {
						margin: 0;
						width: 100%;
						padding-top: 80px;
						line-height: 1.15;
						font-size: 48px;
					}
					.title,
					.description {
						text-align: center;
					}
					.row {
						max-width: 880px;
						margin: 80px auto 40px;
						display: flex;
						flex-direction: row;
						justify-content: space-around;
					}
				`}</style>
			</>
		)
	}

	return (
		<>
			<div className="hero">
				<h1 className="title">Create an account</h1>
				<div className="row">
					<form onSubmit={handleSubmit(onSubmit)}>
						<div>
							<input 
								name="givenName" 
								type="text" 
								placeholder="First name" 
								ref={register} 
							/>
							<br />
							{errors.givenName && errors.givenName.message}
						</div>
						<div>
							<input 
								name="familyName" 
								type="text" 
								placeholder="Last name" 
								ref={register} 
							/>
							<br />
							{errors.familyName && errors.familyName.message}
						</div>
						<div>
							<input
								name="email"
								type="text"
								placeholder="Email"
								autoComplete="on"
								ref={register}
							/>
							<br />
							{errors.email && errors.email.message}
						</div>
						<div>
							<button 
								type="submit"
							>
								Submit
							</button>
						</div>
						{signUpState.loading && <p>Creating account...</p>}
						{signUpState.error && <p>{signUpState.error}</p>}
					</form>
				</div>
			</div>

			<style jsx>{`
				.hero {
					width: 100%;
					color: #333;
				}
				.title {
					margin: 0;
					width: 100%;
					padding-top: 80px;
					line-height: 1.15;
					font-size: 48px;
				}
				.title,
				.description {
					text-align: center;
				}
				.row {
					max-width: 880px;
					margin: 80px auto 40px;
					display: flex;
					flex-direction: row;
					justify-content: space-around;
				}
			`}</style>
		</>
	)
}

function SignUp() {
	console.log('SignUp page initiating...')
	const router = useRouter()
	const auth = useAuth()
	const loading = auth.authState.loading
	const error = auth.authState.error
	const user = auth.authState.user

	useEffect(() => {
		if (user) {
			console.log('Login page user: ' + user.email)
			console.log('User signed in! Redirecting to home page...')
			router.push('/')
		}
	}, [router, user])
	
	return (
		<>
			<Head>
				<title>Create an account</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			{loading && 
				<p>Loading...</p>
			}

			{!loading && !user && !error &&
				<SignUpForm />
			}

		</>
	)
}

export default SignUp
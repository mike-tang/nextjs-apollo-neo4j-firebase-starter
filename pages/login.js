import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Nav from '../components/nav'
import { useForm } from "react-hook-form";
import { useRouter } from 'next/router'
import { useAuth } from '../utils/auth/use-auth'
import { useMutation } from '@apollo/client'
import CHECK_EMAIL_MUTATION from '../utils/graphql/mutations/checkEmailMutation'
import * as yup from 'yup'

const schema = yup.object().shape({
  email: yup.string().required().email('Invalid email').trim().lowercase()
})

// Create a login form component that will show when current user is not detected
function LoginForm() {
	console.log('LoginForm() initiating...')
	// Get auth state and re-render anytime it changes
	const auth = useAuth()
	const [signInState, setSignInState] = useState(() => {
		return {
			loading: false,
			error: null,
			success: false
		}
	})

	const [checkEmail] = useMutation(CHECK_EMAIL_MUTATION)

	const { handleSubmit, register, errors } = useForm({
		validationSchema: schema
	})

	const onSubmit = async values => {
		setSignInState({
			loading: true,
			error: null,
			success: false
		})

		try {
			const response = await checkEmail({
				variables: {
					email: values.email
				}
			})

			if (response && response.data) {
				const email = response.data.checkEmail.email
				console.log('response email: ' + email)
				auth.sendSignInLink(email)
					.then(() => {
						setSignInState({
							loading: false,
							error: null,
							success: true
						})
					})
					.catch(error => {
						console.log(error)
						throw error
					})
				
			}
		} catch(error) {
			console.log('error: ' + error)
			setSignInState({
				loading: false,
				error: error,
				success: false
			})
		}
	}

	if (signInState.success) {
		return (
			<>
				<div className="hero">
					<h1 className="title">Sign in link sent!</h1>
					<div className="row">
						<p>Check your email to finish signing in.</p>
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
		<div>
			<div className="hero">
				<h1 className="title">Log in</h1>

				<div className="row">
					<form onSubmit={handleSubmit(onSubmit)}>
						<input
							name="email"
							ref={register}
							autoComplete="on"
						/>

						<button 
							type="submit"
						>
							Send me a sign in link
						</button>
						{errors.email && <p>{errors.email.message}</p>}
						{signInState.loading && <p>...</p>}		
						{signInState.error && <p>Email could not be found</p>}
						
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
		</div>
	)
}


function Login() {
	console.log('Login() initiating...')
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
			
			// window.location.assign('/') 
			// Can't use this because it'll only reload tabs with the login page
			// Need solution that can add auth headers to all open tabs
		}
	}, [router, user])
	
	return (
		<>
			<Head>
				<title>Login</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			{loading && 
				<p>Loading...</p>
			}

			{!loading && !user && !error &&
				<LoginForm />
			}

		</>
	)
}

export default Login
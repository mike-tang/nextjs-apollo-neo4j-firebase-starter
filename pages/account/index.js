import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Nav from '../../components/nav'
import { useAuth } from '../../utils/auth/use-auth'
import { useQuery, useMutation } from '@apollo/client'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import CURRENT_USER_QUERY from '../../utils/graphql/queries/currentUserQuery'
import UPDATE_USER_MUTATION from '../../utils/graphql/mutations/updateUserMutation'

const schema = yup.object().shape({
	givenName: yup
		.string()
		.required()
		.trim(),
	familyName: yup
		.string()
		.required()
		.trim(),
	username: yup
		.string()
		.required()
		.matches(/^[a-zA-Z0-9-]+$/, 'Only letters, numbers, and hyphens can be used')
		.min(1)
		.max(16)
		.trim(),
  // email: yup.string().required().email('Invalid email').trim().lowercase()
})

function UpdateUserForm() {
	console.log('UpdateUserForm() initiating...')

	// Initiate form field values
	const [givenName, setGivenName] = useState('')
	const [familyName, setFamilyName] = useState('')
	const [username, setUsername] = useState('')

	// Define Current User Query
	const { 
		loading: queryLoading, 
		error: queryError, 
		data: queryData 
	} = useQuery(CURRENT_USER_QUERY, {
		fetchPolicy: 'network-only',
		onCompleted: (() => {
			console.log('current user query completed')
			setGivenName(queryData.currentUser.givenName)
			setFamilyName(queryData.currentUser.familyName)
			setUsername(queryData.currentUser.username)
		})
	})
	
	const [formState, setFormState] = useState(() => {
		return {
			loading: false,
			error: null,
			success: false
		}
	})

	// Define Update User Mutation
	const [UpdateUser] = useMutation(UPDATE_USER_MUTATION)

	const { handleSubmit, register, errors, triggerValidation } = useForm({
		validationSchema: schema
	})

	const onSubmit = async () => {
		setFormState({
			loading: true,
			error: null,
			success: false
		})

		try {
			// Run UpdateUser mutation
			const response = await UpdateUser({
				variables: {
					givenName: givenName,
					familyName: familyName,
					username: username
				}
			})

			if (response && response.data) {
				console.log('User updated')
				setFormState({
					loading: false,
					error: null,
					success: true
				})
			}
		} catch(error) {
			console.log(error)
			setFormState({
				loading: false,
				error: error,
				success: false
			})
		}
	}

	return (
		<div>
			<div className="hero">
				<div className="row">
					{queryLoading && ''}
					
					{queryError && <p>Error loading, please try refreshing the page</p>}
					
					{queryData && 
						<form onSubmit={handleSubmit(onSubmit)}>
							<div>
								<input 
									name="givenName"
									type="text"
									label="First name"
									placeholder="First name"
									ref={register}
									value={givenName}
									onChange={e => {
										setFormState({
											loading: false,
											error: null,
											success: false
										})
										setGivenName(e.target.value);
									}}
									onBlur={() => {
										triggerValidation('givenName')
									}}
								/>
								<br />
								{errors.givenName && errors.givenName.message}
							</div>
							<div>
								<input 
									name="familyName" 
									type="text" 
									label="Last name"
									placeholder="Last name" 
									ref={register}
									value={familyName}
									onChange={e => {
										setFormState({
											loading: false,
											error: null,
											success: false
										})
										setFamilyName(e.target.value);
									}}
									onBlur={() => {
										triggerValidation('familyName')
									}}
								/>
								<br />
								{errors.familyName && errors.familyName.message}
							</div>
							<div>
								<input
									name="username"
									type="text"
									label="Username"
									placeholder="Username"
									ref={register}
									value={username}
									onChange={e => {
										setFormState({
											loading: false,
											error: null,
											success: false
										})
										setUsername(e.target.value);
									}}
									onBlur={() => {
										console.log('triggering validation: username')
										triggerValidation('username')
									}}
								/>
								<br />
								{errors.username && errors.username.message}
							</div>
							<div>
								<button 
									type="submit"
								>
									{formState.loading 
										? '...'
										: 'Update'
									}
								</button>
							</div>
							{formState.success && <p>Updated!</p>}
							{formState.error && <p>Something went wrong, please try again</p>}
							
						</form>
					}
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

// ADD CHECK USERNAME QUERY / UNIQUE CONSTRAINT IN DB

function Account() {
	const auth = useAuth()
	const loading = auth.authState.loading
	// const error = auth.authState.error
	const user = auth.authState.user

	return (
		<>
			<Head>
				<title>Account</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			{loading && 
				<div className="hero">
					<h1 className="title">Loading...</h1>
				</div>
			}

			{!loading && !user &&
				<div className="hero">
					<h1 className="title">Log in to view your account</h1>
					<div className="row">
						<Link href="/login">
							<a>Log in</a>
						</Link>
					</div>
				</div>
			}

			{!loading && user && 
				<div className="hero">
					<h1 className="title">Account</h1>
					<UpdateUserForm />
				</div>
			}

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

export default Account
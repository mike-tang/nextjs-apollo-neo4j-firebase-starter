import React, { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
// import Link from 'next/link'
import Nav from '../../components/nav'
import { useQuery } from '@apollo/client'
import USER_BY_USERNAME_QUERY from '../../utils/graphql/queries/userByUsernameQuery'

const Profile = () => {
	const router = useRouter()
	const { username } = router.query

	const [givenName, setGivenName] = useState('')
	const [familyName, setFamilyName] = useState('')
	const [email, setEmail] = useState('')
	const [creationTime, setCreationTime] = useState('')
	
	// Define Current User Query
	const { 
		loading: queryLoading, 
		error: queryError, 
		data: queryData 
	} = useQuery(USER_BY_USERNAME_QUERY, {
		fetchPolicy: 'cache-first',
		variables: {
			username: username
		},
		onCompleted: (() => {
			console.log('user query completed')
			setGivenName(queryData.userByUsername.givenName)
			setFamilyName(queryData.userByUsername.familyName)
			setEmail(queryData.userByUsername.email)
			setCreationTime(queryData.userByUsername.creationTime.formatted)
		}),
	})

	return (
		<>
			<Head>
				<title>{givenName} {familyName} | Ko</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			{queryLoading && <h1>Loading...</h1>}
			{queryError && <h1>This user does not exist</h1>}
			{queryData && 
				<>
					<div className="hero">
						<h1 className="title">{givenName} {familyName}</h1>
						<div className="row">
							<p>@{username}</p>
							<p>{email}</p>
							<p>{creationTime}</p>
						</div>
					</div>
				</>
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
					display: block;
					text-align: center;
				}
			`}</style>
		</>
	)
}

export default Profile
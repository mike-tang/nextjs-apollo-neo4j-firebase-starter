import React from 'react'
import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'

export const queryUsers = gql`
	query {
		allUsers {
			givenName
			familyName
			username
		}
	}
`

const UserList = () => {
	console.log('queryUsers...')
	const { loading, error, data } = useQuery(queryUsers, {
		fetchPolicy: 'cache-first'
	});

	if (loading) {
		console.log('queryUsers fetching...')
		return null
	}
	if (error) {
		console.log('queryUsers error: ' + error)
		return null
	}

	return (
		<>
			<div className="user-list">
				{data.allUsers.map(user => (
					<Link href="/[username]" as={`/${user.username}`} key={user.username}>
						<a className="link">{user.givenName} {user.familyName}</a>
					</Link>
				))}
			</div>
			<style jsx>{`
				.link {
					display: block;
					text-align: center;
					margin-bottom: 24px;
				}
			`}</style>
		</>
	)
}

export default UserList
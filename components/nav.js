import React from 'react'
import Link from 'next/link'
import { useAuth } from '../utils/auth/use-auth'

// const links = [
//	 { href: 'https://zeit.co/now', label: 'ZEIT' },
//	 { href: 'https://github.com/zeit/next.js', label: 'GitHub' },
// ].map(link => {
//	 link.key = `nav-link-${link.href}-${link.label}`
//	 return link
// })

function Nav() {
	const auth = useAuth()
	const loading = auth.authState.loading
	// const error = auth.authState.error
	const user = auth.authState.user

	return (
		<nav>
			<ul>
				<li>
					<Link href="/">
						<a>Home</a>
					</Link>
				</li>
				<li>
					<Link href="/about">
						<a>About</a>
					</Link>
				</li>
				
				{loading && 
					<li>...</li>
				}
				{user && 
					<>
						<li>
							<Link href="/account">
								<a>{user.email}</a>
							</Link>
						</li>
						<li>
							<button onClick={() => {auth.signOut()}}>Signout</button>
						</li>
					</>
				}
				{!user && !loading &&
					<>
						<li>
							<Link href="/login">
								<a>Login</a>
							</Link>
						</li>
						<li>
							<Link href="/signup">
								<a>Join Free</a>
							</Link>
						</li>
					</>
				}
				
				{/* {links.map(({ key, href, label }) => (
					<li key={key}>
						<a href={href}>{label}</a>
					</li>
				))} */}
			</ul>

			<style jsx>{`
				:global(body) {
					margin: 0;
					font-family: -apple-system, BlinkMacSystemFont, Avenir Next, Avenir,
						Helvetica, sans-serif;
				}
				nav {
					text-align: center;
				}
				ul {
					display: flex;
					justify-content: space-between;
				}
				nav > ul {
					padding: 4px 16px;
				}
				li {
					display: flex;
					padding: 6px 8px;
				}
				a {
					color: #067df7;
					text-decoration: none;
					font-size: 13px;
				}
			`}</style>
		</nav>
	)
}

export default Nav

import React from 'react'
import Head from 'next/head'
import Nav from '../../components/nav'

function EmailNotFound() {

	// TODO: 
	// If user is logged in and page is refreshed,
	// redirect to homepage
	// ...

	return (
		<>
			<Head>
				<title>Sign In Error - Ko</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			<div className="hero">
				<h1 className="title">Email not found</h1>
				<div className="row">
					<p>Please try signing in again.</p>
					<p>Make sure to use the same device for both signing in and verifying your email.</p>
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
					display: block;
					text-align: center;
				}
			`}</style>
		</>
	)
}

export default EmailNotFound
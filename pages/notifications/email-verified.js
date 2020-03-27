import React from 'react'
import Head from 'next/head'
import Nav from '../../components/nav'

function EmailVerified() {

	// TODO: 
	// If user is logged in and page is refreshed,
	// redirect to homepage
	// ...

	return (
		<>
			<Head>
				<title>Email Address Verified - Ko</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			<div className="hero">
				<h1 className="title">Email address verified</h1>
				<div className="row">
					<p>You&apos;ve been correctly authenticated. You may now close this window.</p>
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

export default EmailVerified
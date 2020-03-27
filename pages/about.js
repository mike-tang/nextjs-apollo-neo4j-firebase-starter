import React from 'react'
import Head from 'next/head'
import Nav from '../components/nav'

function About() {
	return (
		<>
			<Head>
				<title>About</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<Nav />

			<div className="hero">
				<h1 className="title">About Ko</h1>
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
			`}</style>
		</>
	)
}

export default About
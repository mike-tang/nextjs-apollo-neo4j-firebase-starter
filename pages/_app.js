import React from 'react'
// import App from 'next/app'
import { AuthProvider } from '../utils/auth/use-auth'
import { ApolloProvider } from "@apollo/client";
import { withApollo } from '../utils/graphql/apollo-client'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps, apolloClient }) {
	return (
		<ApolloProvider client={apolloClient}>
			<AuthProvider>
				<Component {...pageProps} />
			</AuthProvider>
		</ApolloProvider>
	)
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// App.getInitialProps = async (appContext) => {
//	 // calls page's `getInitialProps` and fills `appProps.pageProps`
//	 const appProps = await App.getInitialProps(appContext);
//
//	 return { ...appProps }
// }

export default withApollo(MyApp)
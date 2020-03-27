/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
import React from 'react'
import Head from "next/head";
import { ApolloClient, from, HttpLink, InMemoryCache } from '@apollo/client'
import { onError } from "@apollo/link-error"
import { setContext } from "@apollo/link-context"
import fetch from "isomorphic-unfetch"
import cookie from "cookie"
import { getDataFromTree } from "@apollo/react-ssr"

const isServer = () => typeof window === 'undefined'

let accessToken = ''

const fetchAccessToken = async () => {
	if (accessToken) {
		console.log('fetchAccessToken accessToken already exists')
		return accessToken
	}

	try {
		const response = await fetch(process.env.REFRESH_TOKEN_URL, {
			method: 'POST',
			// headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		})

		if (response.status === 200) {
			const data = await response.json()
			accessToken = data.accessToken
			console.log('fetchAccessToken accessToken: ' + accessToken)
			return accessToken
		}
	} catch (error) {
		console.log(error)
		throw error
	}
}

/**
 * Creates and provides the apolloContext
 * to a next.js PageTree. Use it by wrapping
 * your PageComponent via HOC pattern.
 * @param {Function|Class} PageComponent
 * @param {Object} [config]
 * @param {Boolean} [config.ssr=true]
 */

export function withApollo(PageComponent, { ssr = true } = {}) {
	console.log('-- Running withApollo...')
	const WithApollo = ({ 
		apolloClient,
		serverAccessToken,
		apolloState, 
		...pageProps 
	}) => {
		if (!isServer() && !accessToken) {
			accessToken = serverAccessToken
		}
		
		const client = apolloClient || initApolloClient(apolloState)
		return (
			<PageComponent {...pageProps} apolloClient={client} />
		)
		
	}

	// Set the correct displayName in development
	if (process.env.NODE_ENV !== 'production') {
		// Find correct display name
		const displayName =
			PageComponent.displayName || PageComponent.name || 'Component'

		// Warn if old way of installing apollo is used
		if (displayName === 'App') {
			console.warn('This withApollo HOC only works with PageComponents.')
		}
		// Set correct display name for devtools
		WithApollo.displayName = `withApollo(${displayName})`
	}

	if (ssr || PageComponent.getInitialProps) {
		WithApollo.getInitialProps = async ctx => {
			console.log('withApollo getInitialProps running...')
			const { 
				AppTree,
				ctx: {req, res}
			} = ctx

			let serverAccessToken = ''

			if (isServer()) {
				const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : ''
				const refreshToken = cookies.refreshToken
				
				if (refreshToken) {
					// add refresh-token API URL to env vars
					const response = await fetch(process.env.REFRESH_TOKEN_URL, {					
						method: 'POST',
						headers: { 
							cookie: 'refreshToken=' + refreshToken
						},
						credentials: 'include',
						body: JSON.stringify({})
					})
					const data = await response.json()
					serverAccessToken = data.accessToken
					console.log('✓ --- accessToken retrieved from API: ' + serverAccessToken)
				}
			}
			
			// Initialize ApolloClient, add it to the ctx object so
      // we can use it in `PageComponent.getInitialProp`.
			const apolloClient = (
				ctx.apolloClient = initApolloClient(
					{}, 
					serverAccessToken
				)
			)

			// Run wrapped getInitialProps methods
      const pageProps = PageComponent.getInitialProps
        ? await PageComponent.getInitialProps(ctx)
				: {}
				
			// Only on the server
      if (isServer()) {				
				// When redirecting, the response is finished.
        // No point in continuing to render
				if (res && res.finished) {
          return pageProps;
        }
				
				// Only if ssr is enabled
        if (ssr) {
          try {
						// Run all GraphQL queries
            // const { getDataFromTree } = await import("@apollo/react-ssr");
						await getDataFromTree(
              <AppTree
                pageProps={{
                  ...pageProps,
                  apolloClient
								}}
								apolloClient={apolloClient}
              />
            );
          } catch (error) {
            // Prevent Apollo Client GraphQL errors from crashing SSR.
            // Handle them in components via the data.error prop:
            // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
            console.error("Error while running `getDataFromTree`", error);
          }
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        Head.rewind();
			}
			
			// Extract query data from the Apollo store
      const apolloState = apolloClient.cache.extract();

      return {
        ...pageProps,
        apolloState,
        serverAccessToken
			}
		}
	}
	
	return WithApollo
}

/**
 * Always creates a new apollo client on the server
 * Creates or reuses apollo client in the browser.
 */

let apolloClient = null

function initApolloClient(initState, serverAccessToken) {
	console.log('---- Running initApolloClient...')
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (isServer()) {
		return createApolloClient(initState, serverAccessToken)
  }

  // Reuse client on the client-side
  if (!apolloClient) {
		apolloClient = createApolloClient(initState)
  }

  return apolloClient
}

/**
 * Creates and configures the ApolloClient
 * @param  {Object} [initialState={}]
 * @param  {Object} config
 */

function createApolloClient(initialState = {}, serverAccessToken) {
	console.log('------ Running createApolloClient...')

	const authLink = setContext(async (_req, { headers }) => {
		const token = isServer() ? serverAccessToken : await fetchAccessToken()
		console.log('--- createApolloClient authLink token:  ' + token)
		return {
			headers: {
				...headers,
				authorization: token ? `Bearer ${token}` : ''
			}
		}
	})
	
	const errorLink = onError(async ({ graphQLErrors, networkError, operation, forward }) => {
		if (graphQLErrors)
			for (let err of graphQLErrors) {
				switch (err.extensions.code) {
					case 'UNAUTHENTICATED':
						// error code is set to UNAUTHENTICATED
						// when AuthenticationError thrown in resolver

						// modify the operation context with a new token
						const oldHeaders = operation.getContext().headers
						console.log('GraphQL error: ' + err.message)
						console.log('Refetching token...')
						const token = await fetchAccessToken()
						operation.setContext({
							headers: {
								...oldHeaders,
								authorization: token ? `Bearer ${token}` : ''
							},
						});
						// retry the request, returning the new observable
						return forward(operation);
				}
			}
		if (graphQLErrors)
			graphQLErrors.map(({ message, locations, path }) =>
				console.log(
					`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
				)
			)
		if (networkError) console.log(`[Network error]: ${networkError}`);
	})

	const httpLink = new HttpLink({
    uri: process.env.GRAPHQL_URI,
    credentials: "same-origin",
    fetch
  })

	return new ApolloClient({
		ssrMode: typeof window === "undefined", // Disables forceFetch on the server (so queries are only run once)
		link: from([authLink, errorLink, httpLink]),
		cache: new InMemoryCache().restore(initialState)
	})
}
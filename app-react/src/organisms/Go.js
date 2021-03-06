import React from 'react'
import makeOrganism from 'react-organism'
// import Auth0LockPasswordless from 'auth0-lock-passwordless'
import Row from '../components/Row'
import Column from '../components/Column'
import Button from '../components/Button'
import { getDecodedAuthToken, setAuthToken } from '../api'

function SignIn({
	lock,
	token,
	error,
	errorDescription,
	handlers
}) {
	return (
		<div>
			<header>
				<h1>Get Started with Collected</h1>
				<h2>{ 'Add and connect your product’s experience. Collaborate and share with the rest of your team.' }</h2>
			</header>
			<div>
				{ error && (
					<Row>
						<p>Error signing in: { error } { errorDescription }</p>
					</Row>
				) }
				{ !lock && <Row justifyContent='center'>Loading…</Row> }
				{ !!token && (
					<section>
						<Column measure={ 30 }>
							<h3>Connect</h3>
							<Button
								title='GitHub'
							/>
						</Column>
						<Column measure={ 30 }>
							<Button
								title='Add Journey'
								primary
								large
								onClick={ null }
							/>
							<p>
								Map out the journey a user takes, from the message they first see about you or your problem area, to the screens of your product, to the emails they receive both today and next month.
							</p>
						</Column>
						<Column measure={ 30 }>
							<Button
								title='Add Catalog'
								primary
								large
								onClick={ null }
							/>
							<p>
								Create an organized collection of elements needed to build your journeys, from user interface elements to pieces of reusable copy, to models that hold the shape of your content. 
							</p>
						</Column>
						<Column measure={ 30 }>
							<Button
								title='Share'
								primary
								large
								onClick={ null }
							/>
							<p>
								Invite others to collaborate on your journeys and catalogs, send private links to your documentation, and export as PDF or static HTML.
							</p>
						</Column>
						<Row justifyContent='center'>
							<Button
								title='Integrations'
								onClick={ null }
							/>
						</Row>
					</section>
				) }
				{ lock &&
					<Row justifyContent='center'>
						<Button
							title='Sign Up / In'
							primary
							large
							onClick={ handlers.signIn }
						/>
					</Row>
				}
			</div>
		</div>
	)
}

function checkSignedInState(lock) {
	// Use hash passed by Auth0
	const hash = lock.parseHash(window.location.hash)

	if (hash) {
		// Hide hash from URL
		window.location.hash = ''
		
		if (hash.id_token) {
			// Signed in successfully
			setAuthToken(hash.id_token)
		}
		else if (hash.error) {
			return {
				lock,
				error: hash.error,
				errorDescription: hash.error_description
			}
		}
	}
	
	const token = getDecodedAuthToken()
	
	return {
		lock,
		token
	}
}

export default makeOrganism(SignIn, {
	initial: () => ({ lock: null, token: null, error: null }),

	load: async (props, prevProps) => {
		if (!prevProps) {
			const { default: Auth0LockPasswordless } = await import('auth0-lock-passwordless')
			const lock = new Auth0LockPasswordless(process.env.REACT_APP_AUTH0_CLIENT_ID, process.env.REACT_APP_AUTH0_DOMAIN)
			return checkSignedInState(lock)
		}
	},

	signIn: () => ({ lock }) => {
		if (!lock) {
			return
		}
		//const query = (new URL(document.location)).searchParams
		lock.socialOrMagiclink({
			connections: ["twitter", "github", "amazon", "linkedin"],
			responseType: 'token',
			callbackURL: window.location.protocol + '//' + window.location.host + '/go',
			//callbackURL: location.protocol + '//' + location.host + '/auth0/callback/cookie',
			authParams:
				{ scope: 'openid email' // Learn about scopes: https://auth0.com/docs/scopes
				//, state: query.get('state')
			}
		});
	}
})

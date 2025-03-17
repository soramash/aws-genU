import React, { useEffect, useState } from 'react';
import { Button, Text, Loader, useAuthenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';
import { signInWithRedirect } from 'aws-amplify/auth';
import './AuthWithSAML.css'; // 追加: カスタムCSSファイルのインポート

const samlCognitoDomainName: string = import.meta.env
  .VITE_APP_SAML_COGNITO_DOMAIN_NAME;
const samlCognitoFederatedIdentityProviderName: string = import.meta.env
  .VITE_APP_SAML_COGNITO_FEDERATED_IDENTITY_PROVIDER_NAME;

type Props = {
  children: React.ReactNode;
};

const AuthWithSAML: React.FC<Props> = (props) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);

  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 認証状態の検証
    if (authStatus === 'configuring') {
      setLoading(true);
      setAuthenticated(false);
    } else if (authStatus === 'authenticated') {
      setLoading(false);
      setAuthenticated(true);
    } else {
      setLoading(false);
      setAuthenticated(false);
    }
  }, [authStatus]);

  const signIn = () => {
    signInWithRedirect({
      provider: {
        custom: samlCognitoFederatedIdentityProviderName,
      },
    });
  };

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_APP_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_APP_USER_POOL_CLIENT_ID,
        identityPoolId: import.meta.env.VITE_APP_IDENTITY_POOL_ID,
        loginWith: {
          oauth: {
            domain: samlCognitoDomainName, // cdk.json の値を指定
            scopes: ['openid', 'email', 'profile'],
            // CloudFront で展開している Web ページを動的に取得
            redirectSignIn: [window.location.origin],
            redirectSignOut: [window.location.origin],
            responseType: 'code',
          },
        },
      },
    },
  });

  return (
    <div className="auth-container">
      {loading ? (
        <div className="loading-container">
          <Text className="loading-text">Loading...</Text>
          <Loader className="loading-spinner" />
        </div>
      ) : !authenticated ? (
        <div className="login-container">
          <img
            src="https://assets.soracom.io/icon/logo/soracom-animated-loop.svg"
            alt="Soracom Logo"
            className="logo"
          />
          <Text className="login-title">
            Generative AI Use Cases on AWS
          </Text>
          <Button
            variation="primary"
            onClick={() => signIn()}
            className="login-button">
            ログイン
          </Button>
        </div>
      ) : (
        <>{props.children}</>
      )}
    </div>
  );
};

export default AuthWithSAML;

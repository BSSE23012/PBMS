import {
    CognitoUserPool,
    CognitoUserAttribute,
    CognitoUser,
    AuthenticationDetails,
} from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'us-east-1_iF7YEIpG0', // <-- Your User Pool ID
    ClientId: '7rpoo5n1lbcjeh8pl4kece4of6', // <-- Your App Client ID
};

const userPool = new CognitoUserPool(poolData);

export const signUp = (email, password, givenName, familyName) => {
    return new Promise((resolve, reject) => {

        const attributeList = [
            new CognitoUserAttribute({
                Name: 'email',
                Value: email,
            }),
            new CognitoUserAttribute({
                Name: 'given_name',
                Value: givenName,
            }),
            new CognitoUserAttribute({
                Name: 'family_name',
                Value: familyName,
            }),
        ];

        userPool.signUp(email, password, attributeList, null, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result.user);
        });
    });
};

export const confirmSignUp = (username, code) => {
    return new Promise((resolve, reject) => {
        const cognitoUser = new CognitoUser({ Username: username, Pool: userPool });
        cognitoUser.confirmRegistration(code, true, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
};

export const signIn = (email, password) => {
    return new Promise((resolve, reject) => {
        const authenticationData = { Username: email, Password: password };
        const authenticationDetails = new AuthenticationDetails(authenticationData);
        const cognitoUser = new CognitoUser({ Username: email, Pool: userPool });

        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (session) => {
                // The ID token contains user claims, including groups
                resolve(session.getIdToken().getJwtToken());
            },
            onFailure: (err) => {
                reject(err);
            },
        });
    });
};

export const signOut = () => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
        cognitoUser.signOut();
    }
};
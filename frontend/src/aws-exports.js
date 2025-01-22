// src/aws-exports.js
const awsconfig = {
  Auth: {
    region: "us-east-1", // Your Cognito region
    userPoolId: "us-east-1_UdgfkcfyY",
    userPoolWebClientId: "1v03pj7h8fd88kcmsfsbs5chbk", // Your App Client ID
    mandatorySignIn: false,
  },
};

export default awsconfig;

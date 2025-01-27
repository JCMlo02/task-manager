import React from "react";
import "./index.css";
import App from "./App";
import ReactDOM from "react-dom/client";
import AWS from "aws-sdk";
import { CognitoUserPool } from "amazon-cognito-identity-js";

// Cognito Configuration
const poolData = {
  UserPoolId: "us-east-1_IeuK7i3zR", // Your Cognito User Pool ID
  ClientId: "7kqvj4ovjqaucsq75ekphqdei5", // Your Cognito App Client ID
};

const userPool = new CognitoUserPool(poolData);

// Set AWS Region (Optional)
AWS.config.update({ region: "us-east-1" });

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App userPool={userPool} />);

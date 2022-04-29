import React, { useState } from "react";
import { Amplify, Storage } from "aws-amplify";
import { CognitoIdentityClient } from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-provider-cognito-identity";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { Container, Grid, Divider, Segment, Header } from "semantic-ui-react";
import {
  Button,
  TextField,
  Alert,
  Flex,
  withAuthenticator,
} from "@aws-amplify/ui-react";

import awsExports from "./aws-exports";
import FilesList from "./FilesList";

import "@aws-amplify/ui-react/styles.css";

import "./App.css";

export const UserContext = React.createContext();

Amplify.configure(awsExports);

function App({ isPassedToWithAuthenticator = true, signOut, user }) {
  if (!isPassedToWithAuthenticator) {
    throw new Error(`isPassedToWithAuthenticator was not provided`);
  }

  const userName = user.username;


  const client = new S3Client({
    region: awsExports.aws_user_files_s3_bucket_region,
    credentials: fromCognitoIdentityPool({
      client: new CognitoIdentityClient({
        region: awsExports.aws_user_files_s3_bucket_region,
      }),
      identityPoolId: awsExports.aws_cognito_identity_pool_id,
    }),
  });

  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState(""); 
  const [files, setFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const uploadToS3 = async () => {
    setLoading(true);
    for (let i = 0; i < uploadFiles.length; i++) {
      const fileContent = uploadFiles[i];
      const fileType = uploadFiles[i].type;
      const ext = fileContent.name.split(".").pop().toLowerCase();
      // if (!folderName) window.alert("Please enter folder name");
      const fileName =
        folderName +
        "/" +
        fileContent.name.substr(0, fileContent.name.indexOf(ext) - 1) +
        "." +
        ext;

      try {
        // Upload the file to s3 with public access level.
        await Storage.put(fileName, fileContent, {
          metadata: {
            "Created-User": userName,
          },
          contentType: fileType,
          level: "public",
          progressCallback(progress) {
            console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          },
        });
        setShowSuccessMessage(true);
      } catch (err) {
        console.log(err);
      }
    }
    setLoading(false);
    setUploadFiles([]);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  const handleChange = async (e) => {
    setUploadFiles(e.target.files);
  };

  const fetchMetadata = async (result) => {
    const fileResults = [];
    const promises = result.map(
      (file) =>
        new Promise((resolve, reject) => {
          const command = new HeadObjectCommand({
            Bucket: awsExports.aws_user_files_s3_bucket,
            Key: `public/${file.key}`,
          });
          resolve(client.send(command));
        })
    );

    Promise.all(promises).then((results) => {
      results.forEach((response, index) => {
        fileResults.push({
          ...result[index],
          createdUser: response?.Metadata?.["created-user"],
        });
      });
      setFiles(fileResults);
    });
  };

  const fetchFiles = () => {
    Storage.list(`${folderName}/`, { level: "public" }) // for listing ALL files without prefix, pass '' instead
      .then(fetchMetadata)
      .catch((error) => {
        console.error(error);
        setFiles([]);
      });
  };

  return (
    <div>
      <Grid style={{ margin: "1em" }}>
        <Grid.Row columns={2}>
          <Grid.Column>
            <h1 style={{ marginLeft: "1.5em" }}>File Management System</h1>
          </Grid.Column>
          <Grid.Column>
            <Button
              variation="primary"
              onClick={signOut}
              style={{ float: "right" }}
            >
              {`${userName}: Sign Out`}
            </Button>
          </Grid.Column>
        </Grid.Row>
      </Grid>
      <Container>
        <TextField
          size="small"
          label="Enter a Folder Name to Upload/Download files"
          value={folderName}
          onChange={(e) => setFolderName(e.currentTarget.value)}
        />
        {folderName && (
          <UserContext.Provider value={user}>
            <Header attached="top">Upload Files to S3</Header>
            <Segment placeholder attached>
              <Flex direction="row" alignItems="center">
                <input
                  type="file"
                  accept="*/*"
                  multiple={true}
                  onChange={(evt) => handleChange(evt)}
                />
                <Button
                  isLoading={loading}
                  loadingText="Uploading Files..."
                  variation="primary"
                  onClick={uploadToS3}
                >
                  Upload
                </Button>
              </Flex>
            </Segment>
            {showSuccessMessage && (
              <Alert variation="success" isDismissible={false} hasIcon={true}>
                Sucessfully Uploaded files to S3
              </Alert>
            )}
            <Divider />
            <Header attached="top">
              <Flex direction="row" alignItems="center">
                <>
                  Download Files from S3
                  <Button variation="primary" onClick={fetchFiles}>
                    Fetch files
                  </Button>
                </>
              </Flex>
            </Header>
            <Segment placeholder attached>
              <FilesList files={files} />
            </Segment>
          </UserContext.Provider>
        )}
      </Container>
    </div>
  );
}

export default withAuthenticator(App);

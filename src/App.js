import React, { useState } from "react";
import { Amplify, Storage } from "aws-amplify";
import { Container, Grid, Divider, Segment, Header } from "semantic-ui-react";
import { Button, TextField, withAuthenticator } from "@aws-amplify/ui-react";

import awsExports from "./aws-exports";
import FilesList from "./FilesList";

import "@aws-amplify/ui-react/styles.css";

export const UserContext = React.createContext();

Amplify.configure(awsExports);

function App({ isPassedToWithAuthenticator = true, signOut, user }) {
  if (!isPassedToWithAuthenticator) {
    throw new Error(`isPassedToWithAuthenticator was not provided`);
  }

  const [loading, setLoading] = useState(false);
  const [folderName, setFolderName] = useState("folder1"); // Harcoded for now
  const [files, setFiles] = useState([]);
  const [uploadFiles, setUploadFiles] = useState([]);

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
          contentType: fileType,
          level: "public",
          progressCallback(progress) {
            console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
          },
        });
      } catch (err) {
        console.log(err);
      }
    }
    setLoading(false);
    setUploadFiles([]);
  };

  const handleChange = async (e) => {
    console.log(e.target.files);
    setUploadFiles(e.target.files);
  };

  const fetchFiles = () => {
    Storage.list(`${folderName}/`, { level: "public" }) // for listing ALL files without prefix, pass '' instead
      .then((result) => setFiles(result))
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
              Sign Out
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
          <UserContext.Provider user={user}>
            <Segment placeholder>
              <Header icon>
                <div>Upload Files to S3</div>
                {loading ? (
                  <h3>Uploading Files...</h3>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="*/*"
                      multiple={true}
                      onChange={(evt) => handleChange(evt)}
                    />
                    <Button onClick={uploadToS3}>Upload</Button>
                  </>
                )}
              </Header>
            </Segment>
            <Divider />
            <Segment placeholder>
              <Header icon>
                <div>Download Files from S3</div>
                <Button onClick={fetchFiles}>Fetch files</Button>
              </Header>
              <FilesList files={files} />
            </Segment>
          </UserContext.Provider>
        )}
      </Container>
    </div>
  );
}

export default withAuthenticator(App);

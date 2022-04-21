import React, { useState } from "react";
import { Amplify, Storage } from "aws-amplify";
import { Container } from "semantic-ui-react";
import {
  Button,
  Flex,
  TextField,
  withAuthenticator,
} from "@aws-amplify/ui-react";

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
  const [folderName, setFolderName] = useState();
  const [files, setFiles] = useState([]);

  const handleChange = async (e) => {
    const fileContent = e.target.files[0];
    /*const fileName = e.target.files[0].name*/
    const fileType = e.target.files[0].type;
    let ext = fileContent.name.split(".").pop().toLowerCase();
    if (!folderName) window.alert("Please enter folder name");
    let fileName =
      folderName +
      "/" +
      fileContent.name.substr(0, fileContent.name.indexOf(ext) - 1) +
      "." +
      ext;

    try {
      setLoading(true);
      // Upload the file to s3 with public access level.
      await Storage.put(fileName, fileContent, {
        contentType: fileType,
        level: "public",
        progressCallback(progress) {
          console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
        },
      });
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
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
      <Flex>
        <h1>File Management System</h1>
        <Button variation="primary" onClick={signOut}>
          Sign Out
        </Button>
      </Flex>
      <Container text style={{ marginTop: "3em" }}>
        <UserContext.Provider user={user}>
          <div>
            <h2> Upload File to S3 </h2>
            <Flex>
              <TextField
                size="small"
                label="Folder Name"
                value={folderName}
                onChange={(e) => setFolderName(e.currentTarget.value)}
              />
              <br />
            </Flex>
            {loading ? (
              <h3>Uploading...</h3>
            ) : (
              <input
                type="file"
                accept="*/*"
                onChange={(evt) => handleChange(evt)}
              />
            )}
          </div>
          <div>
            <h2> Download File from S3 </h2>
            <Button onClick={fetchFiles}>Fetch files</Button>
            <FilesList files={files} />
          </div>
        </UserContext.Provider>
      </Container>
    </div>
  );
}

export default withAuthenticator(App);

import React from "react";
import { Button } from "@aws-amplify/ui-react";
import { Storage } from "aws-amplify";
import { isEmpty } from "ramda";

const FilesList = ({ files }) => {
  function downloadBlob(blob, filename = "download") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    const clickHandler = () => {
      setTimeout(() => {
        URL.revokeObjectURL(url);
        a.removeEventListener("click", clickHandler);
      }, 150);
    };
    a.addEventListener("click", clickHandler, false);
    a.click();
    return a;
  }

  const downloadFile = async (fileName) => {
    try {
      // Download the file from s3 with public access level.
      const result = await Storage.get(fileName, {
        download: true,
        level: "public",
      });
      downloadBlob(result.Body, fileName);
    } catch (err) {
      console.log(err);
    }
  };

  if(isEmpty(files)) return null

  return (
    <table>
      <tbody>
        <tr>
          <th>No.</th>
          <th>Name</th>
          <th>Created User</th>
        </tr>
        {files.map((file, index) => (
          <tr key={file.key}>
            <td>{index + 1}</td>
            <td>{file.key}</td>
            <td>{file.createdUser}</td>
            <td>
              <Button variation="primary" onClick={() => downloadFile(file.key)}>Download</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FilesList;

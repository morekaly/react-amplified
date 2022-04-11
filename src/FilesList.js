import React from "react";
import { Button, Flex } from "@aws-amplify/ui-react";
import { Storage } from "aws-amplify";

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
      // Download the file from s3 with private access level.
      const result = await Storage.get(fileName, {
        download: true,
        level: "private",
      });
      downloadBlob(result.Body, fileName);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <table>
      <th>
        <td>Files</td>
      </th>
      <tbody>
        {files.map((file, index) => (
          <tr key={file.key}>
            <td>{index + 1}</td>
            <td>{file.key}</td>
            <td>
              <Button onClick={() => downloadFile(file.key)}>Download</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FilesList;

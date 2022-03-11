import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { listEvidences } from './graphql/queries';
import { createEvidence as createEvidenceMutation, deleteEvidence as deleteEvidenceMutation } from './graphql/mutations';
import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
Amplify.configure(awsExports);

const initialFormState = { name: '', description: '' }

function App({ isPassedToWithAuthenticator = true, signOut, user }) {
  if (!isPassedToWithAuthenticator) {
    throw new Error(`isPassedToWithAuthenticator was not provided`);
  }

  const [evidences, setEvidence] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchEvidence();
  }, []);

  async function fetchEvidence() {
    const apiData = await API.graphql({ query: listEvidences });
    setEvidence(apiData.data.listEvidences.items);
  }

  async function createEvidence() {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createEvidenceMutation, variables: { input: formData } });
    setEvidence([ ...evidences, formData ]);
    setFormData(initialFormState);
  }

  async function deleteEvidence({ id }) {
    const newEvidenceArray = evidences.filter(evidence => evidence.id !== id);
    setEvidence(newEvidenceArray);
    await API.graphql({ query: deleteEvidenceMutation, variables: { input: { id } }});
  }

  return (
    <div className="App">
      <h1>PD Evidence Storage App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Evidence name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Evidence description"
        value={formData.description}
      />
      <button onClick={createEvidence}>Create Evidence</button>
      <div style={{marginBottom: 30}}>
        {
          evidences.map(evidence => (
            <div key={evidence.id || evidence.name}>
              <h2>{evidence.name}</h2>
              <p>{evidence.description}</p>
              <button onClick={() => deleteEvidence(evidence)}>Delete Evidence</button>
            </div>
          ))
        }
      </div>
      <button onClick={signOut}>Sign out</button>
    </div>
  );
}

export default withAuthenticator(App);
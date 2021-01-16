import { totalmem } from 'os';
import React, { useState } from 'react';
import { Translation } from './translation';

function App() {
  // states
  const [apiKey, changeApiKey ] = useState<string>("");
  const [ translated, changeTranslated ] = useState<string[]>([]);
  const [toTranslate, changeToTranslate ] = useState<string>("Welcome to unplanned message!");

  // handlers
  const updateToTranslate = (e: any) => {
      changeToTranslate(e.target.value);
  };

  const updateApiKey = (e: any) => {
      changeApiKey(e.target.value);
  };

  const startTranslation = () => {
    const t = new Translation();
    t.apiKey = apiKey;
    t.toTranslate = toTranslate;
    t.startTranslation().then((r) => {
      changeTranslated(r);
    });
    
  };


  return (
    <React.Fragment>
      <div style={ {textAlign:'center' } }>
        <h1>Welcome to unplanned message!</h1>
      </div>
      <div>
        <div>API key: <input type="text" value={apiKey} onChange={updateApiKey}/></div>
        <textarea wrap="hard" onChange={updateToTranslate} rows={20} cols={120}>{ toTranslate }</textarea>
        <div>Characters: { toTranslate.length }</div>

        <button onClick={() => startTranslation()}>Translate</button>
        <div>{ translated.map((t, i) => <p key={i}>{ t } </p>) }</div>
      </div>
    </React.Fragment>
  );
}

export default App;

import React, { FormEvent, useState } from 'react';
import { TranslationOptions, TranslationStep, translate, splitToParagraphs } from './translation';
import { Button, TextField, Container, Backdrop, CircularProgress, Card, CardContent, Typography, Grid, Slider } from '@material-ui/core';

function App() {
  // states
  const [apiKey, changeApiKey ] = useState<string>('');
  const [ translated, changeTranslated ] = useState<TranslationStep[][]>([]);
  const [toTranslate, changeToTranslate ] = useState<string>('Welcome to unplanned message!');
  const [ isWorking, changeWorking ] = useState(false);
  const [ firstLanguage, changeFirstLanguage ] = useState('');
  const [ finalLanguage, changeFinalLanguage ] = useState('de');
  const [ iterations, changeIterations ] = useState(20);

  // handlers
  const updateIterations = (e: any, n: number | number[]) => {
    if (typeof n === "number") {
      changeIterations(n);
    }
  };

  const updateFirstLanguage = (e: any) => {
      changeFirstLanguage(e.target.value);
  };

  const updateFinalLanguage = (e: any) => {
      changeFinalLanguage(e.target.value);
  };

  const updateToTranslate = (e: any) => {
      changeToTranslate(e.target.value);
  };

  const updateApiKey = (e: any) => {
      changeApiKey(e.target.value);
  };

  const startTranslation = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation();
    e.preventDefault();

    changeWorking(true);
    const translationOptions: TranslationOptions = {
      apiKey,
      firstLanguage,
      finalLanguage,
      iterations
    };

    const toTranslateParagraphs = splitToParagraphs(toTranslate);

    translate(toTranslateParagraphs, translationOptions).then((r) => {
      changeTranslated(r);
    }).finally(() => {
      changeWorking(false);
    });

  };

  const getLanguageChainString = (ts: TranslationStep[]) => {
    return [ts[0].fromLanguage,
            ...ts.map(x => x.toLanguage)
            ].join(", ");
  };

  const copyToClipboard = () => {
    var text = "";
    for (const paragraphInfo of translated) {
      const p = paragraphInfo[paragraphInfo.length-1].translated;
      const languages = getLanguageChainString(paragraphInfo);
      text += `<p>${p} <sub>(${languages})</sub></p>\n`;
    }
    // copy to cliboard as html
    const data = [
      new ClipboardItem({
        "text/html": new Blob([text], { type: "text/html" })
      })
    ];
    navigator.clipboard.write(data).then(() => {
      console.log('copied');
    }).catch((e:any) => {
      console.error('error', e);
    });

  };


  return (
    <Container maxWidth="md">
      <Card>
        <CardContent>
          <form onSubmit={startTranslation}>
            <div style={ {textAlign:'center' } }>
              <Typography variant="h2">Welcome to unplanned message!</Typography>
            </div>
            <Grid container spacing={3}>
              <Grid item xs={12}>
              <TextField id="apikey" label="API key" value={apiKey} onChange={updateApiKey} variant="outlined"/>
              </Grid>
              <Grid item xs={12}>
                <TextField id="text" label="Text to translate" multiline onChange={updateToTranslate} value={toTranslate} rows={8} variant="outlined" style={{ width: '100%'}}/>
              </Grid>
              <Typography>Characters: { toTranslate.length }</Typography>

              <Grid item xs={12}>
                <TextField id="firstLanguage" label="Source language code (optional)" value={firstLanguage} onChange={updateFirstLanguage} variant="outlined"/>
              </Grid>
              <Grid item xs={12}>
                <TextField id="finalLanguage" label="Target language code" value={finalLanguage} onChange={updateFinalLanguage} variant="outlined"/>
              </Grid>
              <Grid item xs={12}>
              <Typography gutterBottom>
                Translation iterations
              </Typography>
                <Slider valueLabelDisplay="on"
                  step={1} marks min={1} max={30} value={iterations} onChange={updateIterations} />
              </Grid>

              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary">Translate</Button>
              </Grid>
              { translated.length > 0 &&
                <Grid item xs={12}>
                  <Typography variant="h2">Translation</Typography>
                  { translated.map((t, i) => <>
                      <Typography key={i} style={{marginBottom: '1.2em'}}>{ t[t.length-1].translated }
                        <br/>
                        <sub>({getLanguageChainString(t)})</sub>
                      </Typography>
                    </>) }
                </Grid>

              }
            </Grid>
            <Grid item xs={12}>
              <Button type="button" variant="contained" onClick={e => copyToClipboard()}>Copy to clipboard</Button>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Backdrop open={isWorking} style={{zIndex: 100}}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Container>
  );
}

export default App;

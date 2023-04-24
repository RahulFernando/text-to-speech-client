import {
  ResultReason,
  SpeechConfig,
  SpeechSynthesizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { useState } from "react";

function App() {
  const [data, setData] = useState({ word: "", image: null });

  const getWord = async () => {
    const formData = new FormData();
    formData.append("image", data.image);
    formData.append("word", data.word);

    const response = await fetch(
      "http://ec2-13-213-57-146.ap-southeast-1.compute.amazonaws.com:5000/suggest_word",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: formData,
      }
    );

    return response.text();
  };

  const synthesizerHandler = async () => {
    const config = SpeechConfig.fromSubscription(
      "bbddf590ab2740fdbefc1a3f21f6355c",
      "eastus"
    );
    config.speechSynthesisLanguage = "si-LK";
    const synthesizer = new SpeechSynthesizer(config);

    try {
      const response = await getWord();

      synthesizer.speakTextAsync(`${response}`, (result) => {
        if (result.reason === ResultReason.SynthesizingAudioCompleted) {
          // play sound
          const blob = new Blob([result.audioData], { type: "audio/mpeg" });
          const url = window.URL.createObjectURL(blob);
          const audio = new Audio(url);
          audio.play();
          synthesizer.close();
        }
      });
    } catch (error) {
      console.log(error);
      synthesizer.close();
    }
  };

  const changeHandler = (e) =>
    setData({ ...data, [e.target.name]: e.target.value || e.target.files[0] });

  return (
    <div className="App">
      <input name="word" placeholder="Enter word" onChange={changeHandler} />
      <input name="image" type="file" onChange={changeHandler} />
      <button onClick={synthesizerHandler}>Speak</button>
    </div>
  );
}

export default App;

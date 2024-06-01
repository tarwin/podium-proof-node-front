<template>
  STREAM
  <template v-if="readyToRecord">
    <button @click="startRecording" v-if="!isRecording">Start Recording</button>
    <button @click="stopRecording" v-if="isRecording">Stop Recording</button>
  </template>
  <h1>Transcription</h1>
  <div v-html="transcription"></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Api from '../api'

let mediaRecorder: MediaRecorder
let socket: WebSocket

type SentimentType = {
  emotion: 'happy' | 'sad' | 'angry' | 'excited',
  amount: number,
  characterStart: number,
  characterEnd: number
}

type TranscriptionType = {
  text: string,
  sentiment: SentimentType[] | null
}

const CHUNK_TIME = 11000 // 11 seconds

export default defineComponent({
  name: 'StreamPage',
  data() {
    return {
      isRecording: false,
      readyToRecord: false,
      stream: null as null | MediaStream,

      transcription: ''
    }
  },
  mounted() {
    this.setupRecording()
  },
  methods: {
    setupRecording() {
      socket = Api.getAudioSocket()
      socket.addEventListener('message', (msg) => {
        console.log('Received message from server')
        try {
          const data = JSON.parse(msg.data)
          if (data.type === 'transcription') {
            const actualData = data as TranscriptionType
            console.log('actualData', actualData)
            if (actualData.sentiment) {
              const sentiment = actualData.sentiment
              // go through each sentiment and add it to the transcription
              let outText = actualData.text
              for (const s of sentiment) {
                const substring = `<span class="emotion ${s.emotion}">${actualData.text.substring(s.characterStart, s.characterEnd)}</span>`
                outText = outText.replace(actualData.text.substring(s.characterStart, s.characterEnd), substring)
              }
              this.transcription += ` ` + outText
            } else {
              this.transcription += ` ` + actualData.text
            }
          }
        } catch (e) {
          console.log('Error parsing message', e)
        }
      })
      socket.addEventListener('open', () => {
        console.log('Socket open')

        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          this.stream = stream
          
          mediaRecorder = new MediaRecorder(this.stream!, { mimeType: 'audio/webm' });
          this.readyToRecord = true
            
          mediaRecorder.addEventListener('dataavailable', async event => {
            console.log('Data available!');
            if (event.data.size > 0) {
              socket.send(event.data);
            }
          })
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
        });
      })
    },
    startRecording() {
      this.isRecording = true
      const startChunking = () => {
        this.startRecordingChunk()
        setTimeout(() => {
          if (!this.isRecording) {
            return
          }
          this.stopRecordingChunk()
          setTimeout(startChunking, 0)
        }, CHUNK_TIME)
      }
      startChunking()
    },
    startRecordingChunk() {
      console.log('startRecordingChunk');
      mediaRecorder.start();
    },
    stopRecordingChunk() {
      console.log('stopRecordingChunk');
      mediaRecorder.stop();
    },
    stopRecording() {
      mediaRecorder.stop();
      console.log('stopRecording');
      this.isRecording = false
    }
  }
})
// 😡
</script>

<style lang="scss">
.emotion {
  &.happy {
    color: green;
    &::before, &::after {
      content: '😊';
    }
  }
  &.sad {
    color: red;
    &::before, &::after {
      content: '😥';
    }
  }
  &.angry {
    color: orange;
    &::before, &::after {
      content: '😠';
    }
  }
  &.excited {
    color: blue;
    &::before, &::after {
      content: '🤩';
    }
  }
}
</style>
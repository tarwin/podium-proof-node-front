// const apiUrl = 'podium-proof.loca.lt'
const apiUrl = 'localhost:3000'

export default class Api {
  static init() {
    console.log('api init')
    const socket = new WebSocket(`ws://${apiUrl}/`);
    socket.onopen= function() {
      console.log('open')
      socket.send('hello')
    }
    socket.onmessage= function(s) {
      console.log('message')
      console.log(s)
    }
  }
  static getAudioSocket() {
    const socket = new WebSocket(`ws://${apiUrl}/stream`);
    return socket
  }
}

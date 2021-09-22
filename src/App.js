import logo from './logo.svg';
import './App.css';
import ReactPlayer from 'react-player'
import { Component } from 'react';
import socketClient  from "socket.io-client";
const SERVER = "127.0.0.1:8080";
class App extends Component {
  constructor(props){
    super(props);
    this.state={
      url:"https://www.youtube.com/watch?v=EliDi1XZD9A",
      tmpUrl:null,
      playable:"Selecione um vídeo para reproduzir",
      socket:socketClient(SERVER,{transports: ['websocket', 'polling', 'flashsocket']}),
      isSeeking:true,
      playing:true,
      player:null
    }
    this.handleTextChange=this.handleTextChange.bind(this)
    this.goTo=this.goTo.bind(this);
    this.getURL=this.goTo.bind(this)
    this.SendSocketMsg=this.SendSocketMsg.bind(this)
  }
  ref = player => {
    this.state.player=player;
    this.configureSocket();
  }
  SendSocketMsg(evt){
      if(evt){
        this.setState({playable:"Reproduzindo"})
      }else{
        this.setState({playable:"Pausado"})
      }
      let socket=this.state.socket
      let vid=this.state.player
      if(this.state.playing!=evt)
        this.setState({playing:evt})
      var dt={
        isPaused:evt,
        time:vid.getCurrentTime(),
        host:socket.id
      };
      socket.emit('response',{type:"ss",data:dt});
  }
  getURL(event){
    this.state.socket.emit('response',{type:"getTime",data:""});
  }
  configureSocket(){
    let socket=this.state.socket
    let isSeeking=this.state.isSeeking
    let playing=this.state.playing
    let t=this
    let vid=this.state.player
    socket.on('message', function(msg){
      if(isSeeking){
        isSeeking=false;
        if(msg.data.host!=socket.id){
            // eslint-disable-next-line default-case
            switch(msg.type){
                case "hostTime":
                  if(vid!=null)
                    vid.seekTo(msg.data.time,'seconds');
                    if(t.state.url!=msg.data.src)
                    t.setState({url:msg.data.src})
                    break;
                case "sst":
                    if(msg.data.host!=socket.id){
                      t.setState({playing:msg.data.isPaused})
                      if(vid!=null)
                      vid.seekTo(msg.data.time,'seconds');
                    }
                    break;
                case "src":
                    t.setState({url:msg.data.src})
                    break;
            }
            t.setState({playable:"Reproduzindo"})
        }
        isSeeking=true;
      }
    });
  }
  handleTextChange(e){
    this.setState({tmpUrl:e.target.value})
  }
  goTo(evt){
    if(ReactPlayer.canPlay(this.state.tmpUrl)){
      var socket=this.state.socket
      this.setState({playable:"Reproduzindo"})
      socket.emit('response',{type:"srcNext",data:this.state.tmpUrl,host:socket.id})
      this.setState({url:this.state.tmpUrl})
    }else{
      this.setState({playable:"URL Inválido"})
    }
  }
  render(){
    return (
      <div className="App">
        <div>{this.state.playable}</div>
        <div className="videoContainer">
          <ReactPlayer ref={this.ref} url={this.state.url} playing={this.state.playing} controls onReady={this.getURL} onPlay={()=>this.SendSocketMsg(true)} onPause={()=>this.SendSocketMsg(false)} />
        </div>
        <input type="text" value={this.state.tmpUrl} onChange={this.handleTextChange} />
        <button onClick={this.goTo}>--{'>'}</button>
      </div>
    );
  }
}

export default App;

import React from 'react';
import {
  StyleSheet,
  View,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
  ListView,
  Alert,
  Button,
  RefreshControl,
  AsyncStorage,
  ImageBackground
} from 'react-native';
import BlurView from 'react-native-blur';
import MapView from 'react-native-maps';
import { StackNavigator } from 'react-navigation';
import { Location, Permissions} from 'expo';
import Swiper from 'react-native-swiper'
import imagePicker from 'react-native-imagepicker';
const Clarifai = require('clarifai');
const app = new Clarifai.App({
  apiKey:'e44c451524914335afe9ba3578afbfff'
})
process.nextTick=setImmediate;

const postData = (url = ``, data = {}) => {
  // Default options are marked with *
    return fetch(url, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, same-origin, *omit
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(data), // body data type must match "Content-Type" header
    })
    .then(response => response.json()) // parses response to JSON
    .catch(error => console.error(`Fetch Error =\n`, error));
};
//Screens

class MsgScreen extends React.Component{
  static navigationOptions={
    title:'Messages'
  }
  constructor(props){
    super(props);
    this.state = {
      array: [{to:{username:'Loading'},from:{username:''}}],
      refreshing:false
    }
  }
  componentDidMount(){
    fetch('https://hohoho-backend.herokuapp.com/messages')
    .then((res)=>(res.json()))
    .then((data)=>{
      console.log('data')
      this.setState({array:data.messages})
    })
    .catch(function(err){
      console.log(err);
    })
  }
  _onRefresh(){
    this.setState({refreshing:true})
    this.setState({array:ingredientsArray,refreshing:false})
    .catch(function(err){
      console.log(err);
    })
  }
  render(){
    const ds = new ListView.DataSource({rowHasChanged:(r1,r2)=>r1!==r2})
    return(
      <View  style={styles.container}>
        <ListView
          dataSource={ds.cloneWithRows(this.state.array)}
          renderRow={(rowData) => {
            console.log('rowData')
            return (<View style={{margin:10}}>
            <Text style={styles.textSmol}>{rowData.Name}</Text>
            <Text style={styles.textSmol}>Calories: {rowData.calories}</Text>
            <Text style={styles.textSmol}>Protein: {rowData.protein}</Text>
            {rowData.photo?<Image source={{uri: rowData.photo}}
       style={{width: 400, height: 400}} />:<Text>false</Text>}
            {rowData.location&&rowData.location.latitude?(<MapView
              region={{
                latitude:rowData.location.latitude,
                longitude:rowData.location.longitude,
                latitudeDelta:0.5,
                longitudeDelta:0.25
              }}
              height={100}
              width={100}
              >
              <MapView.Marker
                coordinate={{
                  latitude:rowData.location.latitude,
                  longitude:rowData.location.longitude
                }}
                title={rowData.from.username}
                />
            </MapView>):<Text></Text>}
          </View>)}}
          refreshControl={<RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this._onRefresh.bind(this)}
          />}
        />
    </View>
    )
  }

}
class LoginScreen extends React.Component {
  static navigationOptions = {
    title: 'Login'
  };
  constructor(props){
    super(props);
    this.state={
      name:'',
      pass:''
    }
  }
  press() {
    var user = this.state.name;
    var password = this.state.pass;
    postData(`https://hohoho-backend.herokuapp.com/login`, {username: user, password:password})
    .then(data => {
      if(data.success ==true){
        this.props.navigation.navigate('HoHoHo');
        AsyncStorage.setItem('user', JSON.stringify({
          username: this.state.name,
          password: this.state.pass
        })).then(()=>{
        this.setState({name:'',pass:''});})
      }else{
        alert('Invalid Login Info')
        this.setState({name:'',pass:''});
      }
    }) // JSON from `response.json()` call
    .catch(error => console.error(error));
  }
  componentDidMount(){
      AsyncStorage.getItem('user')
      .then(result => {
      var parsedResult = JSON.parse(result);
      var username = parsedResult.username;
      var password = parsedResult.password;
      console.log(parsedResult)
      if (username && password) {
        postData(`https://hohoho-backend.herokuapp.com/login`, {username: username, password:password})
        .then(data => {
          if(data.success ==true){
            this.props.navigation.navigate('HoHoHo');
            AsyncStorage.setItem('user', JSON.stringify({
              username: username,
              password: password
            }));
          }else{
            alert('Invalid Login Info')
          }
      })
      // Don't really need an else clause, we don't do anything in this case.
      }
    })
    .catch(err => { console.log(err)})

  }
  register() {
    this.props.navigation.navigate('Register');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.textBig}>Login to HoHoHo!</Text>
        <TextInput
          style={{height: 40, width:300, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(name) => this.setState({name})}
          value={this.state.name} placeholder={'Name'}
        />
        <TextInput
          style={{height: 40, width:300, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(pass) => this.setState({pass})}
          value={this.state.pass} placeholder={'Password'} secureTextEntry={true}
        />
        <TouchableOpacity onPress={ () => {this.press()} } style={[styles.button, styles.buttonGreen]}>
          <Text style={styles.buttonLabel}>Tap to Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBlue]} onPress={ () => {this.register()} }>
          <Text style={styles.buttonLabel}>Tap to Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
class UserScreen extends React.Component{
  static navigationOptions=(props)=>({
    title:'Users',
    // headerRight:(<Button
    //       onPress={() => props.navigation.navigate('Messages')}
    //       title="Messages"
    //     />)
  })
  constructor(props){
    super(props);
    this.state = {
      stats:{
        name:"Cat",
        calories: "N/A",
        tfat:"N/A"
      },
      refreshing:false,
      imguri:"https://image.freepik.com/free-photo/cute-cat-picture_1122-449.jpg"
    }
  }
  componentDidMount(){
  }
  _onRefresh(){
    this.setState({refreshing:true})
    fetch('https://hohoho-backend.herokuapp.com/users')
    .then((obj)=>(obj.json()))
    .then((nObj)=>{
      this.setState({refreshing:false});
    })
    .catch(function(err){
      console.log(err)
    })
  }
  sendLocation = async(x) => {
    console.log(this.state.imguri)
    imagePicker.open({
        takePhoto: true,
        useLastPhoto: true,
        chooseFromLibrary: true
    }).then(({ uri, width, height }) => {
      console.log('hoi')
      app.models.predict("bd367be194cf45149e75f01d59f77ba7", 'https://i5.walmartimages.ca/images/Enlarge/580/6_r/875806_R.jpg').then(function(response) {
        var amp = response.outputs[0].data.concepts[0].name;
        console.log(amp)

        var http = new XMLHttpRequest();
        var url = "https://trackapi.nutritionix.com/v2/natural/nutrient";
        http.open("POST", url, true);

        http.setRequestHeader('x-app-id', 'b1b12c23');
        http.setRequestHeader('x-app-key', 'ba69f4c3b572e2f9865d6e7ac176d5b6');
        http.setRequestHeader("Content-Type","application/json; charset=utf-8");

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
            }
        }
        http.send(params);
      })

        this.setState({imguri:uri})
        AsyncStorage.setItem('imguri',uri)
        console.log('image asset', uri, width, height);
    }, (error) => {
        // Typically, user cancel
        console.log('hello')
        console.log('error', error);
    });


  }
  render(){
    return(
      <View style={{display:'flex',flex:1}}>
        <TouchableOpacity style={{display:'flex', flex:1}} delayLongPress={1000} onLongPress={()=>{this.sendLocation()}}><ImageBackground blurRadius={3} style={{justifyContent:'center',alignItems:'center',flex:1}} source={{uri:this.state.imguri}} ><Text style={{fontSize:50}}>{this.state.stats.name} </Text><Text style={{fontSize:50}}>Calories: {this.state.stats.calories} </Text><Text style={{fontSize:50}}>Trans Fat: {this.state.stats.tfat} </Text></ImageBackground></TouchableOpacity>
      </View>
    )
  }
}
class RegisterScreen extends React.Component {
  static navigationOptions = {
    title: 'Register'
  };
  constructor(props){
    super(props);
    this.state={
      name:'',
      pass:''
    }
  }
  comradeRegistry(){
    var user = this.state.name;
    var password = this.state.pass;
    postData(`https://hohoho-backend.herokuapp.com/register`, {username: user, password:password})
    .then(data => console.log('data')) // JSON from `response.json()` call
    .catch(error => console.error(error));
    this.setState({name:'',pass:''});
    this.props.navigation.navigate('Login');
  }
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={{marginTop:40, height: 40, width:300, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(name) => this.setState({name})}
          value={this.state.name} placeholder={'Name'}
        />
        <TextInput
          style={{height: 40, width:300, borderColor: 'gray', borderWidth: 1}}
          onChangeText={(pass) => this.setState({pass})}
          value={this.state.pass} placeholder={'Password'} secureTextEntry={true}
        />
        <TouchableOpacity onPress={()=>this.comradeRegistry()}>
          <Text style={styles.textBig}>Register</Text>
        </TouchableOpacity>
      </View>
    )
  }
}
class SwiperScreen extends React.Component {
  static navigationOptions = {
    title: 'HoHoHo!'
  };

  render() {
    return (
      <View style={{flex:1}}>
      <Swiper>
        <View style={{flex:1}}>
          <UserScreen/>
        </View>
        <View style={{flex:1}}>
          <MsgScreen/>
        </View>
      </Swiper>
    </View>
    );
  }
}

//Navigator
export default StackNavigator({
  Login: {
    screen: LoginScreen,
  },
  Register: {
    screen: RegisterScreen,
  },
  HoHoHo:{
    screen:SwiperScreen
  }
}, {initialRouteName: 'Login'});


//Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  containerFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  textBig: {
    fontSize: 36,
    textAlign: 'center',
    margin: 10,
  },
  textSmol: {
    fontSize: 20,
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    marginLeft: 5,
    marginRight: 5,
    borderRadius: 5
  },
  buttonRed: {
    backgroundColor: '#FF585B',
  },
  buttonBlue: {
    backgroundColor: '#0074D9',
  },
  buttonGreen: {
    backgroundColor: '#2ECC40'
  },
  buttonLabel: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white'
  }
});

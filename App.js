/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Image
} from 'react-native';

import * as tf from '@tensorflow/tfjs';
import { fetch } from '@tensorflow/tfjs-react-native'; // don't need
import * as mobilenet from '@tensorflow-models/mobilenet';
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
//import { Asset, Constants, FileSystem, Permissions } from 'react-native-unimodules';
import * as jpeg from 'jpeg-js';
// import ImagePicker from "react-native-image-picker";
import * as ImagePicker from 'expo-image-picker';


// import {
//   Header,
//   LearnMoreLinks,
//   Colors,
//   DebugInstructions,
//   ReloadInstructions,
// } from 'react-native/Libraries/NewAppScreen';


class App extends React.Component {
  state = {
    isTfReady: false,
    isModelReady: false,
    predictions: null,
    image: null, // ?
    base64String: '',
    capturedImage: '',
    s3ImageUrl: '',
    imageSubmitted: false,
  }

  async componentDidMount() {
    console.log("asking componentDidMount...");
    // Wait for tf to be ready.
    await tf.ready();
    // Signal to the app that tensorflow.js can now be used.
    this.setState({
      isTfReady: true
    });
    console.log("asking componentDidMount...1");
    this.model = await mobilenet.load();
    console.log("asking componentDidMount..2");
    this.setState({ isModelReady: true });
    console.log("asking camera permission...");
    this.askCameraPermission();
    console.log("asking componentDidMount...3");
  }

  askCameraPermission = async () => {
    console.log("asking camera permission...2");
    if (Constants.platform.android || Constants.platform.ios) {
      console.log("asking camera permission...3");
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Please provide camera roll permissions to make this work!');
      }
    }
  }

  imageToTensor(rawImageData) {
    console.log("imageToTensor...1");
    const TO_UINT8ARRAY = true;
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    console.log("imageToTensor...width * height" + width, ", " + height);
    // Drop the alpha channel info for mobilenet
    const buffer = new Uint8Array(width * height * 3);
    let offset = 0 ; // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset];
      buffer[i + 1] = data[offset + 1];
      buffer[i + 2] = data[offset + 2];

      offset += 4;
    }
    console.log("imageToTensor...2");

    return tf.tensor3d(buffer, [height, width, 3]);
  }

  classifyImage = async () => {
    try {
    //   console.log("classifyImage...1");
    //  // const imageAssetPath = this.state.s3ImageUrl; //this.state.capturedImage; //this.state.s3ImageUrl;
    //  // console.log("classifyImage...path " + imageAssetPath);
      // const source = { uri: this.state.capturedImage };
      // const imageAssetPath = Image.resolveAssetSource(source);
    //   console.log("classifyImage1...path " + this.state.capturedImage);
    //   console.log("classifyImage2...path " + imageAssetPath.uri);
      // const response = await fetch(imageAssetPath.uri, {}, { isBinary: false });
      // const imageAssetPath = this.state.s3ImageUrl;
   //   console.log("classifyImage...2 : " + this.state.base64String);

     // var raw = window.atob(this.state.base64String);
     // var rawLength = raw.length;
      //var array = new Uint8Array(new ArrayBuffer(rawLength));

      // for(i = 0; i < rawLength; i++) {
      //   array[i] = raw.charCodeAt(i);
      // }
      // const parts = this.state.base64String.split(";base64,");
      // const contentType = parts[0].replace("data:", "");
      // const base64 = parts[1];
     // const data = this.state.base64String.substring(base64.indexOf(), this.state.base64String.length);
    // console.log(this.state.base64String.substring(0, 31));
     // console.log(this.state.base64String.replace("\n", "").replace("\r", "").substring(this.state.base64String.length - 10, this.state.base64String.length));
    //  const data = this.state.base64String.replace("\n", "");
     // const rawImageData = base64js.toByteArray(this.state.base64String.replace("\n", "").replace("\r", ""));
    // const rawImageData = Base64.decode(this.state.base64String.replace(/(?:\r\n|\r|\n)/g, ''));
   // const imageAssetPath = Image.resolveAssetSource(this.state.image);
   // console.log("imageAssetPath..." + imageAssetPath.uri);
 //   const response = await fetch(imageAssetPath.uri, {}, { isBinary: true });
  //  const rawImageData = await response.arrayBuffer();
     // const rawImageData = new Buffer.Buffer(this.state.base64String, "base64");
   //   console.log("classifyImage...2");
  //   console.log("imagedata length: " + rawImageData.length);
   //   const response = await fetch(imageAssetPath, {}, { isBinary: true });
     // const rawImageData = array;//atob(this.state.base64String);// await response.arrayBuffer();
    //  console.log("classifyImage...2"); 
    //  const rawImageData = await response.arrayBuffer();
    //  const imageTensor = this.imageToTensor(rawImageData);
    //   console.log("classifyImage...3");
    //   const predictions = await this.model.classify(imageTensor);
    //   console.log('predication: ' + predictions);
    //   this.setState({ predictions });

      // const source = { uri: this.state.capturedImage };
    //  const imageAssetPath = Image.resolveAssetSource(source);
      console.log("path: " + this.state.capturedImage);
      const response = await fetch(this.state.capturedImage, {}, { isBinary: true })
      const rawImageData = await response.arrayBuffer()
      const imageTensor = this.imageToTensor(rawImageData)
      const predictions = await this.model.classify(imageTensor)
      this.setState({ predictions })
      console.log(predictions)
    } catch (error) {
      console.log(error);
    }
  }
  
  renderPrediction = prediction => {
    return (
      <Text key={prediction.className} style={styles.text}>
        {prediction.className}
      </Text>
    )
  }

  captureImageButtonHandler = async () => {
    this.setState({
      imageSubmitted: false,
      predictions: null
    });
    // ImagePicker.showImagePicker({ title: "Pick an Image", maxWidth: 800, maxHeight: 600 }, (response) => {
    //   if (response.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (response.error) {
    //     console.log('ImagePicker Error: ', response.error);
    //   } else if (response.customButton) {
    //     console.log('User tapped custom button: ', response.customButton);
    //   } else {
    //     // You can also display the image using data:
    //     const source = { uri: 'data:image/jpeg;base64,' + response.data };
    //     this.setState({ capturedImage: response.uri, base64String: source.uri });
    //   }
    // });
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        base64: true,
        aspect: [4, 3]
      })

      if (!response.cancelled) {
       // const source = { uri: response.uri }
       // this.setState({ image: source })
        const source = { uri: 'data:image/jpeg;base64,' + response.base64 };
        this.setState({ capturedImage: response.uri, base64String: source.uri });
       // this.classifyImage()
      }
    } catch (error) {
      console.log(error)
    }
  }

  submitButtonHandler = () => {
    if (this.state.capturedImage == '' || this.state.capturedImage == undefined || this.state.capturedImage == null) {
      alert("Please Capture the Image");
    } else {
      this.setState({
        imageSubmitted: true
      });

      const url = "https://2r5x7bfm7h.execute-api.us-west-2.amazonaws.com/v1/upload";
      const xhr = new XMLHttpRequest();

      if ("withCredentials" in xhr){
          xhr.open("POST", url, true);
      } else if (typeof XDomainRequest != "undefined"){
          xhr = new XDomainRequest();
          xhr.open("POST", url);
      } else {
          xhr = null;
      }

      let self = this;
      // xhr.setRequestHeader('Content-type', "application/x-amz-json-1.1");
      xhr.setRequestHeader('Content-type', 'application/json');
      xhr.onreadystatechange = function() {
        // In local files, status is 0 upon success in Mozilla Firefox
        if(xhr.readyState === XMLHttpRequest.DONE) {
          var status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            // The request has been completed successfully
            console.log("Upload done. " + xhr.responseText);

            self.setState({
              s3ImageUrl: xhr.responseText
            });
            { self.state.s3ImageUrl !== '' ? self.classifyImage() : '' };

          } else {
            console.log("Upload photo error.");
          }
        }
      };
      // xhr.send(JSON.stringify({
      //   "Image": this.state.base64String,
      //   "name": "testImage.jpg"
      // }));
      this.classifyImage();
    }
  }

  render() {
    const { isModelReady, predictions } = this.state
    const capturedImageUri = this.state.capturedImage;
    const imageSubmittedCheck = this.state.imageSubmitted;

    console.log("asking render...");

    return (
      <View style={styles.MainContainer}>
        <ScrollView>
          <Text style={{ fontSize: 20, color: "#000", textAlign: 'center', marginBottom: 15, marginTop: 10 }}>Object Detection</Text>

          {this.state.capturedImage !== "" && <View style={styles.imageholder} >
            <Image source={{ uri: this.state.capturedImage }} style={styles.previewImage} />
          </View>}

          {this.state.capturedImage != '' && imageSubmittedCheck && (
            <View style={styles.predictionWrapper}>
              {isModelReady && capturedImageUri && imageSubmittedCheck && (
                <Text style={styles.text}>
                  Predictions: {predictions ? '' : 'Loading...'}
                </Text>
              )}
              {isModelReady &&
                predictions &&
                predictions.map(p => this.renderPrediction(p))}
            </View>
          )
          }

          <TouchableHighlight style={[styles.buttonContainer, styles.captureButton]} onPress={this.captureImageButtonHandler}>
            <Text style={styles.buttonText}>Capture Image</Text>
          </TouchableHighlight>

          <TouchableHighlight style={[styles.buttonContainer, styles.submitButton]} onPress={this.submitButtonHandler}>
            <Text style={styles.buttonText}>Submit</Text>
          </TouchableHighlight>

        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  text: {
    color: '#000000',
    fontSize: 16
  },
  predictionWrapper: {
    height: 100,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center'
  },
  buttonContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: "80%",
    borderRadius: 30,
    marginTop: 20,
    marginLeft: 30,
  },
  captureButton: {
    backgroundColor: "#337ab7",
    width: 350,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: "#C0C0C0",
    width: 350,
    marginTop: 5,
  },
  imageholder: {
    borderWidth: 1,
    borderColor: "grey",
    backgroundColor: "#eee",
    width: "50%",
    height: 150,
    marginTop: 10,
    marginLeft: 100,
    flexDirection: 'row',
    alignItems: 'center'
  },
  previewImage: {
    width: "100%",
    height: "100%",
  }
})

export default App;

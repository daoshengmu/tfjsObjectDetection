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
  TouchableOpacity,
  ActivityIndicator,
  Image
} from 'react-native';

import * as tf from '@tensorflow/tfjs';
import { fetch } from '@tensorflow/tfjs-react-native'; // don't need
import * as mobilenet from '@tensorflow-models/mobilenet';
import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import * as jpeg from 'jpeg-js';
import * as ImagePicker from 'expo-image-picker';


class App extends React.Component {
  state = {
    isTfReady: false,
    isModelReady: false,
    predictions: null,
    base64String: '',
    capturedImage: null,
    s3ImageUrl: '',   // x
    imageSubmitted: false,
  }

  async componentDidMount() {
    // Wait for tf to be ready.
    await tf.ready();
    // Signal to the app that tensorflow.js can now be used.
    this.setState({
      isTfReady: true
    });
    this.model = await mobilenet.load();
    this.setState({ isModelReady: true });
    this.askCameraPermission();
  }

  askCameraPermission = async () => {
    if (Constants.platform.android || Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Please provide camera roll permissions to make this work!');
      }
    }
  }

  imageToTensor(rawImageData) {
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
    return tf.tensor3d(buffer, [height, width, 3]);
  }

  classifyImage = async () => {
    try {
      console.log("path: " + this.state.capturedImage.uri);
      const response = await fetch(this.state.capturedImage.uri, {}, { isBinary: true })
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

  selectImageHandler = async () => {
    this.setState({
      imageSubmitted: false,
      predictions: null
    });
    try {
      let response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        base64: true,
        aspect: [4, 3]
      })

      if (!response.cancelled) {
        const base64Source = { uri: 'data:image/jpeg;base64,' + response.base64 };
        const source = { uri: response.uri };
        this.setState({ capturedImage: source, base64String: base64Source.uri });
        this.classifyImage();
      }
    } catch (error) {
      console.log(error)
    }
  }

  renderPrediction = prediction => {
    return (
      <Text key={prediction.className} style={styles.text}>
        {prediction.className}
      </Text>
    )
  }

  render() {
    const { isModelReady, predictions, capturedImage } = this.state

    return (
      <View style={styles.MainContainer}>
          <Text style={styles.title}>Object Detection</Text>
          <View style={styles.loadingModelContainer}>
            <Text style={styles.text}>Model ready? </Text>
            {isModelReady ? (
              <Text>🚀</Text>
            ) : (
              <ActivityIndicator size='small'/>
            )}
          </View>
          <TouchableOpacity style={styles.imageWrapper} onPress={isModelReady ? this.selectImageHandler : undefined}>
            {capturedImage && <Image source={capturedImage} style={styles.imageContainer} />}
            {isModelReady && !capturedImage && (
              <Text style={styles.transparentText}>Tap to choose image</Text>
            )}
          </TouchableOpacity>
          
          <View style={styles.predictionWrapper}>
            {capturedImage && (
                <View style={styles.predictionWrapper}>
                  {isModelReady && capturedImage && (
                    <Text style={styles.text}>
                      Predictions: {predictions ? '' : 'Predicting...'}
                    </Text>
                  )}
                  {isModelReady &&
                    predictions &&
                    predictions.map(p => this.renderPrediction(p))}
                </View>
              )
            }
          </View>
          <View>
            <Text style={styles.text}>Powered by TensorFlow.js</Text>
            <Text style={styles.text}>@daoshengmu</Text>
          </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    marginTop: 30,
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center'
  },
  title: {
    fontSize: 22,
    color: "#000",
    fontWeight: "bold",
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 50
  },
  text: {
    color: '#000000',
    fontSize: 16,
    textAlign: 'center'
  },
  imageWrapper: {
    width: 280,
    height: 280,
    padding: 10,
    borderColor: '#2366bf',
    borderWidth: 5,
    borderStyle: 'dashed',
    marginTop: 40,
    marginBottom: 10,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingModelContainer: {
    flexDirection: 'row',
    marginTop: 10
  },
  imageContainer: {
    width: 250,
    height: 250,
    position: 'absolute',
    top: 10,
    left: 10,
    bottom: 10,
    right: 10
  },
  predictionWrapper: {
    height: 100,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center'
  },
  captureButton: {
    backgroundColor: "#337ab7",
    width: 350,
  },
  transparentText: {
    color: '#222222',
    opacity: 0.7
  }
})

export default App;

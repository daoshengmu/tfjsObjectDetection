## TensorFlow MobileNet Object Detection with React Native and Expo

<img src="https://user-images.githubusercontent.com/1263177/82988748-7e481300-9fae-11ea-8454-66a23892fce5.gif" width="250" />


| Android Device | Android Emulator | iOS Device  | iOS Simulator |  Web |
|----------------|------------------|-------------|---------------|------|
|       ✅	      |       ✅	        |     ✅	    |      ✅	     |  ✅  |



This is inspired by [@amandeepmittal](https://github.com/amandeepmittal/mobilenet-tfjs-expo)'s work.


## How to Run

- Type `yarn install` to install dependencies.
- Check `package.json` to see how to run your build on your platform. For example, `npm run android` is for running on Androind devices.

## Troubleshooting
- If you see `Namespace not marked type-only declare` error. Please open `node_modules/@tensorflow/tfjs-converter/dist/src/data/compiled_api.ts` and replace `export namespace` with `export declare namespace`.


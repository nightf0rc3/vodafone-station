# Vodafone Station API

[![npm version](https://img.shields.io/npm/v/vodafone-station.svg)](https://www.npmjs.org/package/vodafone-station)

This package is a simple api wrapper for the web interface of the Vodafone Station (modem/router provided by ISPs e.g. Vodafone)
Currently only a couple of the web interface functions are implemented.

## Installing
Using npm:

```bash
npm i vodafone-station
```

## Usage

This example shows how to get an unformatted list of all currently connected devices.

```javascript
import VodafoneStation from 'vodafone-station';
// creating an vodafoneStation object with the ip address of the target
const vodafoneStation = new VodafoneStation('192.168.0.1');
// logging in with the "password"
await vodafoneStation.login('admin', 'password');
// getting the list of all connected devices
const devices = await vodafoneStation.getConnectedDevices();
// logout to terminate the session
await vodafoneStation.logout();
console.log(devices);
```
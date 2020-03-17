import VodafoneBox from '../src';

(async () => {
    try {
        const vodafoneBox = new VodafoneBox('192.168.0.1');
        await vodafoneBox.login('admin', 'password');
        const devices = await vodafoneBox.getConnectedDevices();
        await vodafoneBox.logout();
        console.log(devices);
    } catch (err) {
        console.log(err);
    }
})();

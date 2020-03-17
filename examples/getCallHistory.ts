import VodafoneBox from '../src';

(async () => {
    try {
        const vodafoneBox = new VodafoneBox('192.168.0.1');
        await vodafoneBox.login('admin', 'password');
        const calls = await vodafoneBox.getCallHistory();
        await vodafoneBox.logout();
        console.log(calls);
    } catch (err) {
        console.log(err);
    }
})();

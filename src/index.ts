import axios, { AxiosInstance } from 'axios';
import SJCLWrapper from './SJCLWrapper';

export default class VodafoneBox {
    private host: string;
    private client: AxiosInstance;

    // crypto
    private sessionId: string;
    private nonce: string;
    private csrfNonce: string = '';
    private iv: string;
    private salt: string;
    private key: string;

    private cookie: string;
    
    constructor(host: string) {
      this.host = host;
      this.client = axios.create({
          baseURL: `http://${this.host}/`,
          timeout: 10000,
          headers: {
              'X-Requested-With': 'XMLHttpRequest',
              Referer: `http://${this.host}/?overview`,
              Origin: `http://${this.host}`,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64)'
          },
          withCredentials: true,
        });
    }

    private getHeaders() {
      return {
        'Cookie': this.cookie,
        csrfNonce: this.csrfNonce,
      }
    }

    private setCookie(sessionId) {
      this.cookie = `PHPSESSID=${sessionId};`;
    }

    public async get<T>(endpoint: string, params?: string) {
      const paramsP = (params) ? `&${params}` : '';
      return await this.client.get<T>(`/php/${endpoint}?_n=${this.nonce}${paramsP}`, {
        headers: this.getHeaders()
      });
    }

    public async put<T>(endpoint: string, data?: any) {
      return await this.client.put<T>(`/php/${endpoint}?_n=${this.nonce}`, data, {
        headers: this.getHeaders()
      });
    }

    public async post<T>(endpoint: string, data?: any) {
      return await this.client.post<T>(`/php/${endpoint}?_n=${this.nonce}`, data, {
        headers: this.getHeaders()
      });
    }

    private async initCryptoValues() {
      const data = await this.client.get('/');
      this.sessionId = data.headers['set-cookie'][0].split('=')[1].split(';')[0];
      this.setCookie(this.sessionId);
      this.iv = data.data.split('var myIv = \'')[1].split('\';')[0];
      this.salt = data.data.split('var mySalt = \'')[1].split('\';')[0];
      this.nonce = ('' + Math.random()).substr(2,5);
      // console.debug(`InitCryptoValues [sessionId=${this.sessionId}, iv=${this.iv}, salt=${this.salt}, nonce=${this.nonce}]`);
    }

    public async login(name: string, password: string) {
      await this.initCryptoValues();
      const jsData = `{"Password": "${password}", "Nonce": "${this.sessionId}"}`;
      this.key = SJCLWrapper.sjclPbkdf2(password, this.salt, SJCLWrapper.DEFAULT_SJCL_ITERATIONS, SJCLWrapper.DEFAULT_SJCL_KEYSIZEBITS);
      const authData = "loginPassword";
      const encryptData = SJCLWrapper.sjclCCMencrypt (this.key, jsData, this.iv, authData, SJCLWrapper.DEFAULT_SJCL_TAGLENGTH);
      const loginData = { 'EncryptData': encryptData, 'Name': name, 'AuthData': authData };
      try {
        const { data, headers } = await this.put<any>('ajaxSet_Password.php', loginData);
        if (data['p_status'].indexOf('Fail') > -1) {
          throw new Error('Login failed, wrong password provided');
        }
        if (data['p_status'].indexOf('Lockout') > -1) {
          throw new Error(`Login failed, locked out for ${data['p_waitTime']}`);
        }
        if (data['p_status'].indexOf('Match') > -1) {
          this.sessionId = headers['set-cookie'][0].split('=')[1].split(';')[0];
          this.setCookie(this.sessionId);
          this.csrfNonce = SJCLWrapper.sjclCCMdecrypt(this.key, data.encryptData, this.iv, "nonce", SJCLWrapper.DEFAULT_SJCL_TAGLENGTH);
          // console.debug(`received csrfNonce [csrfNonce=${this.csrfNonce}]`);
          await this.setSession();
        }
      } catch (err) {
        throw new Error(`Received unexpected message from server: ${err.response.data}`);
      }
  }

  private async setSession() {
    try {
      const { data } = await this.post<{ LoginStatus: string }>('ajaxSet_Session.php');
      if (data.LoginStatus.indexOf('yes') == -1) {
        console.info('Session could not be fully established (might still work...)');
      }
    } catch (err) {
      throw new Error(`Received unexpected message from server: ${err.response.data}`);
    }
  }

  public async logout() {
    await this.put('logout.php');
  }

  public async getConnectedDevices() {
    try {
      const { data } = await this.get<string>('overview_data.php');
      const lanDevices = JSON.parse(data.split('json_lanAttachedDevice = ')[1].split(';')[0]);
      const wlanDevices = JSON.parse(data.split('json_primaryWlanAttachedDevice = ')[1].split(';')[0]);
      return { lanDevices, wlanDevices };
    } catch (err) {
      throw new Error(`Received unexpected message from server: ${err.response.data}`);
    }
  }

  public async getCallHistory() {
    try {
      const { data } = await this.get('phone_call_log_data.php', '{"PhoneLogRecord":{}}');
      return data;
    } catch (err) {
      throw new Error(`Received unexpected message from server: ${err.response.data}`);
    }
  }
}

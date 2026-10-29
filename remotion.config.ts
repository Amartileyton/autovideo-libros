import fs from 'node:fs';
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setAudioCodec('aac');
Config.setDelayRenderTimeoutInMilliseconds(60000);
Config.setTimeoutInMilliseconds(60000);
Config.setChromiumDisableWebSecurity(true);

const systemChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
if (fs.existsSync(systemChrome)) {
  Config.setBrowserExecutable(systemChrome);
}

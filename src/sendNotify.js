const querystring = require('querystring');
const $ = new Env();
const timeout = 15000;

// =======================================gotify通知设置区域==============================================
let GOTIFY_URL = '';
let GOTIFY_TOKEN = '';
let GOTIFY_PRIORITY = 0;
// =======================================go - cqhttp通知设置区域===========================================
let GOBOT_URL = '';
let GOBOT_TOKEN = '';
let GOBOT_QQ = '';
// =======================================微信server酱通知设置区域===========================================
let SCKEY = '';
// =======================================PushDeer通知设置区域===========================================
let PUSHDEER_KEY = '';
let PUSHDEER_URL = '';
// =======================================Synology Chat通知设置区域===========================================
let CHAT_URL = '';
let CHAT_TOKEN = '';
// =======================================Bark App通知设置区域===========================================
let BARK_PUSH = '';
let BARK_ICON = 'https://qn.whyour.cn/logo.png';
let BARK_SOUND = '';
let BARK_GROUP = 'QingLong';
// =======================================telegram机器人通知设置区域===========================================
let TG_BOT_TOKEN = '';
let TG_USER_ID = '';
let TG_PROXY_HOST = '';
let TG_PROXY_PORT = '';
let TG_PROXY_AUTH = '';
let TG_API_HOST = 'api.telegram.org';
// =======================================钉钉机器人通知设置区域===========================================
let DD_BOT_TOKEN = '';
let DD_BOT_SECRET = '';
// =======================================企业微信基础设置===========================================
let QYWX_ORIGIN = '';
// =======================================企业微信机器人通知设置区域===========================================
let QYWX_KEY = '';
// =======================================企业微信应用消息通知设置区域===========================================
let QYWX_AM = '';
// =======================================iGot聚合推送通知设置区域===========================================
let IGOT_PUSH_KEY = '';
// =======================================push+设置区域=======================================
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';
// =======================================Cool Push设置区域=======================================
let QQ_SKEY = '';
let QQ_MODE = '';
// =======================================智能微秘书设置区域=======================================
let AIBOTK_KEY = '';
let AIBOTK_TYPE = '';
let AIBOTK_NAME = '';
// =======================================飞书机器人设置区域=======================================
let FSKEY = '';
// =======================================SMTP 邮件设置区域=======================================
let SMTP_SERVER = '';
let SMTP_SSL = 'false';
let SMTP_EMAIL = '';
let SMTP_PASSWORD = '';
let SMTP_NAME = '';
// =======================================PushMe通知设置区域===========================================
let PUSHME_KEY = '';
// =======================================wxpusher通知设置区域===========================================
let WXPUSHER_TOKEN = 'AT_OzwCik0QP4p4AQlKdO4jbgjWApTiWsJr';
let WX_PUSHER_UID = 'UID_515ENQo5aFZCOak8kkF8VTh7Va5p';

//==========================云端环境变量的判断与接收=========================
if (process.env.GOTIFY_URL) {
    GOTIFY_URL = process.env.GOTIFY_URL;
}
if (process.env.GOTIFY_TOKEN) {
    GOTIFY_TOKEN = process.env.GOTIFY_TOKEN;
}
if (process.env.GOTIFY_PRIORITY) {
    GOTIFY_PRIORITY = process.env.GOTIFY_PRIORITY;
}

if (process.env.GOBOT_URL) {
    GOBOT_URL = process.env.GOBOT_URL;
}
if (process.env.GOBOT_TOKEN) {
    GOBOT_TOKEN = process.env.GOBOT_TOKEN;
}
if (process.env.GOBOT_QQ) {
    GOBOT_QQ = process.env.GOBOT_QQ;
}

if (process.env.PUSH_KEY) {
    SCKEY = process.env.PUSH_KEY;
}

if (process.env.DEER_KEY) {
    PUSHDEER_KEY = process.env.DEER_KEY;
    PUSHDEER_URL = process.env.DEER_URL;
}

if (process.env.CHAT_URL) {
    CHAT_URL = process.env.CHAT_URL;
}

if (process.env.CHAT_TOKEN) {
    CHAT_TOKEN = process.env.CHAT_TOKEN;
}

if (process.env.QQ_SKEY) {
    QQ_SKEY = process.env.QQ_SKEY;
}

if (process.env.QQ_MODE) {
    QQ_MODE = process.env.QQ_MODE;
}

if (process.env.BARK_PUSH) {
    if (process.env.BARK_PUSH.indexOf('https') > -1 || process.env.BARK_PUSH.indexOf('http') > -1) {
        BARK_PUSH = process.env.BARK_PUSH;
    } else {
        BARK_PUSH = `https://api.day.app/${process.env.BARK_PUSH}`;
    }
    if (process.env.BARK_ICON) {
        BARK_ICON = process.env.BARK_ICON;
    }
    if (process.env.BARK_SOUND) {
        BARK_SOUND = process.env.BARK_SOUND;
    }
    if (process.env.BARK_GROUP) {
        BARK_GROUP = process.env.BARK_GROUP;
    }
} else {
    if (BARK_PUSH && BARK_PUSH.indexOf('https') === -1 && BARK_PUSH.indexOf('http') === -1) {
        BARK_PUSH = `https://api.day.app/${BARK_PUSH}`;
    }
}
if (process.env.TG_BOT_TOKEN) {
    TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
    TG_USER_ID = process.env.TG_USER_ID;
}
if (process.env.TG_PROXY_AUTH) TG_PROXY_AUTH = process.env.TG_PROXY_AUTH;
if (process.env.TG_PROXY_HOST) TG_PROXY_HOST = process.env.TG_PROXY_HOST;
if (process.env.TG_PROXY_PORT) TG_PROXY_PORT = process.env.TG_PROXY_PORT;
if (process.env.TG_API_HOST) TG_API_HOST = process.env.TG_API_HOST;

if (process.env.DD_BOT_TOKEN) {
    DD_BOT_TOKEN = process.env.DD_BOT_TOKEN;
    if (process.env.DD_BOT_SECRET) {
        DD_BOT_SECRET = process.env.DD_BOT_SECRET;
    }
}

if (process.env.QYWX_ORIGIN) {
    QYWX_ORIGIN = process.env.QYWX_ORIGIN;
} else {
    QYWX_ORIGIN = 'https://qyapi.weixin.qq.com';
}

if (process.env.QYWX_KEY) {
    QYWX_KEY = process.env.QYWX_KEY;
}

if (process.env.QYWX_AM) {
    QYWX_AM = process.env.QYWX_AM;
}

if (process.env.IGOT_PUSH_KEY) {
    IGOT_PUSH_KEY = process.env.IGOT_PUSH_KEY;
}

if (process.env.PUSH_PLUS_TOKEN) {
    PUSH_PLUS_TOKEN = process.env.PUSH_PLUS_TOKEN;
}
if (process.env.PUSH_PLUS_USER) {
    PUSH_PLUS_USER = process.env.PUSH_PLUS_USER;
}

if (process.env.AIBOTK_KEY) {
    AIBOTK_KEY = process.env.AIBOTK_KEY;
}
if (process.env.AIBOTK_TYPE) {
    AIBOTK_TYPE = process.env.AIBOTK_TYPE;
}
if (process.env.AIBOTK_NAME) {
    AIBOTK_NAME = process.env.AIBOTK_NAME;
}

if (process.env.FSKEY) {
    FSKEY = process.env.FSKEY;
}

if (process.env.SMTP_SERVER) {
    SMTP_SERVER = process.env.SMTP_SERVER;
}
if (process.env.SMTP_SSL) {
    SMTP_SSL = process.env.SMTP_SSL;
}
if (process.env.SMTP_EMAIL) {
    SMTP_EMAIL = process.env.SMTP_EMAIL;
}
if (process.env.SMTP_PASSWORD) {
    SMTP_PASSWORD = process.env.SMTP_PASSWORD;
}
if (process.env.SMTP_NAME) {
    SMTP_NAME = process.env.SMTP_NAME;
}

if (process.env.PUSHME_KEY) {
    PUSHME_KEY = process.env.PUSHME_KEY;
}

if (process.env.WXPUSHER_TOKEN) {
    WXPUSHER_TOKEN = process.env.WXPUSHER_TOKEN;
}
if (process.env.WX_PUSHER_UID) {
    WX_PUSHER_UID = process.env.WX_PUSHER_UID;
}
//==========================云端环境变量的判断与接收=========================

/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本通知 By：https://github.com/whyour/qinglong`
 * @returns {Promise<unknown>}
 */
async function sendNotify(
    text,
    desp,
    params = {},
    author = '\n\n本通知 By：https://github.com/whyour/qinglong'
) {
    desp += author;

    let skipTitle = process.env.SKIP_PUSH_TITLE;
    if (skipTitle) {
        if (skipTitle.split('\n').includes(text)) {
            console.info(text + '在SKIP_PUSH_TITLE环境变量内，跳过推送！');
            return;
        }
    }

    await Promise.all([
        serverNotify(text, desp),
        pushPlusNotify(text, desp),
        wxpusherNotify(text, desp)
    ]);
    text = text.match(/.*?(?=\s?-)/g)? text.match(/.*?(?=\s?-)/g)[0] : text;
    await Promise.all([
        BarkNotify(text, desp, params),
        tgBotNotify(text, desp),
        ddBotNotify(text, desp),
        qywxBotNotify(text, desp),
        qywxamNotify(text, desp),
        iGotNotify(text, desp, params),
        gobotNotify(text, desp),
        gotifyNotify(text, desp),
        ChatNotify(text, desp),
        PushDeerNotify(text, desp),
        aibotkNotify(text, desp),
        fsBotNotify(text, desp),
        smtpNotify(text, desp),
        PushMeNotify(text, desp, params)
    ]);
}

function gotifyNotify(text, desp) {
    return new Promise((resolve) => {
        if (GOTIFY_URL && GOTIFY_TOKEN) {
            const options = {
                url: `${GOTIFY_URL}/message?token=${GOTIFY_TOKEN}`,
                body: `title=${encodeURIComponent(text)}&message=${encodeURIComponent(desp)}&priority=${GOTIFY_PRIORITY}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('gotify发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.id) {
                            console.log('gotify发送通知消息成功🎉\n');
                        } else {
                            console.log(`${data.message}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
}

function gobotNotify(text, desp) {
    return new Promise((resolve) => {
        if (GOBOT_URL) {
            const options = {
                url: `${GOBOT_URL}?access_token=${GOBOT_TOKEN}&${GOBOT_QQ}`,
                json: { message: `${text}\n${desp}` },
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送go - cqhttp通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.retcode === 0) {
                            console.log('go - cqhttp发送通知消息成功🎉\n');
                        } else if (data.retcode === 100) {
                            console.log(`go - cqhttp发送通知消息异常: ${data.errmsg}\n`);
                        } else {
                            console.log(`go - cqhttp发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function serverNotify(text, desp) {
    return new Promise((resolve) => {
        if (SCKEY) {
            desp = desp.replace(/[\n\r]/g, '\n\n');
            const options = {
                url: SCKEY.includes('SCT')? `https://sctapi.ftqq.com/${SCKEY}.send` : `https://sc.ftqq.com/${SCKEY}.send`,
                body: `text=${text}&desp=${desp}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errno === 0 || data.data.errno === 0) {
                            console.log('server酱发送通知消息成功🎉\n');
                        } else if (data.errno === 1024) {
                            console.log(`server酱发送通知消息异常: ${data.errmsg}\n`);
                        } else {
                            console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function PushDeerNotify(text, desp) {
    return new Promise((resolve) => {
        if (PUSHDEER_KEY) {
            desp = encodeURI(desp);
            const options = {
                url: PUSHDEER_URL || `https://api2.pushdeer.com/message/push`,
                body: `pushkey=${PUSHDEER_KEY}&text=${text}&desp=${desp}&type=markdown`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.content.result.length!== undefined && data.content.result.length > 0) {
                            console.log('PushDeer发送通知消息成功🎉\n');
                        } else {
                            console.log(`PushDeer发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function ChatNotify(text, desp) {
    return new Promise((resolve) => {
        if (CHAT_URL && CHAT_TOKEN) {
            desp = encodeURI(desp);
            const options = {
                url: `${CHAT_URL}${CHAT_TOKEN}`,
                body: `payload={"text":"${text}\n${desp}"}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            };
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.success) {
                            console.log('Chat发送通知消息成功🎉\n');
                        } else {
                            console.log(`Chat发送通知消息异常\n${JSON.stringify(data)}`);
                        }
                    }
                } catch (e) {
                    $.logErr(e);
                } finally {
                    resolve(data);
                }
            });
        } else {
            resolve();
        }
    });
}

function BarkNotify(text, desp, params = {}) {
    return new Promise((resolve) => {
        if (BARK_PUSH) {
            const options = {
                url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}?icon=${

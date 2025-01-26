/* eslint-disable no-await-in-loop */
require("dotenv").config();
const { pushPlusNotify } = require('./sendNotify.js');
const log4js = require("log4js");
const recording = require("log4js/lib/appenders/recording");
log4js.configure({
    appenders: {
        vcr: {
            type: "recording",
        },
        out: {
            type: "console",
        },
    },
    categories: { default: { appenders: ["vcr", "out"], level: "info" } },
});

const logger = log4js.getLogger();
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
const superagent = require("superagent");
const { CloudClient } = require("cloud189-sdk");
const { sendNotify } = require("./sendNotify");

// const serverChan = require("./push/serverChan");
// const telegramBot = require("./push/telegramBot");
// const wecomBot = require("./push/wecomBot");
// const wxpush = require("./push/wxPusher");
const accounts = require("./accounts");

const fs = require('fs').promises;
const path = require('path');

const mask = (s, start, end) => s.split("").fill("*", start, end).join("");

const buildTaskResult = (res, result) => {
    const index = result.length;
    if (res.errorCode === "User_Not_Chance") {
        result.push(`第${index}次抽奖失败,次数不足`);
    } else {
        result.push(`第${index}次抽奖成功,抽奖获得${res.prizeName}`);
    }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 任务 1.签到 2.天天抽红包 3.自动备份抽红包
const doTask = async (cloudClient) => {
    const result = [];
    const res1 = await cloudClient.userSign();
    result.push(
        `${res1.isSign ? "已经签到过了，" : ""}签到获得${res1.netdiskBonus}M空间`
    );
    await delay(5000); // 延迟5秒

    const res2 = await cloudClient.taskSign();
    buildTaskResult(res2, result);
    //天翼更新，第二次失败
    // await delay(5000); // 延迟5秒
    // const res3 = await cloudClient.taskPhoto();
    // buildTaskResult(res3, result);

    return result;
};

const doFamilyTask = async (cloudClient, userNameInfo) => {
    const { familyInfoResp } = await cloudClient.getFamilyList();
    const myfamilyID = process.env.familyID;
    let totalBonusSpace = 0;

    if (myfamilyID) {
        console.log(`签到familyID 的值是: ${myfamilyID}`);
    } else {
        console.log('familyID 未设置，等会显示的就是家庭ID ，然后去创建myfamilyID变量');
    }
    const result = [];
    if (familyInfoResp) {
        for (let index = 0; index < familyInfoResp.length; index += 1) {
            const { familyId } = familyInfoResp[index];
             console.log(`本账号的familyID 的值是: ${familyId}`)
            const res = await cloudClient.familyUserSign(myfamilyID);
            const bonusSpace = res.bonusSpace || 0;
            totalBonusSpace += bonusSpace;
             result.push(
                `用户${userNameInfo}家庭任务: ${res.signStatus ? "已经签到过了，" : ""}签到获得${
                bonusSpace
                }M空间`
            );
        }
    }
    return { result, totalBonusSpace };
};
const push = (title, desp) => {
  // pushServerChan(title, desp);
  // pushTelegramBot(title, desp);
  // pushWecomBot(title, desp);
  // pushWxPusher(title, desp);
  // 调用 pushPlusNotify 发送通知

  // pushPlusNotify("title", desp);
  sendNotify("天翼网盘自动签到", desp)
};

const tokenDir = path.join(__dirname, 'tokens');
async function saveToken(userName, cloudClient) {
    try {
        await fs.access(tokenDir);
    } catch (error) {
        await fs.mkdir(tokenDir,{recursive:true});
    }
    const tokenFile = path.join(tokenDir, `${userName}.json`);

        const cookieString = await cloudClient.cookieJar.serialize();

    const tokenData = {
        session: cloudClient.session,
        cookie: cookieString,
        // 将 cloudClient的其他属性也一起保存
         ...cloudClient,
         loginTimestamp: Date.now(), // 添加登录时间戳
    };
    await fs.writeFile(tokenFile, JSON.stringify(tokenData), 'utf-8');
    logger.info(`用户 ${userName} CloudClient 状态已保存到 ${tokenFile}`);
}

async function loadToken(userName) {
    const tokenFile = path.join(tokenDir, `${userName}.json`);
    try {
        const data = await fs.readFile(tokenFile, 'utf-8');
        const cloudClientData = JSON.parse(data);
           logger.info(`用户 ${userName} CloudClient 状态从 ${tokenFile} 加载成功`);
        return cloudClientData;
    } catch (e) {
        logger.info(`用户 ${userName} CloudClient 状态加载失败，需要重新登录`);
        return null;
    }
}

async function validateToken(cloudClient) {
   try {
        await cloudClient.userSign();
        return true;
    } catch (error) {
        if (error.message.includes('图形验证码错误，请重新输入')) {
           logger.warn(`Token 已失效，需要重新登录`);
            return false;
         }else {
          logger.error(`Token 校验失败: ${error.message}`);
            return false;
         }
    }
}
// 开始执行程序
async function main() {
    let totalFamilyBonusSpace = 0;
    for (let index = 0; index < accounts.length; index += 1) {
        const account = accounts[index];
        const { userName, password } = account;
        if (userName && password) {
            const userNameInfo = mask(userName, 3, 7);
            try {
                logger.log(`账户 ${userNameInfo}开始执行`);

                let cloudClientData = await loadToken(userName);
                let cloudClient;
                 let loggedIn = false;

                if(cloudClientData){
                   cloudClient = new CloudClient(userName,password);
                     // 将所有保存的属性都复制到新的cloudClient实例中
                     Object.assign(cloudClient, cloudClientData);
                      if(cloudClientData.cookie){
                          try {
                              await cloudClient.cookieJar.deserialize(cloudClientData.cookie);
                                logger.info(`用户 ${userNameInfo} Cookie 加载成功`)
                          }catch(e){
                               logger.info(`用户 ${userNameInfo} Cookie 加载失败，需要重新登录`);
                          }
                      }
                    if(await validateToken(cloudClient)){
                        logger.info(`用户 ${userNameInfo} 使用缓存 CloudClient 状态登录成功`);
                         loggedIn = true;
                    }

                }

                if (!loggedIn) {
                    cloudClient = new CloudClient(userName, password);
                    await cloudClient.login();
                    await saveToken(userName, cloudClient);
                     loggedIn = true;
                }

                const result = await doTask(cloudClient);
                result.forEach((r) => logger.log(r));

                const { result: familyResult, totalBonusSpace } = await doFamilyTask(cloudClient, userNameInfo);
                familyResult.forEach((r) => logger.log(r));
                totalFamilyBonusSpace += totalBonusSpace;
                logger.log(`用户 ${userNameInfo} 本次家庭签到获得 ${totalBonusSpace}M空间`);

                logger.log("任务执行完毕");
                const { cloudCapacityInfo, familyCapacityInfo } =
                    await cloudClient.getUserSizeInfo();
                logger.log(
                    `个人总容量：${(
                        cloudCapacityInfo.totalSize /
                        1024 /
                        1024 /
                        1024
                    ).toFixed(2)}G,家庭总容量：${(
                        familyCapacityInfo.totalSize /
                        1024 /
                        1024 /
                        1024
                    ).toFixed(2)}G`
                );
            } catch (e) {
                logger.error(e);
                if (e.code === "ETIMEDOUT") {
                    throw e;
                }
            } finally {
                logger.log(`账户 ${userNameInfo}执行完毕`);
            }
        }
    }
    logger.info(`所有账号家庭签到总共获得 ${totalFamilyBonusSpace}M空间`);
}

(async () => {
    try {
        await main();
    } finally {
        const events = recording.replay();
        const content = events.map((e) => `${e.data.join("")}`).join("  \n");
        push("天翼云盘自动签到任务", content);
        recording.erase();
    }
})();
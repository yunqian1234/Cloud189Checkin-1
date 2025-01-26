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
const superagent = require("superagent");
const { CloudClient } = require("cloud189-sdk");
const { sendNotify } = require("./sendNotify");

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

const doTask = async (cloudClient) => {
    const result = [];
    const res1 = await cloudClient.userSign();
    result.push(
        `${res1.isSign ? "已经签到过了，" : ""}签到获得${res1.netdiskBonus}M空间`
    );
    await delay(5000);

    const res2 = await cloudClient.taskSign();
    buildTaskResult(res2, result);
    return result;
};

const doFamilyTask = async (cloudClient, userNameInfo) => {
    const { familyInfoResp } = await cloudClient.getFamilyList();
    const myfamilyID = process.env.FAMILYID || '';
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
            console.log(`本账号的familyID 的值是: ${familyId}`);
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
    sendNotify("天翼网盘自动签到", desp);
};

const tokenDir = path.join(__dirname, 'tokens');
async function saveToken(userName, session, cookie) {
    try {
        await fs.access(tokenDir);
    } catch (error) {
        await fs.mkdir(tokenDir, { recursive: true });
    }
    const tokenFile = path.join(tokenDir, `${userName}.json`);
    const tokenData = { session, cookie };
    await fs.writeFile(tokenFile, JSON.stringify(tokenData), 'utf-8');
    logger.info(`用户 ${userName} Token 已保存到 ${tokenFile}`);
}

async function loadToken(userName) {
    const tokenFile = path.join(tokenDir, `${userName}.json`);
    try {
        const data = await fs.readFile(tokenFile, 'utf-8');
        const { session, cookie } = JSON.parse(data);
        logger.info(`用户 ${userName} Token 从 ${tokenFile} 加载成功`);
        return { session, cookie };
    } catch (e) {
        logger.info(`用户 ${userName} Token 加载失败，需要重新登录`);
        return null;
    }
}

async function validateToken(cloudClient) {
    try {
        await cloudClient.getUserInfo();
        return true;
    } catch (error) {
        if (error.message.includes('图形验证码错误，请重新输入')) {
            logger.warn(`Token 已失效，需要重新登录`);
            return false;
        } else {
            logger.error(`Token 校验失败: ${error.message}`);
            return false;
        }
    }
}

async function main() {
    let totalFamilyBonusSpace = 0;
     let accounts = [];
        try {
           const tyAccounts =  '${{ secrets.TY_ACCOUNTS }}';
           const cleanedAccounts = tyAccounts.replace(/[\r\n\t]+/g, '').trim();
            accounts = JSON.parse(cleanedAccounts);
        } catch (error) {
           console.error('Failed to parse TY_ACCOUNTS from secrets:', '${{ secrets.TY_ACCOUNTS }}','Error:', error);
           return;
        }
    for (let index = 0; index < accounts.length; index += 1) {
        const account = accounts[index];
        const { userName, password } = account;
        if (userName && password) {
            const userNameInfo = mask(userName, 3, 7);
            try {
                logger.log(`账户 ${userNameInfo}开始执行`);
                const cloudClient = new CloudClient(userName, password);

                let token = await loadToken(userName);
                let loggedIn = false;

                if (token && token.session && token.cookie) {
                    cloudClient.session = token.session;
                    cloudClient.cookie = token.cookie;
                    if (await validateToken(cloudClient)) {
                        logger.info(`用户 ${userNameInfo} 使用缓存 Token 登录成功`);
                        loggedIn = true;
                    }
                }

                if (!loggedIn) {
                    await cloudClient.login();
                    await saveToken(userName, cloudClient.session, cloudClient.cookie);
                }

                const result = await doTask(cloudClient);
                result.forEach((r) => logger.log(r));

                const { result: familyResult, totalBonusSpace } = await doFamilyTask(cloudClient, userNameInfo);
                familyResult.forEach((r) => logger.log(r));
                totalFamilyBonusSpace += totalBonusSpace;
                logger.log(`用户 ${userNameInfo} 本次家庭签到获得 ${totalBonusSpace}M空间`);

                logger.log("任务执行完毕");
                const { cloudCapacityInfo, familyCapacityInfo } = await cloudClient.getUserSizeInfo();
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
    logger.info(`所有账号家庭签到总共获得 ${totalFamilyBonusSpace / 2}M空间`);
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
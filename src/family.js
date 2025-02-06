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
const superagent = require("superagent");
const { CloudClient } = require("cloud189-sdk");
const accounts = require("./accounts");
const {sendNotify} = require("./sendNotify");

const mask = (s, start, end) => s.split("").fill("*", start, end).join("");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 执行签到任务并返回结果
const doTask = async (cloudClient) => {
  logger.info("开始个人签到..."); // 添加日志
  let personalBonus = 0;
  const res1 = await cloudClient.userSign();
  if (!res1.isSign) {
    personalBonus = res1.netdiskBonus;
    logger.info(`个人签到获得 ${personalBonus}MB`); // 添加日志
  } else {
    logger.info("今日已签到"); // 添加日志
  }
  return personalBonus;
};

const doFamilyTask = async (cloudClient) => {
  familyId = process.env.FAMILYID;
  logger.info(familyId); // 添加日志
  logger.info("开始家庭签到..."); // 添加日志
  const { familyInfoResp } = await cloudClient.getFamilyList();
  let familyBonus = 0;
  if (familyInfoResp) {
    for (const family of familyInfoResp) {
      const res = await cloudClient.familyUserSign(familyId);
      if (!res.signStatus) {
        familyBonus += res.bonusSpace;
        logger.info(`家庭签到获得 ${res.bonusSpace}MB`); // 添加日志
        break
      } else {
        logger.info(`家庭成员 今日已签到`); // 添加日志
      }
    }
  }
  logger.info(`家庭签到共获得 ${familyBonus}MB`); // 添加日志
  return familyBonus;
};


const push = (title, desp) => {
  sendNotify(title, desp);
};


async function main() {
  let results = [];
  let totalFamilyBonus = 0;

  for (let index = 0; index < accounts.length; index += 1) {
    const account = accounts[index];
    const { userName, password } = account;
    if (userName && password) {
      const userNameInfo = mask(userName, 3, 7);
      logger.info(`**** 账号 ${userNameInfo} 开始执行 ****`); // 添加日志
      try {
        const cloudClient = new CloudClient(userName, password);
        await cloudClient.login();
        const personalBonus = await doTask(cloudClient);
        const familyBonus = await doFamilyTask(cloudClient);

        results.push(`账号${index + 1}，个人签到${personalBonus}MB，家庭签到${familyBonus}MB`);
        totalFamilyBonus += familyBonus; // 汇总家庭奖励到第一个账号

      } catch (e) {
        logger.error(`账号 ${userNameInfo} 执行出错: ${e}`);
        results.push(`账号${index + 1} 执行失败`);
      }
        logger.info(`**** 账号 ${userNameInfo} 执行完毕 ****`); // 添加日志
    }
  }

  results.push(`---`);
  results.push(`汇总，账号1，家庭签到${totalFamilyBonus}MB`);
  logger.info(`汇总，账号1，家庭签到${totalFamilyBonus}MB`); // 添加日志
  return results.join('\n');

}


(async () => {
  try {
      const resultString = await main();
      push("天翼云盘自动签到任务", resultString);
  } finally {
      recording.erase();
  }
})();
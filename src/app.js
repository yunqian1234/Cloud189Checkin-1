/* eslint-disable no-await-in-loop */
require("dotenv").config();
const { sendNotify } = require('./sendNotify');
const log4js = require("log4js");
const superagent = require("superagent");
const { CloudClient } = require("cloud189-sdk");

// 日志配置
log4js.configure({
  appenders: {
    vcr: { type: "recording" },
    out: { type: "console" }
  },
  categories: { default: { appenders: ["vcr", "out"], level: "info" } }
});
const logger = log4js.getLogger();

// 工具函数
const mask = (s, start, end) => s.split("").fill("*", start, end).join("");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// WxPusher 推送实现
const pushWxPusher = (title, desp) => {
  try {
    const appToken = process.env.WX_PUSHER_APP_TOKEN;
    const uid = process.env.WX_PUSHER_UID;
    
    if (!appToken || !uid) {
      logger.error("WxPusher 配置不完整，请检查环境变量");
      return;
    }

    superagent
      .post("https://wxpusher.zjiecode.com/api/send/message")
      .send({
        appToken,
        contentType: 1,
        summary: title,
        content: desp,
        uids: [uid]
      })
      .end((err, res) => {
        if (err) {
          logger.error(`WxPusher 推送失败: ${err.message}`);
          return;
        }
        
        try {
          const result = JSON.parse(res.text);
          if (result.code === 1000) {
            logger.info("WxPusher 推送成功");
          } else {
            logger.error(`WxPusher 推送失败: ${result.msg || "未知错误"}`);
          }
        } catch (e) {
          logger.error("WxPusher 响应解析失败");
        }
      });
  } catch (error) {
    logger.error(`WxPusher 推送异常: ${error.message}`);
  }
};

// 任务执行逻辑
const doTask = async (cloudClient) => {
  const result = [];
  
  try {
    // 签到任务
    const signRes = await cloudClient.userSign();
    result.push(`${signRes.isSign ? "今日已签到，" : ""}获得${signRes.netdiskBonus}M空间`);
    await delay(3000);

    // 抽奖任务1
    const lotteryRes1 = await cloudClient.taskSign();
    result.push(lotteryRes1.errorCode === "User_Not_Chance" 
      ? "每日抽奖机会已用完" 
      : `抽奖获得 ${lotteryRes1.prizeName}`);
    await delay(3000);

    // 抽奖任务2
    const lotteryRes2 = await cloudClient.taskPhoto();
    result.push(lotteryRes2.errorCode === "User_Not_Chance" 
      ? "备份抽奖机会已用完" 
      : `备份抽奖获得 ${lotteryRes2.prizeName}`);
    
  } catch (error) {
    logger.error(`任务执行失败: ${error.message}`);
    result.push("任务执行异常，请检查日志");
  }
  
  return result;
};

// 家庭任务
const doFamilyTask = async (cloudClient) => {
  const familyResults = [];
  try {
    const { familyInfoResp } = await cloudClient.getFamilyList();
    if (familyInfoResp) {
      for (const family of familyInfoResp) {
        const res = await cloudClient.familyUserSign(165515815004439);
        familyResults.push(`家庭空间 ${family.familyId.slice(-4)}：${res.signStatus ? "已签到" : "签到成功"}，获得${res.bonusSpace}M`);
        await delay(2000);
      }
    }
  } catch (error) {
    logger.error(`家庭任务失败: ${error.message}`);
  }
  return familyResults;
};

// 主执行流程
async function main() {
  const accounts = require("./accounts");
  let allResults = [];
  
  for (const account of accounts) {
    const { userName, password } = account;
    if (!userName || !password) continue;

    const maskedUser = mask(userName, 3, 7);
    let taskResults = [`账号 ${maskedUser} 开始处理`];
    
    try {
      const cloudClient = new CloudClient(userName, password);
      await cloudClient.login();
      
      // 执行基础任务
      const baseResults = await doTask(cloudClient);
      taskResults.push(...baseResults);

      // 执行家庭任务
      const familyResults = await doFamilyTask(cloudClient);
      taskResults.push(...familyResults);

      // 获取容量信息
      const { cloudCapacityInfo, familyCapacityInfo } = await cloudClient.getUserSizeInfo();
      taskResults.push(
        `个人总空间：${(cloudCapacityInfo.totalSize / 1024 ** 3).toFixed(2)}G`,
        `家庭总空间：${(familyCapacityInfo.totalSize / 1024 ** 3).toFixed(2)}G`
      );

    } catch (error) {
      taskResults.push(`处理失败: ${error.message}`);
      logger.error(`账号 ${maskedUser} 异常: ${error.stack}`);
    } finally {
      taskResults.push(`账号 ${maskedUser} 处理完成\n------------------------`);
      allResults.push(taskResults.join("\n"));
    }
  }

  return allResults.join("\n\n");
}

// 启动执行
(async () => {
  try {
    const content = await main();
    const recording = require("log4js/lib/appenders/recording");
    const events = recording.replay();
    const logContent = events.map(e => e.data[0]).join("\n");
    
    // 推送整合
    pushWxPusher("天翼云盘签到报告", content);
    sendNotify("天翼云盘签到", `${logContent}\n\n${content}`);
    
  } catch (error) {
    logger.error(`全局异常: ${error.stack}`);
    pushWxPusher("签到任务异常", `执行过程中发生严重错误:\n${error.message}`);
  } finally {
    recording.erase();
  }
})();

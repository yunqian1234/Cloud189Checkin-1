module.exports = () => {
  try {
    const tyAccounts = process.env.TY_ACCOUNTS || '[]';
    const singleLineAccounts = String(tyAccounts).replace(/[\r\n\t]+/g, '').trim();
    console.log('Raw TY_ACCOUNTS:', tyAccounts);  // 打印原始环境变量
    console.log('Single-Line TY_ACCOUNTS:', singleLineAccounts); // 打印处理后的单行字符串
    return JSON.parse(singleLineAccounts);
  } catch (e) {
     console.error('Failed to parse TY_ACCOUNTS:', process.env.TY_ACCOUNTS,'SingleLine:',String(process.env.TY_ACCOUNTS).replace(/[\r\n\t]+/g, '').trim(),'Error:', e);
    return [];
  }
};
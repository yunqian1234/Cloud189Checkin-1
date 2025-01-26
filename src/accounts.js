module.exports = () => {
    try {
        const tyAccounts = process.env.TY_ACCOUNTS || '[]';
        // 1. 去除所有换行符、回车符、制表符
        const cleanedAccounts = tyAccounts.replace(/[\r\n\t]+/g, '');
          // 2. 去除字符串头尾的空格
        const trimmedAccounts = cleanedAccounts.trim();
        // 3. 解析为 JSON 格式
        return JSON.parse(trimmedAccounts);
    } catch (e) {
        console.error('Failed to parse TY_ACCOUNTS:', process.env.TY_ACCOUNTS);
        return [];
    }
};
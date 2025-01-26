module.exports = () => {
    try {
        const tyAccounts = process.env.TY_ACCOUNTS || '[]';
        const cleanedAccounts = tyAccounts.replace(/[\r\n\t]+/g, '');
        const trimmedAccounts = cleanedAccounts.trim();
        return JSON.parse(trimmedAccounts);
    } catch (e) {
        console.error('Failed to parse TY_ACCOUNTS:', process.env.TY_ACCOUNTS, 'Error:', e);
        return [];
    }
};
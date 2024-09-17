export function formatToLocalDateTime(utcString: string) {
    // 将 UTC 时间字符串转换为 Date 对象
    const utcDate = new Date(utcString + ' UTC');
    
    // 使用 toLocaleString 来处理时区，并提取中国时区时间
    const localDateString = utcDate.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',  // 指定为中国时区 (UTC+8)
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false  // 使用24小时制
    });

    // 格式调整为 YYYY-MM-DD HH:mm:ss
    const [date, time] = localDateString.split(' ');
    return `${date.replace(/\//g, '-')} ${time}`;
  }

export function generateRandomPassword(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let password = '';
    
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    
    return password;
}
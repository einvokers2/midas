export function formatTimestampToDateString(timestamp: number, datetime:boolean): string {
    if (!timestamp) {
        return ''
    }
    const dateObj = new Date(timestamp);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以加 1
    const day = String(dateObj.getDate()).padStart(2, '0');
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    if (datetime) {
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } else {
        return `${year}-${month}-${day}`
    }
    
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
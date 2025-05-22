// QX环境模拟器

// 设置QX/Surge环境
function setupQxEnvironment() {
    // 创建模拟的QX/Surge环境
    window.$task = {
        fetch: (request) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        statusCode: 200,
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({success: true, data: {result: 'mock data'}}),
                    });
                }, 500);
            });
        }
    };
    
    window.$prefs = {
        valueForKey: (key) => {
            return localStorage.getItem(key);
        },
        setValueForKey: (value, key) => {
            localStorage.setItem(key, value);
            return true;
        }
    };
    
    window.$persistentStore = {
        read: (key) => {
            return localStorage.getItem(key);
        },
        write: (val, key) => {
            localStorage.setItem(key, val);
            return true;
        }
    };
    
    window.$notify = (title, subt, desc, opts) => {
        console.log(`通知: ${title}, ${subt}, ${desc}`);
        return {title, subt, desc};
    };
    
    window.$notification = {
        post: (title, subt, desc, opts) => {
            console.log(`通知: ${title}, ${subt}, ${desc}`);
            return {title, subt, desc};
        }
    };
    
    window.$done = (obj) => {
        console.log('脚本执行完成!');
        if (obj) {
            console.log(`返回结果: ${JSON.stringify(obj)}`);
        }
        return obj;
    };
}

// 在代码运行工具中调用此函数来设置QX环境
if (typeof window !== 'undefined') {
    window.setupQxEnvironment = setupQxEnvironment;
} 

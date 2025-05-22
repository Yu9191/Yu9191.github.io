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

    // Surge/Loon/Stash $httpClient 模拟
    window.$httpClient = {
        get: (options, cb) => {
            const url = typeof options === 'string' ? options : options.url;
            fetch(url)
                .then(resp => resp.text().then(body => cb(null, {status: resp.status, headers: Object.fromEntries(resp.headers.entries())}, body)))
                .catch(err => cb(err));
        },
        post: (options, cb) => {
            const fetchOpts = typeof options === 'string' ? {url: options} : options;
            fetch(fetchOpts.url, {method: 'POST', headers: fetchOpts.headers, body: fetchOpts.body})
                .then(resp => resp.text().then(body => cb(null, {status: resp.status, headers: Object.fromEntries(resp.headers.entries())}, body)))
                .catch(err => cb(err));
        }
    };
}

// 在代码运行工具中调用此函数来设置QX环境
if (typeof window !== 'undefined') {
    window.setupQxEnvironment = setupQxEnvironment;
} 

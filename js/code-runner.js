// 代码运行工具功能
window.initCodeRunner = function() {
    const codeEditor = document.getElementById('codeEditor');
    const codeOutput = document.getElementById('codeOutput');
    const runCodeBtn = document.getElementById('runCodeBtn');
    const clearCodeBtn = document.getElementById('clearCodeBtn');
    const clearOutputBtn = document.getElementById('clearOutputBtn');
    const codeLanguage = document.getElementById('codeLanguage');
    const exampleItems = document.querySelectorAll('.example-item');
    
    // 初始化编辑器内容
    const defaultCode = '// 在这里输入您的代码\nconsole.log("Hello, World!");';
    
    // 运行代码函数
    function runCode() {
        const code = codeEditor.textContent;
        const language = codeLanguage.value;
        
        // 清空之前的输出
        clearOutput();
        
        // 添加运行时间戳
        const timestamp = new Date().toLocaleTimeString();
        appendOutput('[' + timestamp + '] 开始运行...', 'output-info');
        
        try {
            if (language === 'javascript') {
                // 重写console.log等方法以捕获输出
                const originalConsoleLog = console.log;
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                const originalConsoleInfo = console.info;
                
                console.log = function() {
                    const args = Array.from(arguments).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (e) {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    });
                    appendOutput(args.join(' '));
                    originalConsoleLog.apply(console, arguments);
                };
                
                console.error = function() {
                    const args = Array.from(arguments);
                    appendOutput(args.join(' '), 'output-error');
                    originalConsoleError.apply(console, arguments);
                };
                
                console.warn = function() {
                    const args = Array.from(arguments);
                    appendOutput(args.join(' '), 'output-info');
                    originalConsoleWarn.apply(console, arguments);
                };
                
                console.info = function() {
                    const args = Array.from(arguments);
                    appendOutput(args.join(' '), 'output-info');
                    originalConsoleInfo.apply(console, arguments);
                };
                
                // 使用eval执行JavaScript代码
                const result = eval(code);
                
                // 如果有返回值，显示结果
                if (result !== undefined) {
                    appendOutput('结果: ' + result, 'output-success');
                }
                
                // 恢复原始的console方法
                console.log = originalConsoleLog;
                console.error = originalConsoleError;
                console.warn = originalConsoleWarn;
                console.info = originalConsoleInfo;
                
            } else if (language === 'html') {
                // 创建一个iframe来运行HTML代码
                const iframe = document.createElement('iframe');
                iframe.style.width = '100%';
                iframe.style.height = '200px';
                iframe.style.border = '1px solid var(--border-color)';
                iframe.style.borderRadius = '4px';
                iframe.style.marginTop = '10px';
                
                // 添加iframe到输出
                codeOutput.appendChild(iframe);
                
                // 写入HTML内容
                const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                iframeDocument.open();
                iframeDocument.write(code);
                iframeDocument.close();
                
                // 设置iframe的控制台输出重定向
                const iframeWindow = iframe.contentWindow;
                const originalConsoleLog = iframeWindow.console.log;
                
                iframeWindow.console.log = function() {
                    const args = Array.from(arguments);
                    appendOutput(args.join(' '));
                    originalConsoleLog.apply(iframeWindow.console, arguments);
                };
            } else if (language === 'qx' || language === 'surge') {
                // 设置QX环境
                if (window.setupQxEnvironment) {
                    window.setupQxEnvironment();
                }
                
                // 重写控制台输出
                const originalConsoleLog = console.log;
                const originalConsoleError = console.error;
                
                console.log = function() {
                    const args = Array.from(arguments).map(arg => {
                        if (typeof arg === 'object') {
                            try {
                                return JSON.stringify(arg, null, 2);
                            } catch (e) {
                                return String(arg);
                            }
                        }
                        return String(arg);
                    });
                    appendOutput(args.join(' '));
                    originalConsoleLog.apply(console, arguments);
                };
                
                console.error = function() {
                    const args = Array.from(arguments);
                    appendOutput(args.join(' '), 'output-error');
                    originalConsoleError.apply(console, arguments);
                };
                
                // 执行QX/Surge脚本（包裹为 async IIFE 支持 await）
                appendOutput('正在模拟QX/Surge环境运行脚本...', 'output-info');
                const wrappedCode = `(async () => {\n${code}\n})();`;
                eval(wrappedCode);
                
                // 恢复控制台方法
                console.log = originalConsoleLog;
                console.error = originalConsoleError;
            }
            
            appendOutput('代码执行成功!', 'output-success');
        } catch (error) {
            appendOutput('错误: ' + error.message, 'output-error');
            console.error(error);
        }
    }
    
    // 添加输出到结果区域
    function appendOutput(text, className = '') {
        const outputLine = document.createElement('div');
        outputLine.className = className;
        outputLine.textContent = text;
        codeOutput.appendChild(outputLine);
        
        // 自动滚动到底部
        codeOutput.scrollTop = codeOutput.scrollHeight;
    }
    
    // 清空输出区域
    function clearOutput() {
        codeOutput.innerHTML = '';
    }
    
    // 清空代码编辑器
    function clearEditor() {
        codeEditor.textContent = defaultCode;
    }
    
    // 初始化代码编辑器
    if (codeEditor && codeEditor.textContent.trim() === '') {
        codeEditor.textContent = defaultCode;
    }
    
    // 事件监听器
    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', runCode);
    }
    
    if (clearCodeBtn) {
        clearCodeBtn.addEventListener('click', clearEditor);
    }
    
    if (clearOutputBtn) {
        clearOutputBtn.addEventListener('click', clearOutput);
    }
    
    // 支持按Tab键输入制表符
    if (codeEditor) {
        codeEditor.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                
                // 插入制表符（4个空格）
                const selection = window.getSelection();
                const range = selection.getRangeAt(0);
                const tabNode = document.createTextNode('    ');
                range.insertNode(tabNode);
                
                // 移动光标到制表符后
                range.setStartAfter(tabNode);
                range.setEndAfter(tabNode);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });
    }
    
    // 示例代码点击事件
    exampleItems.forEach(item => {
        item.addEventListener('click', function() {
            const exampleCode = this.getAttribute('data-code');
            codeEditor.textContent = exampleCode;
        });
    });
    
    // 语言切换事件
    if (codeLanguage) {
        codeLanguage.addEventListener('change', function() {
            const language = this.value;
            
            if (language === 'html') {
                // HTML示例代码
                codeEditor.textContent = '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>HTML示例</title>\n    <style>\n        body {\n            font-family: Arial, sans-serif;\n            padding: 20px;\n        }\n        h1 {\n            color: #333;\n        }\n        .container {\n            border: 1px solid #ddd;\n            padding: 15px;\n            border-radius: 5px;\n        }\n    </style>\n</head>\n<body>\n    <h1>HTML示例页面</h1>\n    <div class="container">\n        <p>这是一个HTML示例。您可以编辑HTML代码并运行它。</p>\n        <button onclick="showMessage()">点击我</button>\n    </div>\n    \n    <script>\n        function showMessage() {\n            alert(\'你好！这是一个HTML示例。\');\n            console.log(\'按钮被点击了\');\n        }\n    </script>\n</body>\n</html>';
            } else if (language === 'qx' || language === 'surge') {
                // 从外部文件加载QX脚本示例
                fetch('./js/script-example.js')
                    .then(response => response.text())
                    .then(text => {
                        codeEditor.textContent = text;
                    })
                    .catch(error => {
                        codeEditor.textContent = '// 加载QX脚本示例失败\n// 请尝试刷新页面';
                        console.error('加载脚本失败:', error);
                    });
            } else {
                codeEditor.textContent = defaultCode;
            }
        });
    }
    
    return {
        runCode,
        clearOutput,
        clearEditor,
        appendOutput
    };
}; 

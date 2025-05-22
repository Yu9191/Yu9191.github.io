// QX/Surge脚本示例
const $ = new Env('脚本名称');

!(async () => {
  try {
    // 模拟一些数据
    const data = {
      username: '测试用户',
      balance: 100,
      expiry: '2023-12-31'
    };
    
    $.log('开始执行脚本');
    $.log('用户信息:', JSON.stringify(data));
    
    // 模拟一个HTTP请求
    const mockRequest = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({status: 200, body: '请求成功'});
        }, 1000);
      });
    };
    
    $.log('发送请求...');
    const result = await mockRequest();
    $.log('请求结果:', JSON.stringify(result));
    
    // 发送通知
    $.msg('脚本执行通知', '执行成功', `用户: ${data.username}\n余额: ${data.balance}\n到期时间: ${data.expiry}`);
    
  } catch (e) {
    $.logErr(e, '脚本执行异常');
  } finally {
    $.done();
  }
})(); 

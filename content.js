// 爬取AAAI论文数据
async function scrapeAAAIPapers(keyword = 'fake news') {
  const papers = [];
  try {
    // AAAI数字图书馆的URL
    const url = `https://aaai.org/papers/search/?query=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    const html = await response.text();
    
    // 创建一个DOM解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // 获取所有论文条目
    const paperElements = doc.querySelectorAll('.paper-item');
    
    for (const element of paperElements) {
      const paper = {
        title: element.querySelector('.title')?.textContent?.trim() || '',
        authors: element.querySelector('.authors')?.textContent?.trim() || '',
        abstract: element.querySelector('.abstract')?.textContent?.trim() || '',
        year: element.querySelector('.year')?.textContent?.trim() || '',
        url: element.querySelector('a')?.href || ''
      };
      papers.push(paper);
    }
  } catch (error) {
    console.error('爬取论文时出错:', error);
  }
  return papers;
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapePapers') {
    scrapeAAAIPapers(request.keyword)
      .then(papers => sendResponse({ success: true, papers }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // 表明我们会异步发送响应
  }
});

function itemUserProfile(){
    return [
        "浙江工业大学（屏峰校区）"
    ]
}

function itemUserFollow(){
    return [
        "猛火蛋炒饭（仅送校内）", "蜜汁烤肉+脆皮鸡+千张丝+土豆丝+米饭", "黄焖鸡米饭+油豆腐+千张+米饭",
        "香辣鸡腿堡+辣味鸡肉卷+华香脆骨串+中可",
        "蛋炒饭+里脊+王中王+牛肉丸", "满杯多肉葡萄（大杯）"
    ]
}

function getFormattedCurrentTime() {
    const now = new Date();
    const year = now.getFullYear(); // 获取年份
    const month = ('0' + (now.getMonth() + 1)).slice(-2); // 获取月份，月份从0开始，所以加1
    const day = ('0' + now.getDate()).slice(-2); // 获取日期
    const hour = ('0' + now.getHours()).slice(-2); // 获取小时
    const minute = ('0' + now.getMinutes()).slice(-2); // 获取分钟
    const second = ('0' + now.getSeconds()).slice(-2); // 获取秒数

    // 按照 "YYYY-MM-DD HH:MM:SS" 格式拼接字符串
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('收到消息:', request);
  
  if (request.action === 'showAbstract') {
    // 确保layui已加载
    if (typeof layui === 'undefined') {
      console.error('Layui未加载');
      // 尝试重新加载layui
      loadLayui();
      return;
    }

    layui.use(['layer'], function(){
      const layer = layui.layer;
      layer.open({
        type: 1,
        title: '论文摘要',
        area: ['600px', '400px'],
        shadeClose: true,
        content: `
          <div style="padding: 20px;">
            <h3 style="margin-bottom: 10px;font-size: 16px;">${request.data.title}</h3>
            <p style="line-height: 1.6;font-size: 14px;">${request.data.abstract}</p>
          </div>
        `
      });
    });
  }
});

// 加载layui函数
function loadLayui() {
  // 添加layui的CSS
  if (!document.querySelector('link[href*="layui.css"]')) {
    const layuiCSS = document.createElement('link');
    layuiCSS.rel = 'stylesheet';
    layuiCSS.href = chrome.runtime.getURL('layui/css/layui.css');
    document.head.appendChild(layuiCSS);
  }

  // 添加layui的JS
  if (!document.querySelector('script[src*="layui.js"]')) {
    const layuiScript = document.createElement('script');
    layuiScript.src = chrome.runtime.getURL('layui/layui.js');
    layuiScript.onload = function() {
      console.log('Layui加载完成');
    };
    document.head.appendChild(layuiScript);
  }
}

// 页面加载时就初始化layui
loadLayui();
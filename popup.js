document.addEventListener('DOMContentLoaded', function() {
  const searchButton = document.getElementById('searchButton');
  const searchInput = document.getElementById('searchInput');
  const platformSelect = document.getElementById('platformSelect');
  const yearSelect = document.getElementById('yearSelect');
  const resultsDiv = document.getElementById('results');
  const loadingDiv = document.getElementById('loading');

  // 初始化layui
  layui.use(['layer'], function(){
    const layer = layui.layer;
    
    searchButton.addEventListener('click', function() {
      // 获取输入值
      const keyword = searchInput.value.trim();
      const platform = platformSelect.value;
      const year = yearSelect.value;
      
      // 验证输入
      let errorMsg = '';
      if (!platform) {
        errorMsg = '请选择检索平台';
      } else if (!year) {
        errorMsg = '请选择年份';
      } else if (!keyword) {
        errorMsg = '请输入关键词';
      }

      // 如果有错误，显示提示并返回
      if (errorMsg) {
        layer.msg(errorMsg, {
          icon: 2,  // 错误图标
          offset: 't',  // 顶部显示
          anim: 6,  // 抖动动画
          time: 2000  // 2秒后自动关闭
        });
        return;
      }

      // 添加loading状态
      searchButton.classList.add('loading');
      searchButton.disabled = true;
      loadingDiv.style.display = 'block';
      resultsDiv.innerHTML = '';

      console.log('发送请求:', {
        keyword: keyword,
        platform: platform,
        year: year
      });

      $.ajax({
        url: 'http://127.0.0.1:5000/aaai_papers',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          keyword: keyword,
          platform: platform,
          year: year
        }),
        success: function(response) {
          console.log('收到原始数据:', response);
          
          let papers = [];
          if (response && response.data) {
            papers = response.data;
            if (papers.length === 0) {
              // 没有找到相关论文时的提示
              layer.msg('未找到相关论文', {
                icon: 0,  // 信息图标
                offset: 't',
                time: 2000
              });
            }
            displayResults(papers, layer);
          } else {
            console.error('响应中没有data字段:', response);
            layer.msg('数据格式错误', {
              icon: 2,
              offset: 't',
              time: 2000
            });
          }
        },
        error: function(xhr, status, error) {
          console.error('完整错误信息:', error);
          layer.msg('获取论文失败: ' + error, {
            icon: 2,
            offset: 't',
            time: 3000
          });
        },
        complete: function() {
          // 移除loading状态
          searchButton.classList.remove('loading');
          searchButton.disabled = false;
          loadingDiv.style.display = 'none';
        }
      });
    });
  });

  function displayResults(papers, layer) {
    if (papers.length === 0) {
      resultsDiv.innerHTML = '<div class="no-results">未找到相关论文</div>';
      return;
    }

    let html = '';
    
    papers.forEach(paper => {
      console.log('处理论文数据:', {
        title: paper.title,
        authors: paper.authors,
        published: paper.published
      });
      
      html += `
        <div class="paper-item layui-card">
          <div class="layui-card-header">
            <h3 title="${paper.title || '无标题'}">${paper.title || '无标题'}</h3>
            <p class="authors" title="${paper.authors || '暂无作者信息'}">
              作者：${paper.authors || '暂无作者信息'}
            </p>
            <p class="year">
              发布日期：${paper.published || '暂无日期信息'}
            </p>
          </div>
          <div class="layui-card-body">
            <a class="layui-btn layui-btn-xs layui-btn-normal original-link" href="javascript:void(0);" data-url="${paper.url}">
              <i class="layui-icon layui-icon-link"></i>原文链接
            </a>
            <button class="layui-btn layui-btn-xs show-abstract">
              <i class="layui-icon layui-icon-read"></i>查看摘要
            </button>
          </div>
        </div>
      `;
    });

    resultsDiv.innerHTML = html;

    // 处理原文链接点击
    $('.original-link').each(function() {
      $(this).on('click', function(e) {
        e.preventDefault();
        const url = $(this).data('url');
        chrome.tabs.create({ url: url, active: false });  // active: false 表示在后台打开
      });
    });

    // 处理摘要按钮点击
    $('.show-abstract').each(function(index) {
      $(this).on('click', function() {
        const paper = papers[index];
        layer.open({
          type: 1,
          title: '论文摘要',
          area: ['600px', '400px'],
          shadeClose: true,
          content: `
            <div style="padding: 20px;">
              <h3 style="margin-bottom: 10px;font-size: 16px;">${paper.title}</h3>
              <p style="line-height: 1.6;font-size: 14px;">${paper.abstract || '暂无摘要'}</p>
            </div>
          `
        });
      });
    });
  }
});
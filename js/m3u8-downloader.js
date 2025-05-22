class M3u8Downloader {
    constructor() {
        this.downloaderElement = document.querySelector('.futuristic-m3u8-downloader');
        this.closeButton = this.downloaderElement.querySelector('.m3u8-close');
        this.urlInput = this.downloaderElement.querySelector('.m3u8-input');
        this.downloadButton = this.downloaderElement.querySelector('#downloadBtn');
        this.convertButton = this.downloaderElement.querySelector('#convertBtn');
        this.progressBar = this.downloaderElement.querySelector('.m3u8-progress-bar');
        this.statusText = this.downloaderElement.querySelector('.m3u8-status');
        this.segmentsContainer = this.downloaderElement.querySelector('.m3u8-segments');
        
        this.segments = [];
        this.isDownloading = false;
        this.isConverting = false;
        
        this.init();
    }
    
    init() {
        if (!this.downloaderElement) return;
        
        this.closeButton.addEventListener('click', () => this.hide());
        this.downloadButton.addEventListener('click', () => this.downloadM3u8());
        this.convertButton.addEventListener('click', () => this.convertToMp4());
        
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.downloaderElement.style.display === 'block') {
                this.hide();
            }
        });
    }
    
    show() {
        if (!this.downloaderElement) return;
        this.downloaderElement.style.display = 'block';
        this.downloaderElement.style.opacity = '0';
        this.downloaderElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        requestAnimationFrame(() => {
            this.downloaderElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            this.downloaderElement.style.opacity = '1';
            this.downloaderElement.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        this.urlInput.focus();
        this.resetState();
    }
    
    hide() {
        if (!this.downloaderElement) return;
        this.downloaderElement.style.opacity = '0';
        this.downloaderElement.style.transform = 'translate(-50%, -50%) scale(0.95)';
        setTimeout(() => {
            this.downloaderElement.style.display = 'none';
        }, 300);
    }
    
    resetState() {
        this.segments = [];
        this.isDownloading = false;
        this.isConverting = false;
        this.urlInput.value = '';
        this.progressBar.style.width = '0%';
        this.statusText.textContent = '准备就绪';
        this.segmentsContainer.innerHTML = '';
        this.downloadButton.disabled = false;
        this.convertButton.disabled = true;
    }
    
    async downloadM3u8() {
        const m3u8Url = this.urlInput.value.trim();
        if (!m3u8Url) {
            alert('请输入M3U8链接！');
            return;
        }
        
        if (this.isDownloading) {
            alert('已有一个下载任务正在进行！');
            return;
        }
        
        this.resetState();
        this.isDownloading = true;
        this.downloadButton.disabled = true;
        this.statusText.textContent = '正在解析M3U8...';
        
        try {
            const response = await fetch(m3u8Url);
            if (!response.ok) throw new Error(`无法获取M3U8文件: ${response.statusText}`);
            const m3u8Content = await response.text();
            
            this.parseM3u8Content(m3u8Content, m3u8Url);
            if (this.segments.length === 0) throw new Error('M3U8文件中没有找到有效的视频片段。');
            
            this.renderSegmentsUI();
            await this.downloadAllSegments();
            
            this.statusText.textContent = '所有片段下载完成！';
            this.convertButton.disabled = false;
            
        } catch (error) {
            console.error('M3U8下载失败:', error);
            this.statusText.textContent = `错误: ${error.message}`;
            alert(`下载失败: ${error.message}`);
        } finally {
            this.isDownloading = false;
            this.downloadButton.disabled = false;
        }
    }
    
    parseM3u8Content(content, baseUrl) {
        const lines = content.split(/\r?\n/);
        let segmentIndex = 0;
        for (const line of lines) {
            if (line.startsWith('#EXTINF:')) {
                // Potentially parse duration or other info here if needed
            } else if (line && !line.startsWith('#')) {
                let segmentUrl = line;
                if (!segmentUrl.startsWith('http')) {
                    const base = new URL(baseUrl);
                    const pathParts = base.pathname.split('/');
                    pathParts.pop();
                    segmentUrl = new URL(line, `${base.origin}${pathParts.join('/')}/`).href;
                }
                this.segments.push({ id: segmentIndex++, url: segmentUrl, status: 'pending', blob: null });
            }
        }
    }
    
    renderSegmentsUI() {
        this.segmentsContainer.innerHTML = '';
        this.segments.forEach(segment => {
            const div = document.createElement('div');
            div.className = 'm3u8-segment';
            div.dataset.segmentId = segment.id;
            div.innerHTML = `
                <div class="m3u8-segment-status ${segment.status}"></div>
                <div class="m3u8-segment-info">片段 ${segment.id + 1} (${segment.status})</div>
            `;
            this.segmentsContainer.appendChild(div);
        });
    }
    
    async downloadAllSegments() {
        let downloadedCount = 0;
        const totalSegments = this.segments.length;
        this.statusText.textContent = `开始下载 ${totalSegments} 个片段...`;
        
        for (const segment of this.segments) {
            try {
                this.updateSegmentStatus(segment.id, 'downloading');
                const response = await fetch(segment.url);
                if (!response.ok) throw new Error(`片段 ${segment.id + 1} 下载失败: ${response.statusText}`);
                segment.blob = await response.blob();
                segment.status = 'completed';
                this.updateSegmentStatus(segment.id, 'completed');
                downloadedCount++;
                this.progressBar.style.width = `${(downloadedCount / totalSegments) * 100}%`;
                this.statusText.textContent = `已下载 ${downloadedCount}/${totalSegments} 个片段...`;
            } catch (error) {
                console.error(`下载片段 ${segment.id + 1} 失败:`, error);
                segment.status = 'error';
                this.updateSegmentStatus(segment.id, 'error');
                throw new Error(`下载片段 ${segment.id + 1} 失败. ${error.message}`);
            }
        }
    }
    
    updateSegmentStatus(segmentId, status) {
        const segmentDiv = this.segmentsContainer.querySelector(`.m3u8-segment[data-segment-id="${segmentId}"]`);
        if (segmentDiv) {
            const statusDiv = segmentDiv.querySelector('.m3u8-segment-status');
            const infoDiv = segmentDiv.querySelector('.m3u8-segment-info');
            statusDiv.className = `m3u8-segment-status ${status}`;
            infoDiv.textContent = `片段 ${segmentId + 1} (${status})`;
        }
    }
    
    async convertToMp4() {
        if (this.segments.length === 0 || this.segments.some(s => s.status !== 'completed')) {
            alert('请先完成所有片段的下载！');
            return;
        }
        if (this.isConverting) {
            alert('正在转换中，请稍候...');
            return;
        }
        
        this.isConverting = true;
        this.convertButton.disabled = true;
        this.statusText.textContent = '正在合并片段为MP4...';
        
        try {
            const blobs = this.segments.map(s => s.blob);
            const mergedBlob = new Blob(blobs, { type: 'video/mp4' });
            
            const downloadUrl = URL.createObjectURL(mergedBlob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = `video_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            
            this.statusText.textContent = 'MP4转换并下载完成！';
            this.resetState();
            
        } catch (error) {
            console.error('MP4转换失败:', error);
            this.statusText.textContent = `MP4转换错误: ${error.message}`;
            alert(`MP4转换失败: ${error.message}`);
        } finally {
            this.isConverting = false;
            this.convertButton.disabled = false;
        }
    }
}

if (document.querySelector('.futuristic-m3u8-downloader')) {
    window.m3u8Downloader = new M3u8Downloader();
} 
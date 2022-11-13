const timeout = ms =>
    new Promise((_, reject) => setTimeout(() => reject(Symbol.for('timeout')), ms));

const delay = ms => new Promise((resolve, _) => setTimeout(resolve, ms));

const request = ({ config, target, timeoutTime = 100, delayTime = 300 }) => {
    // 返回promise的ajax请求
    const promise = new Promise((resolve, reject) => {
        const key = localStorage.getItem('key')
        const ajax = $.ajax({
            ...config,
            headers: {
                ...config.headers,
                AccessKey: key ? key : ''
            }
        })
        ajax.done(res => {
            resolve(res)
        })

    });

    const startLoading = target => {
        if (!target) {
            return;
        } else {
            const loadingHtml = '<img class="loading-img" src="/static/themes/win98/static/img/loadingGif.gif">'
            $(target).append(loadingHtml)
        }
    };

    const endLoading = (target) => {
        $(target + ' .loading-img').remove()
    };

    const handleSuccess = data => {
        // 兼容Promise.all和Promise.race不同的返回值
        const response = Array.isArray(data) ? data[0] : data;
        // 处理成功的情况
        return Promise.resolve(response);
    };

    const handleError = ({ response }) => {
        // 处理失败的情况
        return Promise.reject(response);
    };

    return Promise.race([promise, timeout(timeoutTime)])
        .then(handleSuccess)
        .catch(err => {
            if (Symbol.for('timeout') === err) {
                startLoading(target);
                return Promise.all([promise, delay(delayTime)])
                    .then(handleSuccess)
                    .catch(handleError)
                    .finally(() => {
                        endLoading(target);
                    });
            }
            return handleError(err);
        });
};
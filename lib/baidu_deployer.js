var pathFn = require('path');
var fs = require('fs');
var request = require('request');

module.exports = function (args) {
    const { config, log } = this;
    const { url_submission, url } = config;
    const extName = 'url_submission: ';

    const { baidu_token, urls_path, channel } = url_submission;

    const token = baidu_token || process.env.BAIDU_TOKEN;

    let urls = ''

    if ('' === token || channel.indexOf('baidu') === -1) {
        log.error(extName.concat("Baidu submiter off."))
        return
    }

    try {
        let UrlsFile = pathFn.join(this.public_dir, urls_path)
        urls = fs.readFileSync(UrlsFile, 'utf8')
    } catch (error) {
        log.error(extName.concat('Extract url file failed.'))
        return
    }

    log.info(extName.concat("Submitting urls to baidu engine..."))

    var target = "http://data.zz.baidu.com/urls?site=" + url + "&token=" + token;
    request({
        url: target,
        method: 'POST',
        headers: {
            'Content-type': 'text/plain'
        },
        body: urls
    }, function (error, response, body) {
        if (!error) {
            // Success
            /*
            *  {
                    "remain":99998,
                    "success":2,
                    "not_same_site":[],
                    "not_valid":[]
                }
            */
            // Failed
            /*
            *  {
                    "error":401,
                    "message":"token is not valid"
                }
            */
            let message = ''
            const respJson = JSON.parse(response.body)
            if (response.statusCode === 200) {
                message = message.concat('success: [success: ', respJson.success, ', remain: ', respJson.remain)
            } else {
                message = message.concat('failed: [', respJson.message)
            }
            log.info(extName.concat("Submit to baidu engine ", message, ']'));
            return
        }
        log.error(extName.concat('Submit to baidu engine error: [', error, ']'))
    })
};
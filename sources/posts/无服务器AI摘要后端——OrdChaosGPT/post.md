时隔一年，终于抽出来时间完全重写了AI摘要的后端。

<!--more-->

## 起因

TianliGPT的文章摘要很好用，但是本来会能够根据content保证摘要不重复生成，现在不行了，不知道为什么。（我知道现在改为用url鉴别了，但是我的js最开始我就自己改过了，没有更新）

于是每刷新一次摘要就重新生成一次，token余额哗哗掉。

想着与其重新改一遍js，不如全权改为自己的版本，于是就有了这个项目。

现在本文（以及其它文章）开头的摘要就是来自OrdChaosGPT的了。

## 介绍

大概是TianliGPT的下位代替品

使用阿里云通义千问（qwen-long）作为摘要生成引擎，Vercel部署，MySQL数据库持久化数据储存

优势是无服务器（？真的是优势吗）

缺点是稳定性（至少我不提供SLA保证）与速度（依据文章长度与网速，获取到摘要的时间平均约10秒）

仓库地址：[ordchaosgpt-cloud-function](https://github.com/OrdChaos/ordchaosgpt-cloud-function)

## 经历

最开始还是想着用rust写一个服务端跑在docker上。

服务端倒是好写：

```rust
use actix_web::{post, web, App, HttpServer, Responder, HttpResponse, HttpRequest};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::fs;
use reqwest::Client;
use serde_json::json;

#[derive(Serialize, Deserialize)]
struct SummaryRequest {
    content: String,
    url: String,
}

#[derive(Serialize, Deserialize)]
struct SummaryResponse {
    url: String,
    summary: String,
}

struct AppState {
    auth_token: String,
}

const SUMMARY_DIR: &str = "summaries";

fn is_valid_referer(referer: Option<&str>) -> bool {
    if let Some(ref_url) = referer {
        let valid_domains = vec![
            ".ordchaos.com",
            ".ordchaos.top",
            ".ordchaos.eu.org",
        ];
        return valid_domains.iter().any(|domain| ref_url.ends_with(domain));
    }
    false
}

async fn generate_summary(content: &str) -> Result<String, Box<dyn std::error::Error>> {
    let api_key = "*******************************";
    let api_url = "https://dashscope.aliyuncs.com/compatible-mode/v1";
    let client = Client::new();

    let request_body = json!({
        "model": "qwen-long",
        "messages": [
            {"role": "system", "content": "You are a helpful summary generator."},
            {"role": "user", "content": format!("请为以下内容用中文生成长度为150汉字左右的摘要，摘要只有一个自然段，且只给出摘要即可，不要说其他任何话: {}", content)}
        ],
        "temperature": 0.8,
        "top_p": 0.8
    });

    let response = client
        .post(format!("{}/chat/completions", api_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await?;

    let response_json: serde_json::Value = response.json().await?;
    let summary = response_json["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("摘要生成失败：返回格式不正确")
        .to_string();

    Ok(summary.trim().to_string())
}

fn save_summary(abbrlink: &str, summary_data: &SummaryResponse) -> std::io::Result<()> {
    let summary_path = format!("{}/{}.json", SUMMARY_DIR, abbrlink);
    let json_data = serde_json::to_string(summary_data)?;
    fs::write(&summary_path, &json_data)?;
    Ok(())
}

fn load_summary(abbrlink: &str) -> Option<SummaryResponse> {
    let summary_path = format!("{}/{}.json", SUMMARY_DIR, abbrlink);
    if Path::new(&summary_path).exists() {
        if let Ok(json_data) = fs::read_to_string(&summary_path) {
            if let Ok(summary) = serde_json::from_str(&json_data) {
                return Some(summary);
            }
        }
    }
    None
}

#[post("/generate-summary")]
async fn generate_summary_handler(
    data: web::Data<AppState>,
    req: HttpRequest,
    summary_request: web::Json<SummaryRequest>
) -> impl Responder {
    if let Some(auth_header) = req.headers().get("Authorization") {
        let token = auth_header.to_str().unwrap_or("").trim_start_matches("Bearer ");
        if token != data.auth_token {
            return HttpResponse::Unauthorized().body("鉴权失败：Token不正确");
        }
    } else {
        return HttpResponse::Unauthorized().body("鉴权失败：缺失Token");
    }

    let referer = req.headers().get("Referer").and_then(|v| v.to_str().ok());
    let origin = req.headers().get("Origin").and_then(|v| v.to_str().ok());
    if !is_valid_referer(referer) && !is_valid_referer(origin) {
        return HttpResponse::Forbidden().body("拒绝生成摘要：来源不正确");
    }

    let abbrlink = summary_request.url
        .split('/')
        .filter(|&segment| !segment.is_empty())
        .last()
        .unwrap_or("");

    if abbrlink.is_empty() {
        return HttpResponse::BadRequest().body("Invalid URL format");
    }

    if let Some(existing_summary) = load_summary(abbrlink) {
        return HttpResponse::Ok().json(existing_summary);
    }

    let summary = match generate_summary(&summary_request.content).await {
        Ok(summary) => summary,
        Err(_) => return HttpResponse::InternalServerError().body("摘要生成失败"),
    };

    let summary_data = SummaryResponse {
        url: summary_request.url.clone(),
        summary: summary.clone(),
    };

    if let Err(err) = save_summary(abbrlink, &summary_data) {
        return HttpResponse::InternalServerError().body(format!("存储摘要失败： {}", err));
    }

    HttpResponse::Ok().json(summary_data)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    fs::create_dir_all(SUMMARY_DIR)?;
    let auth_token = std::env::var("AUTH_TOKEN").expect("AUTH_TOKEN 未被设置");

    println!("服务端已经在 http://localhost:11451 开启");

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(AppState {
                auth_token: auth_token.clone(),
            }))
            .service(generate_summary_handler)
    })
    .bind("127.0.0.1:11451")?
    .run()
    .await
}
```

（有兴趣就拿去用吧，标识原作者就好）

结果部署docker的时候服务器炸了，原因未知。

所以想着还是别再折腾我那辣鸡服务器了，遂转为用JavaScript写云函数，主打一个Serverless.

没什么好说的，主要是第一次写不太熟练，本身还是挺简单的。

遇到的问题是MongoDB没连上，无奈改为MySQL<span class="heimu" title="你知道的太多了">结果用的还是服务器上的数据库</span>。

## 部署

如果你想使用的话，前往[这个项目的仓库](https://github.com/OrdChaos/ordchaosgpt-cloud-function)参考`readme.md`即可。

部署非常简单，有手就行，要求自备MySQL数据库。

## 题外话

写了一上午的JS（

那就这样，886
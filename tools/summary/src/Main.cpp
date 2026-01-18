#define CPPHTTPLIB_OPENSSL_SUPPORT

#include <iostream>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <iomanip>

#include "../lib/nlohmann/json.hpp"
#include "../lib/httplib.h"

const std::string API_HOST = "dashscope.aliyuncs.com";

auto get_api_key() -> std::string{
    // 统一读取名为 DASHSCOPE_API_KEY 的环境变量
    const char* key = std::getenv("DASHSCOPE_API_KEY");
    if (key == nullptr) {
        return "";
    }
    return std::string(key);
}

std::string ensure_valid_utf8(const std::string& input) {
    std::string result;
    result.reserve(input.length());
    
    for (size_t i = 0; i < input.length(); ) {
        unsigned char byte = static_cast<unsigned char>(input[i]);
        
        if ((byte & 0x80) == 0) { // ASCII字符
            result += input[i];
            i++;
        } else if ((byte & 0xE0) == 0xC0) { // 2字节UTF-8字符
            if (i + 1 < input.length() && 
                (static_cast<unsigned char>(input[i+1]) & 0xC0) == 0x80) {
                result += input[i];
                result += input[i+1];
                i += 2;
            } else {
                i++; // 跳过损坏的字节
            }
        } else if ((byte & 0xF0) == 0xE0) { // 3字节UTF-8字符
            if (i + 2 < input.length() && 
                (static_cast<unsigned char>(input[i+1]) & 0xC0) == 0x80 &&
                (static_cast<unsigned char>(input[i+2]) & 0xC0) == 0x80) {
                result += input[i];
                result += input[i+1];
                result += input[i+2];
                i += 3;
            } else {
                i++; // 跳过损坏的字节
            }
        } else if ((byte & 0xF8) == 0xF0) { // 4字节UTF-8字符
            if (i + 3 < input.length() && 
                (static_cast<unsigned char>(input[i+1]) & 0xC0) == 0x80 &&
                (static_cast<unsigned char>(input[i+2]) & 0xC0) == 0x80 &&
                (static_cast<unsigned char>(input[i+3]) & 0xC0) == 0x80) {
                result += input[i];
                result += input[i+1];
                result += input[i+2];
                result += input[i+3];
                i += 4;
            } else {
                i++; // 跳过损坏的字节
            }
        } else {
            i++; // 跳过无效字节
        }
    }
    
    return result;
}

// 安全地截取UTF-8字符串，避免破坏字符边界
std::string safe_sub_string(const std::string& str, size_t maxBytes) {
    if (str.length() <= maxBytes) {
        return str;
    }
    
    size_t safeLength = 0;
    while (safeLength < maxBytes) {
        unsigned char byte = static_cast<unsigned char>(str[safeLength]);
        
        // 检查是否为多字节字符的开始
        if ((byte & 0x80) == 0) { // ASCII
            safeLength++;
        } else if ((byte & 0xE0) == 0xC0) { // 2字节字符
            if (safeLength + 1 < maxBytes) safeLength += 2;
            else break;
        } else if ((byte & 0xF0) == 0xE0) { // 3字节字符
            if (safeLength + 2 < maxBytes) safeLength += 3;
            else break;
        } else if ((byte & 0xF8) == 0xF0) { // 4字节字符
            if (safeLength + 3 < maxBytes) safeLength += 4;
            else break;
        } else {
            // 无效字节，停止截取
            break;
        }
    }
    
    return str.substr(0, safeLength);
}

auto generatesummary(const std::string& post_content) -> std::string {
    httplib::SSLClient cli(API_HOST);
    cli.set_read_timeout(60, 0); 

    std::string valid_content = ensure_valid_utf8(post_content);
    
    // 构建 OpenAI 兼容模式的请求体
    nlohmann::json request_body = {
        {"model", "qwen-plus"},
        {"messages", {
            {{"role", "system"}, {"content", "你是专业总结助手，请用一句话精炼总结文章（忽略截断）；须用第三人称，原博文中“我”统一称为“博主”，用“这篇博文”指代文章本身；严禁以“这篇文章由博主撰写”等废话开头，直接陈述核心内容。"}},
            {{"role", "user"}, {"content", valid_content}}
        }},
        {"temperature", 0.7}
    };

    // 注意：Headers 里不要写 Content-Type，后面 Post 参数会带上
    httplib::Headers headers = {
        {"Authorization", "Bearer " + get_api_key()}
    };

    // 1. 修改路径为兼容模式路径
    // 2. 确保 Post 参数正确
    auto res = cli.Post("/compatible-mode/v1/chat/completions", headers, 
                        request_body.dump(), "application/json");

    if (res && res->status == 200) {
        try {
            auto res_json = nlohmann::json::parse(res->body);
            // 兼容模式的返回结构不同，需解析 choices[0].message.content
            if (res_json.contains("choices") && !res_json["choices"].empty()) {
                return res_json["choices"][0]["message"]["content"].get<std::string>();
            } else {
                return "[Summary] Unexpected response format: " + res->body;
            }
        } catch (const std::exception& e) {
            return "[Summary] Failed to parse JSON response: " + std::string(e.what());
        }
    } else {
        std::string error_details = res ? res->body : "Connection failed";
        std::string error_msg = res ? std::to_string(res->status) : "Connection failed";
        return "[Summary] API Request failed: " + error_msg + " Details: " + error_details;
    }
}

auto main(int argc, char *argv[]) -> int {
    if(argc != 2) {
        std::cerr << "[Summary] Usage: summary <posts_root_directory>" << std::endl;
        return 1;
    }

    const std::filesystem::path POST_ROOT = argv[1];
    for(const auto& post_dire : std::filesystem::directory_iterator(POST_ROOT)) {
        if(!post_dire.is_directory()) {
            continue;
        }

        std::filesystem::path summary_file = post_dire.path() / "summary.txt";
        if(std::filesystem::exists(summary_file)) {
            continue;
        }

        std::filesystem::path content_file = post_dire.path() / "post.md";
        if(!std::filesystem::exists(content_file)) {
            std::cerr << "[Summary] post.md not found in " << post_dire.path() << ", skipping..." << std::endl;
            continue;
        }

        std::ifstream content_ifs(content_file);
        std::stringstream buffer;
        buffer << content_ifs.rdbuf();
        std::string full_content = buffer.str();

        // 使用安全的UTF-8截取方法
        if (full_content.length() > 10000) {
            full_content = safe_sub_string(full_content, 10000);
        }

        std::cout << "[Summary] Generating for: " << post_dire.path().filename() << "..." << std::endl;
        std::string summary = generatesummary(full_content);
        std::cout << "[Summary] Generated: " << summary << std::endl;

        std::ofstream summary_ofs(summary_file, std::ios::out | std::ios::trunc);
        summary_ofs << summary;
        summary_ofs.close();
    }

    return 0;
}
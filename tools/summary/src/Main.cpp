#define CPPHTTPLIB_OPENSSL_SUPPORT

#include <iostream>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <iomanip>

#include "../lib/nlohmann/json.hpp"
#include "../lib/httplib.h"

const std::string API_HOST = "dashscope.aliyuncs.com";
const std::string PROMPT = "你是专业总结助手，请用一句话精炼总结文章（忽略截断）；须用第三人称，原博文中“我”统一称为“博主”，用“这篇博文”指代文章本身；严禁以“这篇文章由博主撰写”等废话开头，直接陈述核心内容。";
const unsigned int MAX_CONTENT_LENGTH = 10000;

auto get_api_key() -> std::string{
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
        
        if ((byte & 0x80) == 0) {
            result += input[i];
            i++;
        } else if ((byte & 0xE0) == 0xC0) {
            if (i + 1 < input.length() && 
                (static_cast<unsigned char>(input[i+1]) & 0xC0) == 0x80) {
                result += input[i];
                result += input[i+1];
                i += 2;
            } else {
                i++;
            }
        } else if ((byte & 0xF0) == 0xE0) {
            if (i + 2 < input.length() && 
                (static_cast<unsigned char>(input[i+1]) & 0xC0) == 0x80 &&
                (static_cast<unsigned char>(input[i+2]) & 0xC0) == 0x80) {
                result += input[i];
                result += input[i+1];
                result += input[i+2];
                i += 3;
            } else {
                i++;
            }
        } else if ((byte & 0xF8) == 0xF0) {
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
                i++;
            }
        } else {
            i++;
        }
    }
    
    return result;
}

std::string safe_sub_string(const std::string& str, size_t maxBytes) {
    if (str.length() <= maxBytes) {
        return str;
    }
    
    size_t safeLength = 0;
    while (safeLength < maxBytes) {
        unsigned char byte = static_cast<unsigned char>(str[safeLength]);
        
        if ((byte & 0x80) == 0) {
            safeLength++;
        } else if ((byte & 0xE0) == 0xC0) {
            if (safeLength + 1 < maxBytes) safeLength += 2;
            else break;
        } else if ((byte & 0xF0) == 0xE0) {
            if (safeLength + 2 < maxBytes) safeLength += 3;
            else break;
        } else if ((byte & 0xF8) == 0xF0) {
            if (safeLength + 3 < maxBytes) safeLength += 4;
            else break;
        } else {
            break;
        }
    }
    
    return str.substr(0, safeLength);
}

auto generatesummary(const std::string& post_content) -> std::string {
    httplib::SSLClient cli(API_HOST);
    cli.set_read_timeout(60, 0); 

    std::string valid_content = ensure_valid_utf8(post_content);
    
    nlohmann::json request_body = {
        {"model", "qwen-plus"},
        {"messages", {
            {{"role", "system"}, {"content", PROMPT}},
            {{"role", "user"}, {"content", valid_content}}
        }},
        {"temperature", 0.7}
    };

    httplib::Headers headers = {
        {"Authorization", "Bearer " + get_api_key()}
    };

    auto res = cli.Post("/compatible-mode/v1/chat/completions", headers, 
                        request_body.dump(), "application/json");

    if (res && res->status == 200) {
        try {
            auto res_json = nlohmann::json::parse(res->body);
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

        if (full_content.length() > MAX_CONTENT_LENGTH) {
            full_content = safe_sub_string(full_content, MAX_CONTENT_LENGTH);
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
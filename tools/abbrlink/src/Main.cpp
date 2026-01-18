#include <iostream>
#include <filesystem>
#include <fstream>
#include <sstream>
#include <iomanip>

#include <openssl/evp.h>

#include "../lib/nlohmann/json.hpp"

auto generateAbbrlink(const std::string& input) -> std::string{
    unsigned char digest[EVP_MAX_MD_SIZE];
    unsigned int digest_len = 0;

    EVP_MD_CTX* ctx = EVP_MD_CTX_new();
    EVP_DigestInit_ex(ctx, EVP_md5(), nullptr);
    EVP_DigestUpdate(ctx, input.data(), input.size());
    EVP_DigestFinal_ex(ctx, digest, &digest_len);
    EVP_MD_CTX_free(ctx);

    std::stringstream ss;
    for (unsigned int i = 0; i < 8; ++i) {
        ss << std::hex << std::setw(2) << std::setfill('0') << (int)digest[i];
    }
    return ss.str().substr(0, 8);
}

auto main(int argc, char* argv[]) -> int {
    if(argc != 2) {
        std::cerr << "[Abbrlink] Usage: abbrlink <posts_root_directory>" << std::endl;
        return 1;
    }

    const std::filesystem::path POST_ROOT = argv[1];

    for(const auto& post_dire : std::filesystem::directory_iterator(POST_ROOT)) {
        if(!post_dire.is_directory()) {
            continue;
        }

        std::filesystem::path abbrlink_file = post_dire.path() / "abbrlink.txt";
        if(std::filesystem::exists(abbrlink_file)) {
            continue;
        }

        std::filesystem::path meta_file = post_dire.path() / "meta.json";
        if(!std::filesystem::exists(meta_file)) {
            std::cerr << "[Abbrlink] meta.json not found in " << post_dire.path() << ", skipping..." << std::endl;
            continue;
        }

        std::ifstream meta_ifs(meta_file);
        nlohmann::json meta_json = nlohmann::json::parse(meta_ifs);

        std::string title = meta_json.value("title", "");
        if (title.empty()) {
            std::cerr << "[Abbrlink] Title missing in " << meta_file << ", skipping..." << std::endl;
            continue;
        }

        std::string abbrlink = generateAbbrlink(title);

        std::ofstream abbrlink_ofs(abbrlink_file, std::ios::out | std::ios::trunc);
        abbrlink_ofs << abbrlink;
        abbrlink_ofs.close();
    }

    return 0;
}